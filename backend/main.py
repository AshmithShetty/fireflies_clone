# Exposes REST API endpoints for meeting data management, FTS5 global search, and Groq LLM interaction.

import uuid
import json
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import engine, Base, get_db, init_fts
import models
import schemas

# Initialize core structure and search modules
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

@app.get("/api/meetings", response_model=List[schemas.MeetingListResponse])
def get_meetings(db: Session = Depends(get_db)):
    return db.query(models.Meeting).all()

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
    fts_results = db.execute(
        f"SELECT segment_id, meeting_id, speaker_name, text_content FROM transcript_fts WHERE transcript_fts MATCH :query",
        {"query": q}
    ).fetchall()
    
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