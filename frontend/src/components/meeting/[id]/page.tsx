// Orchestrates the core interactive workspace for a specific meeting detail view and handles document exports.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMeetingDetails } from "@/lib/api";
import { MediaPlayer } from "@/components/meeting/media-player";
import { TranscriptPanel } from "@/components/meeting/transcript-panel";
import { SummaryPanel } from "@/components/meeting/summary-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, Download } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MeetingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.id as string;

    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const data = await fetchMeetingDetails(meetingId);
                if (!data) router.push('/');
                setMeeting(data);
            } catch (error) {
                console.error("Failed to load meeting details", error);
            } finally {
                setLoading(false);
            }
        }
        if (meetingId) loadData();
    }, [meetingId, router]);

    const handleExport = (format: string) => {
        window.open(`http://localhost:8000/api/meetings/${meetingId}/export?format=${format}`, "_blank");
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
    if (!meeting) return null;

    const durationMinutes = Math.round(meeting.duration / 60);
    const formattedDate = format(new Date(meeting.date), "MMM d, yyyy");

    return (
        <div className="flex flex-col h-full h-[calc(100vh-3.5rem)] overflow-hidden">
            <div className="px-6 py-4 border-b bg-background flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-start gap-4">
                    <Button variant="ghost" size="icon" className="mt-0.5" onClick={() => router.push('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">{meeting.title}</h1>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 font-medium">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{durationMinutes} min</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{meeting.participants.length} Participants</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="flex items-center gap-1.5" />}>
                            <Download className="w-4 h-4" /> Export
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport('pdf')}>Export as PDF</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('md')}>Export as Markdown</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('txt')}>Export as TXT</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm">Share</Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-muted/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-[1600px] mx-auto">

                    <div className="lg:col-span-5 flex flex-col h-full gap-4 min-h-[400px]">
                        <MediaPlayer mediaUrl={meeting.media_url} />
                        <div className="flex-1 overflow-hidden">
                            <SummaryPanel meetingId={meetingId} summary={meeting.summary} actionItems={meeting.action_items} />
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
                        <TranscriptPanel segments={meeting.transcript_segments} />
                    </div>

                </div>
            </div>
        </div>
    );
}