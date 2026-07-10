// Handles HTTP requests to the FastAPI backend.

const API_BASE_URL = "http://localhost:8000/api";

export async function fetchMeetings() {
    const response = await fetch(`${API_BASE_URL}/meetings`);
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