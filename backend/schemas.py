# Defines Pydantic validation models for structured API request and response bodies.

from pydantic import BaseModel
from typing import List, Optional

class UserBase(BaseModel):
    id: string
    name: string
    email: string
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

class TagBase(BaseModel):
    id: string
    name: string

    class Config:
        from_attributes = True

class ActionItemBase(BaseModel):
    id: string
    meeting_id: string
    description: string
    is_completed: bool

    class Config:
        from_attributes = True

class ActionItemCreate(BaseModel):
    meeting_id: string
    description: string

class ActionItemUpdate(BaseModel):
    description: Optional[str] = None
    is_completed: Optional[bool] = None

class TranscriptSegmentBase(BaseModel):
    id: string
    meeting_id: string
    speaker_name: string
    start_time: float
    end_time: float
    text_content: string

    class Config:
        from_attributes = True

class SummaryBase(BaseModel):
    id: string
    meeting_id: string
    overview_text: string
    key_topics: string

    class Config:
        from_attributes = True

class MeetingListResponse(BaseModel):
    id: string
    title: string
    date: string
    duration: float
    media_url: Optional[str] = None
    participants: List[UserBase]
    tags: List[TagBase]

    class Config:
        from_attributes = True

class MeetingCreate(BaseModel):
    title: string
    date: string
    duration: float
    participant_ids: List[str]
    tag_names: List[str]

class MeetingMetadataUpdate(BaseModel):
    title: Optional[str] = None
    participant_ids: Optional[List[str]] = None

class MeetingDetailResponse(BaseModel):
    id: string
    title: string
    date: string
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
    segment_id: string
    text: string

class CommentResponse(BaseModel):
    id: string
    segment_id: string
    user_id: string
    text: string

    class Config:
        from_attributes = True

class GlobalSearchMatch(BaseModel):
    meeting_id: string
    meeting_title: string
    segment_id: Optional[str] = None
    speaker_name: Optional[str] = None
    text_content: Optional[str] = None