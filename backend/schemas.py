# Defines Pydantic validation models for structured API request and response bodies.

from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    id: str
    name: str
    email: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class TagBase(BaseModel):
    id: str
    name: str

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    id: str
    meeting_id: str
    description: str
    is_completed: bool

    class Config:
        from_attributes = True

class ActionItemCreate(BaseModel):
    meeting_id: str
    description: str

class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TranscriptSegmentBase(BaseModel):
    id: str
    meeting_id: str
    speaker_name: str
    start_time: float
    end_time: float
    text_content: str
    comments: List["CommentResponse"] = []

    class Config:
        from_attributes = True

class SummaryBase(BaseModel):
    id: str
    meeting_id: str
    overview_text: str
    key_topics: str

    class Config:
        from_attributes = True

class MeetingListResponse(BaseModel):
    id: str
    title: str
    date: str
    duration: float
    media_url: Optional[str] = None
    participants: List[UserBase]
    tags: List[TagBase]

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    title: str
    date: str
    duration: float
    participant_ids: List[str]
    tag_names: List[str]

class MeetingMetadataUpdate(BaseModel):
    title: Optional[str] = None
    participant_ids: Optional[List[str]] = None

class MeetingDetailResponse(BaseModel):
    id: str
    title: str
    date: str
    duration: float
    media_url: Optional[str] = None
    participants: List[UserBase]
    tags: List[TagBase]
    transcript_segments: List[TranscriptSegmentBase]
    summary: Optional[SummaryBase] = None
    action_items: List[ActionItemBase]

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    segment_id: str
    text: str

class CommentResponse(BaseModel):
    id: str
    segment_id: str
    user_id: str
    text: str

    class Config:
        from_attributes = True

class GlobalSearchMatch(BaseModel):
    meeting_id: str
    meeting_title: str
    segment_id: Optional[str] = None
    speaker_name: Optional[str] = None
    text_content: Optional[str] = None

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str