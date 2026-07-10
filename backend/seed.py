# Populates the SQLite database with robust mocked meeting data for local testing.

import uuid
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models

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

        user1_id = "user-123"
        user1 = models.User(id=user1_id, name="Default User", email="user@example.com")
        
        user2_id = str(uuid.uuid4())
        user2 = models.User(id=user2_id, name="Sarah Chen", email="sarah.c@example.com")
        
        db.add_all([user1, user2])
        
        tag1 = models.Tag(id=str(uuid.uuid4()), name="Engineering")
        tag2 = models.Tag(id=str(uuid.uuid4()), name="Planning")
        db.add_all([tag1, tag2])

        meeting1_id = str(uuid.uuid4())
        meeting1 = models.Meeting(
            id=meeting1_id,
            title="Q3 Architecture Planning",
            date="2026-07-10T10:00:00Z",
            duration=1800.0,
            media_url="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
        )
        meeting1.participants.extend([user1, user2])
        meeting1.tags.extend([tag1, tag2])
        db.add(meeting1)
        db.commit()

        segments = [
            models.TranscriptSegment(id=str(uuid.uuid4()), meeting_id=meeting1_id, speaker_name="Default User", start_time=0.0, end_time=5.5, text_content="Alright, let us get started on the Q3 architecture planning."),
            models.TranscriptSegment(id=str(uuid.uuid4()), meeting_id=meeting1_id, speaker_name="Sarah Chen", start_time=6.0, end_time=12.0, text_content="Sounds good. I think our main priority needs to be scaling the database to handle the new user load."),
            models.TranscriptSegment(id=str(uuid.uuid4()), meeting_id=meeting1_id, speaker_name="Default User", start_time=12.5, end_time=20.0, text_content="I agree. We should migrate the read-heavy queries to a dedicated replica. I will draft a technical brief on that by Friday."),
            models.TranscriptSegment(id=str(uuid.uuid4()), meeting_id=meeting1_id, speaker_name="Sarah Chen", start_time=20.5, end_time=28.0, text_content="Perfect. Also, please make sure we review the caching strategy before we deploy the new API endpoints."),
            models.TranscriptSegment(id=str(uuid.uuid4()), meeting_id=meeting1_id, speaker_name="Default User", start_time=28.5, end_time=32.0, text_content="Will do. Let us sync up again on Monday to review the progress.")
        ]
        db.add_all(segments)

        summary = models.Summary(
            id=str(uuid.uuid4()),
            meeting_id=meeting1_id,
            overview_text="The team discussed the Q3 architecture priorities, focusing primarily on database scalability and caching strategies to handle upcoming user loads.",
            key_topics="- Database Scaling\n- Read Replica Migration\n- API Caching Strategy"
        )
        db.add(summary)

        action_items = [
            models.ActionItem(id=str(uuid.uuid4()), meeting_id=meeting1_id, description="Draft technical brief on read replica migration by Friday", is_completed=False),
            models.ActionItem(id=str(uuid.uuid4()), meeting_id=meeting1_id, description="Review caching strategy for new API endpoints", is_completed=False),
            models.ActionItem(id=str(uuid.uuid4()), meeting_id=meeting1_id, description="Schedule follow-up sync for Monday", is_completed=True)
        ]
        db.add_all(action_items)

        db.commit()
        print("Database seeded successfully with mock data.")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()