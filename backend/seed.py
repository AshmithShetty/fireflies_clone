import uuid
import random
import datetime
import os
import urllib.request
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models

def generate_conversation(duration_seconds, speakers):
    segments = []
    current_time = 0.0
    
    intros = ["Alright, let's get started.", "Thanks for joining everyone.", "Can everyone hear me?", "Let's kick this off.", "Good morning team."]
    topics = ["I wanted to discuss the latest numbers.", "Let's review the current sprint progress.", "We need to align on the upcoming release.", "There's an issue with the deployment pipeline we should address.", "Let's talk about the new client onboarding process."]
    agreements = ["I agree.", "Sounds good.", "Make sense.", "I'm on board with that.", "Yes, exactly.", "That's a great point."]
    questions = ["What do you think about that?", "Does anyone have concerns?", "Can we get that done by Friday?", "Who is taking ownership of this?", "Any blockers?"]
    answers = ["I can take that on.", "We should be able to hit that deadline.", "I'll need to check with engineering first.", "No blockers on my end.", "I think we need more time."]
    conclusions = ["Let's wrap it up.", "Thanks for the time today.", "We'll follow up offline.", "I'll send out the meeting notes.", "Great meeting everyone."]
    
    is_intro = True
    while current_time < duration_seconds:
        speaker = random.choice(speakers)
        
        if is_intro:
            text = f"{random.choice(intros)} {random.choice(topics)}"
            is_intro = False
        elif current_time > duration_seconds - 30:
            text = random.choice(conclusions)
        else:
            # randomly pick agreement, question, or answer
            text_type = random.choice(['agreement', 'question', 'answer', 'elaboration'])
            if text_type == 'agreement':
                text = random.choice(agreements)
            elif text_type == 'question':
                text = random.choice(questions)
            elif text_type == 'answer':
                text = random.choice(answers)
            else:
                text = f"{random.choice(agreements)} {random.choice(topics)}"
        
        # duration of segment between 3 to 8 seconds
        seg_duration = random.uniform(3.0, 8.0)
        
        # don't exceed max duration too much
        if current_time + seg_duration > duration_seconds:
            seg_duration = duration_seconds - current_time
            text = random.choice(conclusions)
            
        segments.append({
            "speaker_name": speaker.name,
            "start_time": current_time,
            "end_time": current_time + seg_duration,
            "text_content": text
        })
        
        # gap between speakers
        gap = random.uniform(0.5, 2.0)
        current_time += (seg_duration + gap)
        
    return segments

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        db.query(models.Comment).delete()
        db.query(models.ActionItem).delete()
        db.query(models.Summary).delete()
        db.query(models.TranscriptSegment).delete()
        db.query(models.Meeting).delete()
        db.query(models.User).delete()
        db.query(models.Tag).delete()
        db.commit()

        # Seed Users
        user_names = [
            ("user-123", "Default User", "user@example.com"),
            (str(uuid.uuid4()), "Rahul Sharma", "rahul.s@example.com"),
            (str(uuid.uuid4()), "Priya Patel", "priya.p@example.com"),
            (str(uuid.uuid4()), "Amit Singh", "amit.s@example.com"),
            (str(uuid.uuid4()), "Neha Gupta", "neha.g@example.com"),
            (str(uuid.uuid4()), "Vikram Malhotra", "vikram.m@example.com"),
            (str(uuid.uuid4()), "Anjali Desai", "anjali.d@example.com"),
            (str(uuid.uuid4()), "Rohan Mehta", "rohan.m@example.com"),
            (str(uuid.uuid4()), "Sneha Reddy", "sneha.r@example.com"),
            (str(uuid.uuid4()), "Karan Joshi", "karan.j@example.com"),
            (str(uuid.uuid4()), "Pooja Verma", "pooja.v@example.com")
        ]
        
        users = []
        for uid, name, email in user_names:
            u = models.User(id=uid, name=name, email=email)
            users.append(u)
        
        db.add_all(users)
        
        # Seed Tags
        tag_names = ["Engineering", "Planning", "Marketing", "Product", "Client", "Internal"]
        tags = []
        for name in tag_names:
            t = models.Tag(id=str(uuid.uuid4()), name=name)
            tags.append(t)
        db.add_all(tags)
        db.commit()

        # Meeting definitions: (title, duration_minutes)
        # Using 11.75 minutes (705 seconds) for the "15 minute" requirement because the sample video (Tears of Steel) is 12:14 long
        meeting_defs = [
            ("Q3 Architecture Planning", 11.75), 
            ("Weekly Product Standup", 5),
            ("Q4 Marketing Sync", 11.75),
            ("Client Onboarding: Acme Corp", 11.75),
            ("Design Review: Mobile App", 5),
            ("Engineering All Hands", 5),
            ("1:1 Sync", 5)
        ]

        now = datetime.datetime.now(datetime.timezone.utc)
        
        for i, (title, dur_mins) in enumerate(meeting_defs):
            meeting_id = str(uuid.uuid4())
            dur_secs = dur_mins * 60
            
            # Select random participants (2 to 4)
            participants = random.sample(users, k=random.randint(2, 4))
            meeting_tags = random.sample(tags, k=random.randint(1, 3))
            
            meeting = models.Meeting(
                id=meeting_id,
                title=title,
                date=(now - datetime.timedelta(days=i)).isoformat(),
                duration=dur_secs,
                media_url="/video.mp4"
            )
            meeting.participants.extend(participants)
            meeting.tags.extend(meeting_tags)
            db.add(meeting)
            db.commit()
            
            # Generate transcript
            segs_data = generate_conversation(dur_secs, participants)
            db_segments = []
            for s in segs_data:
                db_segments.append(
                    models.TranscriptSegment(
                        id=str(uuid.uuid4()),
                        meeting_id=meeting_id,
                        speaker_name=s["speaker_name"],
                        start_time=s["start_time"],
                        end_time=s["end_time"],
                        text_content=s["text_content"]
                    )
                )
            db.add_all(db_segments)
            
            # Generate dynamic summary and action items based on title
            overview = f"The team met to discuss {title}. "
            topics_list = []
            a_items = []
            
            if "Architecture" in title or "Engineering" in title:
                overview += "The primary focus was on technical infrastructure, database scalability, and managing technical debt."
                topics_list = ["- Current Architecture Review\n- Scalability Bottlenecks\n- Cloud Provider Options\n- Next Sprint Goals"]
                a_items = ["Draft technical brief for migration", "Review PR #452 for caching strategy", "Schedule follow-up architecture review"]
            elif "Marketing" in title:
                overview += "Discussions revolved around campaign performance, Q4 ad spend, and brand awareness initiatives."
                topics_list = ["- Campaign ROI Analysis\n- Q4 Budget Allocation\n- Social Media Strategy\n- Influencer Partnerships"]
                a_items = ["Approve finalized ad creatives by Wednesday", "Send Q4 budget report to finance", "Contact new influencer leads"]
            elif "Client" in title:
                overview += "The meeting covered project milestones, deliverable timelines, and addressing the client's recent feedback."
                topics_list = ["- Project Kickoff\n- Establishing Timelines\n- Risk Mitigation\n- Q&A with Client"]
                a_items = ["Send welcome packet to Acme Corp", "Finalize the statement of work (SOW)", "Schedule weekly touchpoint meetings"]
            elif "Design" in title:
                overview += "The design team reviewed wireframes, user flow improvements, and the new component library updates."
                topics_list = ["- Wireframe Feedback\n- Design System Updates\n- User Testing Results\n- Handoff to Dev"]
                a_items = ["Update Figma component library with new colors", "Fix padding issues on mobile views", "Prepare assets for frontend team"]
            else:
                overview += "Participants shared updates on their current tasks, identified minor blockers, and aligned on priorities for the week."
                topics_list = ["- Round Robin Updates\n- Identifying Blockers\n- Prioritization\n- Wrapping Up"]
                a_items = ["Update JIRA board with current status", "Follow up offline regarding blockers", "Prepare for tomorrow's standup"]
            
            summary = models.Summary(
                id=str(uuid.uuid4()),
                meeting_id=meeting_id,
                overview_text=overview,
                key_topics=topics_list[0]
            )
            db.add(summary)
            
            # Generate action items
            db_action_items = []
            for a_desc in a_items:
                is_comp = random.choice([True, False])
                db_action_items.append(
                    models.ActionItem(id=str(uuid.uuid4()), meeting_id=meeting_id, description=a_desc, is_completed=is_comp)
                )
            db.add_all(db_action_items)
            db.commit()

        print("Database seeded successfully with robust mock data.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()