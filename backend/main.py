# Exposes REST API endpoints including LLM chat interactions and document exports.

import uuid
import os
import io
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from dotenv import load_dotenv
from groq import Groq
from fpdf import FPDF
from datetime import datetime, timedelta, timezone
import json

from database import engine, Base, get_db, init_fts
import models
import schemas

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama3-8b-8192")

Base.metadata.create_all(bind=engine)
init_fts(engine)

app = FastAPI(title="Fireflies Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MOCK_USER_ID = "user-123"

@app.get("/api/auth/me", response_model=schemas.UserBase)
def get_current_user(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == MOCK_USER_ID).first()
    if not user:
        user = models.User(id=MOCK_USER_ID, name="Default User", email="user@example.com", avatar_url=None)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@app.get("/api/users", response_model=List[schemas.UserBase])
def get_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

@app.get("/api/tags", response_model=List[schemas.TagBase])
def get_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()

@app.post("/api/tags", response_model=schemas.TagBase, status_code=status.HTTP_201_CREATED)
def create_tag(payload: schemas.TagCreate, db: Session = Depends(get_db)):
    # check if exists
    existing = db.query(models.Tag).filter(models.Tag.name.ilike(payload.name)).first()
    if existing:
        return existing
        
    tag = models.Tag(id=str(uuid.uuid4()), name=payload.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@app.get("/api/meetings", response_model=List[schemas.MeetingListResponse])
def get_meetings(
    search: Optional[str] = Query(None),
    date_filter: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Meeting)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            models.Meeting.title.ilike(search_pattern) | 
            models.Meeting.participants.any(models.User.name.ilike(search_pattern))
        )
        
    if tag and tag != "All Tags":
        query = query.filter(models.Meeting.tags.any(models.Tag.name == tag))
        
    if date_filter and date_filter != "All Time":
        now = datetime.now(timezone.utc)
        if date_filter == "Today":
            today_str = now.date().isoformat()
            query = query.filter(models.Meeting.date >= today_str)
        elif date_filter == "Past 7 Days":
            past_week_str = (now - timedelta(days=7)).isoformat()
            query = query.filter(models.Meeting.date >= past_week_str)
        elif date_filter == "Past 30 Days":
            past_month_str = (now - timedelta(days=30)).isoformat()
            query = query.filter(models.Meeting.date >= past_month_str)

    return query.order_by(models.Meeting.date.desc()).all()

@app.get("/api/meetings/{meeting_id}/details", response_model=schemas.MeetingDetailResponse)
def get_meeting_details(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@app.post("/api/meetings", response_model=schemas.MeetingListResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    meeting_id = str(uuid.uuid4())
    new_meeting = models.Meeting(
        id=meeting_id,
        title=payload.title,
        date=payload.date,
        duration=payload.duration,
        media_url=None
    )
    
    for p_id in payload.participant_ids:
        user = db.query(models.User).filter(models.User.id == p_id).first()
        if user:
            new_meeting.participants.append(user)
            
    for t_name in payload.tag_names:
        tag = db.query(models.Tag).filter(models.Tag.name == t_name).first()
        if not tag:
            tag = models.Tag(id=str(uuid.uuid4()), name=t_name)
            db.add(tag)
        new_meeting.tags.append(tag)

    db.add(new_meeting)
    db.commit()

    if payload.transcript:
        lines = [line.strip() for line in payload.transcript.split("\n") if line.strip()]
        current_time = 0.0
        db_segments = []
        for line in lines:
            seg = models.TranscriptSegment(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                speaker_name="Speaker",
                start_time=current_time,
                end_time=current_time + 5.0,
                text_content=line
            )
            db_segments.append(seg)
            current_time += 5.0
        db.add_all(db_segments)
        db.commit()
        
        prompt = f"""You are an AI meeting assistant. Based on this transcript, generate a rich "Super Summary".
Output ONLY JSON in this format:
{{
  "overview": "A short 1-2 sentence overview of the meeting.",
  "sentiment": "Positive, Neutral, or Negative",
  "chapters": [
    {{"timestamp": "00:00", "title": "Introduction", "summary": "Brief summary of chapter"}}
  ],
  "action_items": [
    {{"task": "Action item description", "assignee": "Person's name or Unassigned"}}
  ]
}}

Transcript:
{payload.transcript[:8000]}"""
        
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                response_format={"type": "json_object"}
            )
            result = json.loads(chat_completion.choices[0].message.content)
            
            sentiment = result.get("sentiment", "Neutral")
            chapters_md = f"**Overall Sentiment:** {sentiment}\\n\\n### Chapters\\n"
            for ch in result.get("chapters", []):
                chapters_md += f"- **{ch.get('timestamp', '00:00')} - {ch.get('title', 'Topic')}**: {ch.get('summary', '')}\\n"
                
            summary = models.Summary(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                overview_text=result.get("overview", "Generated overview"),
                key_topics=chapters_md
            )
            db.add(summary)
            
            items = result.get("action_items", [])
            for item in items:
                task = item.get("task", "")
                assignee = item.get("assignee", "Unassigned")
                if task:
                    a_item = models.ActionItem(
                        id=str(uuid.uuid4()),
                        meeting_id=meeting_id,
                        description=f"[{assignee}] {task}",
                        is_completed=False
                    )
                    db.add(a_item)
            db.commit()
        except Exception as e:
            summary = models.Summary(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                overview_text="Meeting transcript uploaded successfully. AI processing failed.",
                key_topics="- Transcript Review"
            )
            db.add(summary)
            db.commit()

    db.refresh(new_meeting)
    return new_meeting

@app.put("/api/meetings/{meeting_id}", response_model=schemas.MeetingListResponse)
def update_meeting_metadata(meeting_id: str, payload: schemas.MeetingMetadataUpdate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if payload.title is not None:
        meeting.title = payload.title
        
    if payload.participant_ids is not None:
        meeting.participants = []
        for p_id in payload.participant_ids:
            user = db.query(models.User).filter(models.User.id == p_id).first()
            if user:
                meeting.participants.append(user)
                
    db.commit()
    db.refresh(meeting)
    return meeting

@app.delete("/api/meetings/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    db.delete(meeting)
    db.commit()
    return None

@app.post("/api/action-items", response_model=schemas.ActionItemBase, status_code=status.HTTP_201_CREATED)
def create_action_item(payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == payload.meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    item = models.ActionItem(
        id=str(uuid.uuid4()),
        meeting_id=payload.meeting_id,
        description=payload.description,
        is_completed=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@app.put("/api/action-items/{item_id}", response_model=schemas.ActionItemBase)
def update_action_item(item_id: str, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    if payload.description is not None:
        item.description = payload.description
    if payload.is_completed is not None:
        item.is_completed = payload.is_completed
        
    db.commit()
    db.refresh(item)
    return item

@app.post("/api/comments", response_model=schemas.CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(payload: schemas.CommentCreate, db: Session = Depends(get_db)):
    segment = db.query(models.TranscriptSegment).filter(models.TranscriptSegment.id == payload.segment_id).first()
    if not segment:
        raise HTTPException(status_code=404, detail="Transcript segment not found")
    
    comment = models.Comment(
        id=str(uuid.uuid4()),
        segment_id=payload.segment_id,
        user_id=MOCK_USER_ID,
        text=payload.text
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment

@app.get("/api/search", response_model=List[schemas.GlobalSearchMatch])
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    safe_q = q.replace('"', '""').replace("'", "''")
    try:
        fts_results = db.execute(
            "SELECT segment_id, meeting_id, speaker_name, text_content FROM transcript_fts WHERE transcript_fts MATCH :query",
            {"query": f'"{safe_q}"'}
        ).fetchall()
    except Exception:
        fts_results = []
    
    matches = []
    for row in fts_results:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == row.meeting_id).first()
        meeting_title = meeting.title if meeting else "Unknown Meeting"
        matches.append(
            schemas.GlobalSearchMatch(
                meeting_id=row.meeting_id,
                meeting_title=meeting_title,
                segment_id=row.segment_id,
                speaker_name=row.speaker_name,
                text_content=row.text_content
            )
        )
        
    meeting_title_matches = db.query(models.Meeting).filter(models.Meeting.title.like(f"%{q}%")).all()
    for m in meeting_title_matches:
        if not any(x.meeting_id == m.id and x.segment_id is None for x in matches):
            matches.append(
                schemas.GlobalSearchMatch(
                    meeting_id=m.id,
                    meeting_title=m.title,
                    segment_id=None,
                    speaker_name=None,
                    text_content=None
                )
            )
            
    return matches

@app.get("/api/meetings/{meeting_id}/search", response_model=List[schemas.TranscriptSegmentBase])
def search_meeting_transcript(meeting_id: str, q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    safe_q = q.replace('"', '""').replace("'", "''")
    try:
        fts_results = db.execute(
            "SELECT segment_id FROM transcript_fts WHERE meeting_id = :mid AND transcript_fts MATCH :query",
            {"mid": meeting_id, "query": f'"{safe_q}"'}
        ).fetchall()
    except Exception:
        fts_results = []
        
    segment_ids = [row.segment_id for row in fts_results]
    if not segment_ids:
        return []
        
    segments = db.query(models.TranscriptSegment).filter(models.TranscriptSegment.id.in_(segment_ids)).order_by(models.TranscriptSegment.start_time).all()
    return segments

@app.post("/api/meetings/{meeting_id}/chat", response_model=schemas.ChatResponse)
def chat_with_meeting(meeting_id: str, payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    transcript_text = "\\n".join([f"{seg.speaker_name}: {seg.text_content}" for seg in meeting.transcript_segments])
    summary_text = meeting.summary.overview_text if meeting.summary else "No summary available."
    
    prompt = f"You are an AI meeting assistant discussing the meeting '{meeting.title}' (Date: {meeting.date}).\\nMeeting Summary: {summary_text}\\n\\nFull Transcript:\\n{transcript_text}\\n\\nQuestion: {payload.question}\\nAnswer concisely:"
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL,
        )
        return schemas.ChatResponse(answer=chat_completion.choices[0].message.content)
    except Exception:
        return schemas.ChatResponse(answer="Sorry, I encountered an error generating the response. The transcript might be too long for my context window.")

@app.post("/api/chat", response_model=schemas.ChatResponse)
def global_chat(payload: schemas.ChatRequest, db: Session = Depends(get_db)):
    system_prompt = """You are AskFred, an advanced AI assistant for a meeting platform.
You have access to the following tools:
1. `list_recent_meetings`: arguments {"limit": int} - Get a chronological list of recent meetings.
2. `search_meeting_metadata`: arguments {"query": string} - Search meeting titles, summaries, and key topics.
3. `search_transcripts`: arguments {"query": string} - Search raw transcripts for exact quotes and granular details.

You MUST operate in a thought-action loop. For EVERY turn, you must output a valid JSON object matching EXACTLY this schema:
{
    "thought": "Your internal monologue explaining your reasoning",
    "tool_name": "The name of the tool to use, or null if you have enough information to answer the user",
    "tool_args": {"arg_name": "arg_value"},
    "final_answer": "The final markdown formatted answer to the user, or null if you are using a tool"
}

IMPORTANT:
- If you need to use a tool, `tool_name` must be the string name of the tool, `tool_args` must be the arguments object, and `final_answer` MUST be null.
- If you have the answer for the user, `tool_name` MUST be null, and `final_answer` MUST contain the text to show the user.
- NEVER return anything outside of this JSON object.
"""

    messages = [{"role": "system", "content": system_prompt}]

    if payload.messages:
        for m in payload.messages:
            messages.append({"role": m.role, "content": m.content})
    elif payload.question:
        messages.append({"role": "user", "content": payload.question})

    import json
    import groq

    max_loops = 5
    for loop_count in range(max_loops):
        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=GROQ_MODEL,
                response_format={"type": "json_object"}
            )
            response_text = chat_completion.choices[0].message.content
            
            try:
                action = json.loads(response_text)
            except:
                return schemas.ChatResponse(answer="Sorry, I ran into a JSON parsing error internally.")

            if action.get("final_answer"):
                return schemas.ChatResponse(answer=action["final_answer"])
                
            tool_name = action.get("tool_name")
            tool_args = action.get("tool_args", {})
            
            if not tool_name:
                # Edge case where model didn't provide a tool or an answer
                messages.append({"role": "assistant", "content": response_text})
                messages.append({"role": "user", "content": "You didn't provide a tool or a final_answer. Please try again."})
                continue
            
            tool_result = ""
            if tool_name == "list_recent_meetings":
                limit = tool_args.get("limit", 5)
                meetings = db.query(models.Meeting).order_by(models.Meeting.date.desc()).limit(limit).all()
                res = [f"- {m.title} on {m.date}" for m in meetings]
                tool_result = "\n".join(res) if res else "No meetings found."
            elif tool_name == "search_meeting_metadata":
                q = tool_args.get("query", "").lower()
                meetings = db.query(models.Meeting).all()
                res = []
                for m in meetings:
                    summary = m.summary.overview_text if m.summary else ""
                    topics = m.summary.key_topics if m.summary else ""
                    if q in m.title.lower() or q in summary.lower() or q in topics.lower():
                        res.append(f"Meeting: {m.title} ({m.date})\nSummary: {summary}\nTopics: {topics}\n")
                tool_result = "\n".join(res[:5]) if res else f"No meetings found matching '{q}'."
            elif tool_name == "search_transcripts":
                q = tool_args.get("query", "")
                safe_q = q.replace('"', '""')
                try:
                    fts_results = db.execute(
                        "SELECT segment_id, meeting_id FROM transcript_fts WHERE transcript_fts MATCH :query LIMIT 10",
                        {"query": f'"{safe_q}"'}
                    ).fetchall()
                except Exception:
                    fts_results = []
                
                if not fts_results:
                    words = q.split()
                    or_query = " OR ".join([f'"{w}"' for w in words if len(w) > 3])
                    if or_query:
                        try:
                            fts_results = db.execute(
                                "SELECT segment_id, meeting_id FROM transcript_fts WHERE transcript_fts MATCH :query LIMIT 10",
                                {"query": or_query}
                            ).fetchall()
                        except Exception:
                            fts_results = []
                            
                res = []
                for row in fts_results:
                    meeting = db.query(models.Meeting).filter(models.Meeting.id == row.meeting_id).first()
                    m_title = meeting.title if meeting else "Unknown"
                    matched_seg = db.query(models.TranscriptSegment).filter(models.TranscriptSegment.id == row.segment_id).first()
                    if not matched_seg: continue
                    
                    surrounding = db.query(models.TranscriptSegment).filter(
                        models.TranscriptSegment.meeting_id == row.meeting_id,
                        models.TranscriptSegment.start_time >= matched_seg.start_time - 30,
                        models.TranscriptSegment.start_time <= matched_seg.start_time + 30
                    ).order_by(models.TranscriptSegment.start_time.asc()).all()
                    
                    chunk_text = "\n".join([f"{s.speaker_name}: {s.text_content}" for s in surrounding])
                    res.append(f"[{m_title}] CONTEXT CHUNK:\n{chunk_text}")
                    
                tool_result = "\n---\n".join(res) if res else f"No transcripts found for '{q}'."
            else:
                tool_result = f"Unknown tool: {tool_name}"

            # Append the assistant's action, and the system's response
            messages.append({"role": "assistant", "content": response_text})
            messages.append({"role": "user", "content": f"Tool '{tool_name}' returned:\n{tool_result}\n\nPlease proceed to output the next JSON action."})

        except Exception as e:
            return schemas.ChatResponse(answer=f"Sorry, an error occurred during processing: {str(e)}")

    return schemas.ChatResponse(answer="Sorry, I ran out of time while thinking about your request. Please try again.")

@app.get("/api/meetings/{meeting_id}/export")
def export_meeting(meeting_id: str, format: str = Query("txt", pattern="^(txt|md|pdf)$"), db: Session = Depends(get_db)):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
        
    lines = []
    lines.append(f"Meeting: {meeting.title}")
    lines.append(f"Date: {meeting.date}")
    lines.append("\n--- TRANSCRIPT ---\n")
    for seg in meeting.transcript_segments:
        lines.append(f"{seg.speaker_name}: {seg.text_content}")
        
    content = "\n".join(lines)
    
    if format == "txt":
        return PlainTextResponse(content=content, headers={"Content-Disposition": f"attachment; filename={meeting.title}.txt"})
    elif format == "md":
        md_content = f"# {meeting.title}\n**Date:** {meeting.date}\n\n## Transcript\n\n"
        for seg in meeting.transcript_segments:
            md_content += f"**{seg.speaker_name}:** {seg.text_content}\n\n"
        return PlainTextResponse(content=md_content, media_type="text/markdown", headers={"Content-Disposition": f"attachment; filename={meeting.title}.md"})
    elif format == "pdf":
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=12)
        pdf.multi_cell(0, 10, txt=content.encode("latin-1", "replace").decode("latin-1"))
        pdf_bytes = bytes(pdf.output())
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={meeting.title}.pdf"})