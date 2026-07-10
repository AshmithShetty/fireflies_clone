# Fireflies.ai Clone

A functional clone of the Fireflies.ai meeting-assistant web application. This platform allows users to browse a library of meetings, view interactive transcripts with speaker labels and timestamps, read AI-generated summaries, chat with an LLM about the meeting content, and experience a pixel-perfect replica of the modern Fireflies workspace UI.

## Project Overview & Features
This project replicates the core post-meeting workflows and design aesthetics of Fireflies.ai.
- **Meetings Library / Dashboard**: Filterable, sortable list of past meetings matching the Fireflies UI.
- **Interactive Transcript Detail View**: Split-screen view featuring a custom-built media player, interactive transcript with speaker timestamps, and AI-generated summary panels.
- **Custom Media Player**: A fully custom React video player that ingeniously mocks long-form meeting durations (e.g., 15 minutes) while looping a lightweight local 10s video, supporting seamless transcript-to-video timestamp seeking.
- **Dynamic AI Context**: Action items, key topics, and AI summaries are dynamically generated based on the specific meeting title (e.g., Engineering, Marketing, Design).
- **Meeting Management (CRUD)**: Create, edit, and delete meetings, along with dynamic action item checklists and custom tag creation.
- **1:1 UI Overhaul**: Sidebar navigation, mocked placeholder pages for settings, AI skills, voice agents, and AskFred integrations matching the modern Fireflies dashboard perfectly.

## Tech Stack Used
- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, Shadcn UI (Radix Primitives), Zustand (State Management), Lucide React (Icons).
- **Backend**: FastAPI (Python), Uvicorn, Pydantic, SQLAlchemy ORM.
- **Database**: SQLite with FTS5 for native full-text global search.
- **AI Integration**: Groq API integration using Llama 3 for the "Ask AI" / AskFred chat feature (with context-aware transcript injection).

## Architecture Overview
The application follows a modern decoupled architecture. The frontend (Next.js) handles UI rendering, client-side routing, and state management, communicating via RESTful API calls to the Python backend. The backend (FastAPI) manages business logic, SQLite database interactions via SQLAlchemy, and proxies external requests to the Groq LLM API to generate AI summaries and handle conversational AI queries over transcripts.

## Database Schema
The database uses SQLite with the following core entities:
- **`users`**: `id` (PK), `name`, `email`, `avatar_url`
- **`meetings`**: `id` (PK), `title`, `date`, `duration`, `media_url`
- **`meeting_participants`**: Many-to-many relationship mapping `users` to `meetings`.
- **`transcript_segments`**: `id` (PK), `meeting_id` (FK), `speaker_name`, `start_time`, `end_time`, `text_content`
- **`transcript_comments`**: `id` (PK), `segment_id` (FK), `user_id` (FK), `text`, `timestamp`
- **`summaries`**: `id` (PK), `meeting_id` (FK), `overview_text`, `key_topics` (JSON/String)
- **`action_items`**: `id` (PK), `meeting_id` (FK), `description`, `is_completed` (Boolean)
- **`tags`**: `id` (PK), `name` (with a many-to-many relationship mapping tags to meetings).

## API Overview
The FastAPI backend exposes the following primary endpoints:
- `GET /api/meetings`: Fetch all meetings (supports query params for filtering/searching).
- `GET /api/meetings/{id}`: Fetch detailed meeting data including transcripts, participants, and summaries.
- `POST /api/meetings`: Create a new meeting.
- `PUT /api/meetings/{id}`: Update meeting metadata (title, tags, etc).
- `DELETE /api/meetings/{id}`: Delete a meeting and its associated data.
- `GET /api/tags`: Fetch all available tags.
- `POST /api/action-items`: Add a new action item to a meeting.
- `PUT /api/action-items/{id}`: Update/toggle completion of an action item.
- `POST /api/chat`: Send a query to the Groq LLM context-aware AskFred chat.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create and activate a virtual environment:
   - Windows: `python -m venv .venv` then `.\.venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv .venv` then `source .venv/bin/activate`
3. Install dependencies: `pip install fastapi uvicorn sqlalchemy pydantic groq python-dotenv fpdf2`
4. Configure environment variables. Copy the `.env.example` file to `backend/.env` and add your GROQ API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   GROQ_MODEL=llama-3.1-8b-instant
   ```
5. *Note: Ensure you have placed a small `video.mp4` file inside `frontend/public/` to serve as the visual loop for the custom media player!*
6. Seed the database with sample data: `python seed.py`
7. Run the server: `uvicorn main:app --reload` (Runs on `http://localhost:8000`)

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `frontend/.env.local` (if needed, default API points to `http://localhost:8000/api`)
4. Run the development server: `npm run dev`
5. Open `http://localhost:3000` in your browser.

## Assumptions Made
1. **Mocked Audio/Transcription:** Real speech-to-text processing is out of scope. Transcripts and summaries are pre-seeded in the database to mimic real usage.
2. **User Authentication:** Real authentication is bypassed. A default logged-in user context is assumed globally on the client side using a Zustand store.
3. **Static Placeholder Pages:** Pages such as Integrations, Voice Agents, AI Skills, and Settings are built as visually-accurate static layouts representing the Fireflies aesthetic but do not have backend logic tied to them.