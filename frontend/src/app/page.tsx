// The main dashboard view integrating search, filters, and the meeting list.

"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchMeetings } from "@/lib/api";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { GlobalSearch } from "@/components/meetings/global-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMeetings();
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load meetings", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredAndSortedMeetings = useMemo(() => {
    let result = [...meetings];

    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      result = result.filter((m) =>
        m.title.toLowerCase().includes(lowerFilter) ||
        m.participants.some((p: any) => p.name.toLowerCase().includes(lowerFilter))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [meetings, filterText, sortOrder]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meetings Library</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage your recent calls.</p>
        </div>
        <div className="flex-1 max-w-md">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center justify-between bg-background p-3 rounded-md border shadow-sm">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Filter by title or participant..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-64 h-9"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground font-medium">Sort by:</span>
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Sort Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl"></div>
          ))}
        </div>
      ) : filteredAndSortedMeetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedMeetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              id={meeting.id}
              title={meeting.title}
              date={meeting.date}
              duration={meeting.duration}
              participants={meeting.participants}
              tags={meeting.tags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No meetings found matching your criteria.
        </div>
      )}
    </div>
  );
}