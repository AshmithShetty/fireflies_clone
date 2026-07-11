# Fireflies.ai Clone

A highly functional, full-stack clone of the Fireflies.ai meeting-assistant web application. This platform allows users to browse a library of meetings, view interactive transcripts with speaker labels and timestamps, read AI-generated summaries, chat dynamically with an advanced LLM (AskFred) about the meeting content across their entire workspace, and experience a pixel-perfect replica of the modern Fireflies workspace UI.

## Live Demo
- **Frontend (Vercel)**: [https://fireflies-clone-ten.vercel.app/](https://fireflies-clone-ten.vercel.app/)
- **Backend API (Render)**: [https://fireflies-backend-g2np.onrender.com/](https://fireflies-backend-g2np.onrender.com/)
- **GitHub Repository**: [https://github.com/AshmithShetty/fireflies_clone](https://github.com/AshmithShetty/fireflies_clone)

## Project Overview & Core Features
This project replicates the core post-meeting workflows and design aesthetics of Fireflies.ai.
- **Meetings Library / Dashboard**: Filterable, sortable list of past meetings matching the Fireflies UI.
- **Interactive Transcript Detail View**: Split-screen view featuring a custom-built media player, interactive transcript with speaker timestamps, and AI-generated summary panels.
- **Custom Media Player**: A fully custom React video player that mocks long-form meeting durations while looping a lightweight local 10s video, supporting seamless transcript-to-video timestamp seeking.
- **Global AskFred AI**: A deeply integrated chat assistant powered by a 70B parameter Llama 3 model on Groq. AskFred features **Conversation Memory**, allowing for continuous contextual follow-ups. AskFred natively utilizes multiple tools to query your database:
  - `search_meeting_metadata`: Instantly searches across Meeting Summaries and Topics to answer high-level questions blazingly fast.
  - `search_transcripts`: Performs deep semantic searches on raw transcript segments, extracting the exact quote along with 30-second context chunks of surrounding conversation.
  - `list_recent_meetings`: Fetches a chronological list of meetings across your workspace.
- **Meeting Management (CRUD)**: Create, edit, and delete meetings, along with dynamic action item checklists and custom tag creation.
- **1:1 UI Overhaul**: Sidebar navigation, mocked placeholder pages for settings, AI skills, voice agents, and AskFred integrations matching the modern Fireflies dashboard perfectly.

## Tech Stack
- **Frontend**: Next.js (App Router, React), Tailwind CSS, Shadcn UI (Radix Primitives), Zustand (State Management), Lucide React (Icons).
- **Backend**: FastAPI (Python), Uvicorn, Pydantic, SQLAlchemy ORM.
- **Database**: SQLite with FTS5 for native full-text global search.
- **AI Integration**: Groq API integration using Llama 3.3 70B for the "Ask AI" / AskFred chat feature (with strict fallback parsers for native tool calling).

## Architecture Overview
The application follows a modern decoupled architecture. The frontend (Next.js) handles UI rendering, client-side routing, and state management, communicating via RESTful API calls to the Python backend. The backend (FastAPI) manages business logic, SQLite database interactions via SQLAlchemy, and proxies external requests to the Groq LLM API. 

**AskFred ReAct Engine**: Instead of relying on unstable native tool-calling features from LLM providers, AskFred runs on a highly robust, custom-built ReAct (Reasoning & Acting) loop inside the Python backend. The 70B model operates in strict JSON Mode, outputting its internal monologue and tool selection. The backend seamlessly intercepts these tool requests, executes the Python functions to fetch data from the SQLite database, and loops the results back to the LLM until a final synthesized answer is generated.

## Database Schema
The backend uses **SQLite** mapped via **SQLAlchemy ORM**. The schema is structured as follows:
- **`users`**: Stores participant details (`id`, `name`, `email`, `avatar_url`).
- **`meetings`**: Core meeting metadata (`id`, `title`, `date`, `duration`, `media_url`).
  - *Relationships*: Many-to-many with `users` (via `meeting_participants`) and `tags` (via `meeting_tags`).
- **`tags`**: Custom labels for meetings (`id`, `name`).
- **`transcript_segments`**: Individual timestamped dialogue blocks (`id`, `meeting_id`, `speaker_name`, `start_time`, `end_time`, `text_content`).
- **`summaries`**: AI-generated overviews and key topics (`id`, `meeting_id`, `overview_text`, `key_topics`).
- **`action_items`**: Trackable tasks extracted from meetings (`id`, `meeting_id`, `description`, `is_completed`).
- **`comments`**: User annotations on specific transcript segments (`id`, `segment_id`, `user_id`, `text`).

## API Overview
The FastAPI backend exposes a clean RESTful interface for all frontend operations:

### Meetings & Transcripts
- `GET /api/meetings` - Fetch all meetings (supports search, date filtering, and tags).
- `POST /api/meetings` - Create a new meeting.
- `GET /api/meetings/{id}/details` - Fetch full payload for a workspace (transcript, summary, action items).
- `PUT /api/meetings/{id}` - Update meeting metadata.
- `DELETE /api/meetings/{id}` - Delete a meeting and cascade all related data.
- `GET /api/meetings/{id}/search?q=` - Search within a specific meeting's transcript.

### Ask AI (AskFred) & Global Search
- `POST /api/meetings/{id}/chat` - Submit a query to the LLM. The backend runs a ReAct loop to answer workspace/transcript questions.
- `GET /api/search?q=` - Global FTS5 search across all meeting metadata.

### Action Items & Metadata
- `POST /api/action-items` - Add a new action item.
- `PUT /api/action-items/{id}` - Toggle completion status.
- `GET /api/tags` | `POST /api/tags` - Manage global tags.
- `GET /api/users` - Fetch workspace participants.
- `POST /api/comments` - Attach a comment to a specific transcript segment.

## Local Setup & Installation Instructions

Follow these steps exactly to run the full stack locally.

### Prerequisites
- Node.js (v18 or higher)
- Python (3.10 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd fireflies_clone
```

### 2. Backend Setup
The backend runs on Python/FastAPI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   - **Windows:** 
     ```bash
     python -m venv .venv
     .\.venv\Scripts\activate
     ```
   - **Mac/Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install the Python dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic groq python-dotenv fpdf2
   ```
4. Configure environment variables:
   Create a new file named `.env` in the `backend/` directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   ```
   *(Note: You can get a free API key at [console.groq.com](https://console.groq.com/))*
5. Seed the SQLite database with sample meetings and transcripts:
   ```bash
   python seed.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   *(The API will be available at `http://localhost:8000`)*

### 3. Frontend Setup
The frontend runs on Next.js.

1. Open a **new terminal tab** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Add a placeholder video (Optional but recommended):
   Ensure you have placed a small `video.mp4` file inside `frontend/public/` to serve as the visual loop for the custom media player. If you don't have one, the UI will just show a blank player window but the transcript seeking will still work.
4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   **[http://localhost:3000](http://localhost:3000)**

## Assumptions & Mocks
1. **Mocked Audio/Transcription:** Real speech-to-text processing is out of scope. Transcripts and summaries are pre-seeded in the database to mimic real usage.
2. **User Authentication:** Real authentication is bypassed. A default logged-in user context is assumed globally on the client side using a Zustand store.
3. **Static Placeholder Pages:** Pages such as Integrations, Voice Agents, AI Skills, and Settings are built as visually-accurate static layouts representing the Fireflies aesthetic but do not have backend logic tied to them.