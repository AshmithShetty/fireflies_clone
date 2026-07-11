// Handles HTTP requests to the FastAPI backend.

const API_BASE_URL = "http://localhost:8000/api";

export async function fetchMeetings(filters?: { search?: string, dateFilter?: string, tag?: string }) {
    let url = `${API_BASE_URL}/meetings`;
    if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append("search", filters.search);
        if (filters.dateFilter && filters.dateFilter !== "All Time") params.append("date_filter", filters.dateFilter);
        if (filters.tag && filters.tag !== "All Tags") params.append("tag", filters.tag);
        const qs = params.toString();
        if (qs) {
            url += `?${qs}`;
        }
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch meetings");
    }
    return response.json();
}

export async function performGlobalSearch(query: string) {
    if (!query) return [];
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
        throw new Error("Failed to perform search");
    }
    return response.json();
}

export async function fetchMeetingDetails(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}/details`);
    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error("Failed to fetch meeting details");
    }
    return response.json();
}

export async function toggleActionItem(itemId: string, isCompleted: boolean) {
    const response = await fetch(`${API_BASE_URL}/action-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: isCompleted }),
    });
    if (!response.ok) throw new Error("Failed to update action item");
    return response.json();
}

export async function askMeetingQuestion(meetingId: string, question: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
    });
    if (!response.ok) throw new Error("Failed to ask question");
    return response.json();
}

export async function addComment(segmentId: string, text: string) {
    const response = await fetch(`${API_BASE_URL}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment_id: segmentId, text }),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    return response.json();
}

export async function fetchUsers() {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) throw new Error("Failed to fetch users");
    return response.json();
}

export async function fetchTags() {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) throw new Error("Failed to fetch tags");
    return response.json();
}

export async function createTag(name: string) {
    const response = await fetch(`${API_BASE_URL}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error("Failed to create tag");
    return response.json();
}

export async function createMeeting(payload: any) {
    const response = await fetch(`${API_BASE_URL}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create meeting");
    return response.json();
}

export async function updateMeetingMetadata(id: string, payload: any) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update meeting");
    return response.json();
}

export async function deleteMeeting(id: string) {
    const response = await fetch(`${API_BASE_URL}/meetings/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete meeting");
    return true;
}

export async function createActionItem(payload: any) {
    const response = await fetch(`${API_BASE_URL}/action-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create action item");
    return response.json();
}

export async function updateActionItem(itemId: string, payload: any) {
    const response = await fetch(`${API_BASE_URL}/action-items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update action item");
    return response.json();
}

export async function searchMeetingTranscript(meetingId: string, query: string) {
    if (!query) return [];
    const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search transcript");
    return response.json();
}