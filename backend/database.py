# Configures the SQLite engine, session maker, and FTS5 full-text search triggers.

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./fireflies_clone.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

def init_fts(engine_instance):
    with engine_instance.begin() as conn:
        conn.exec_driver_sql("""
            CREATE VIRTUAL TABLE IF NOT EXISTS transcript_fts USING fts5(
                segment_id,
                meeting_id,
                speaker_name,
                text_content
            );
        """)
        conn.exec_driver_sql("""
            CREATE TRIGGER IF NOT EXISTS after_transcript_insert AFTER INSERT ON transcript_segments BEGIN
                INSERT INTO transcript_fts(segment_id, meeting_id, speaker_name, text_content)
                VALUES (new.id, new.meeting_id, new.speaker_name, new.text_content);
            END;
        """)
        conn.exec_driver_sql("""
            CREATE TRIGGER IF NOT EXISTS after_transcript_delete AFTER DELETE ON transcript_segments BEGIN
                DELETE FROM transcript_fts WHERE segment_id = old.id;
            END;
        """)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()