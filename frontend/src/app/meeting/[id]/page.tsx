// Orchestrates the core interactive workspace for a specific meeting detail view and handles document exports.

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchMeetingDetails } from "@/lib/api";
import { MediaPlayer } from "@/components/meeting/media-player";
import { TranscriptPanel } from "@/components/meeting/transcript-panel";
import { SummaryPanel } from "@/components/meeting/summary-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Users, Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { EditMeetingDialog } from "@/components/meeting/edit-meeting-dialog";
import { deleteMeeting } from "@/lib/api";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function MeetingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.id as string;

    const [meeting, setMeeting] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = async () => {
        try {
            const data = await fetchMeetingDetails(meetingId);
            if (!data) router.push('/');
            setMeeting(data);
        } catch (error) {
            console.error("Failed to load meeting details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (meetingId) loadData();
    }, [meetingId, router]);

    const handleExport = (format: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
        window.open(`${baseUrl}/meetings/${meetingId}/export?format=${format}`, "_blank");
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteMeeting(meetingId);
            toast.success("Meeting deleted");
            router.push('/');
        } catch (error) {
            toast.error("Failed to delete meeting");
            setIsDeleting(false);
            setIsDeleteOpen(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
    if (!meeting) return null;

    const durationMinutes = Math.round(meeting.duration / 60);
    const formattedDate = format(new Date(meeting.date), "MMM d, yyyy");

    return (
        <div className="flex flex-col h-full overflow-hidden">
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
                            <MoreHorizontal className="w-4 h-4" /> Actions
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                                <Pencil className="w-4 h-4 mr-2" /> Edit Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf')}>
                                <Download className="w-4 h-4 mr-2" /> Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('md')}>
                                <Download className="w-4 h-4 mr-2" /> Export as Markdown
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('txt')}>
                                <Download className="w-4 h-4 mr-2" /> Export as TXT
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Meeting
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm">Share</Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-muted/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full max-w-[1600px] mx-auto">

                    <div className="lg:col-span-5 flex flex-col h-full gap-4 overflow-hidden min-h-0">
                        <MediaPlayer mediaUrl={meeting.media_url} duration={meeting.duration} />
                        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                            <SummaryPanel meetingId={meetingId} summary={meeting.summary} actionItems={meeting.action_items} />
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
                        <TranscriptPanel segments={meeting.transcript_segments} meetingId={meeting.id} />
                    </div>

                </div>
            </div>
            
            <EditMeetingDialog 
                open={isEditOpen} 
                onOpenChange={setIsEditOpen} 
                meeting={meeting} 
                onSuccess={loadData} 
            />

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Meeting</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this meeting? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
