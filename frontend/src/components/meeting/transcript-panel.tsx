// Handles the interactive transcript rendering, local search, timestamp syncing, and annotations.

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { addComment } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

interface Comment {
    id: string;
    text: string;
    user_id: string;
}

interface TranscriptSegment {
    id: string;
    speaker_name: string;
    start_time: number;
    end_time: number;
    text_content: string;
    comments?: Comment[];
}

interface TranscriptPanelProps {
    segments: TranscriptSegment[];
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TranscriptPanel({ segments }: TranscriptPanelProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const { currentMediaTime, requestSeek } = useAppStore();
    const activeSegmentRef = useRef<HTMLDivElement>(null);
    const [commentInput, setCommentInput] = useState("");
    const [activePopover, setActivePopover] = useState<string | null>(null);
    const [localComments, setLocalComments] = useState<Record<string, Comment[]>>({});

    useEffect(() => {
        if (activeSegmentRef.current && searchQuery === "" && !activePopover) {
            activeSegmentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [currentMediaTime, searchQuery, activePopover]);

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">{part}</mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    const handleAddComment = async (segmentId: string) => {
        if (!commentInput.trim()) return;
        try {
            const newComment = await addComment(segmentId, commentInput);
            setLocalComments(prev => ({
                ...prev,
                [segmentId]: [...(prev[segmentId] || []), newComment]
            }));
            setCommentInput("");
            setActivePopover(null);
            toast.success("Note added");
        } catch (error) {
            console.error("Failed to add comment", error);
            toast.error("Failed to add note");
        }
    };

    const filteredSegments = useMemo(() => {
        if (!searchQuery) return segments;
        return segments.filter(seg =>
            seg.text_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            seg.speaker_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [segments, searchQuery]);

    return (
        <div className="flex flex-col h-full bg-background rounded-xl border">
            <div className="p-4 border-b flex items-center gap-3">
                <h2 className="font-semibold min-w-max">Transcript</h2>
                <div className="relative w-full max-w-sm ml-auto">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search transcript..."
                        className="pl-8 h-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                    {filteredSegments.map((segment) => {
                        const isActive = currentMediaTime >= segment.start_time && currentMediaTime < segment.end_time;

                        return (
                            <div
                                key={segment.id}
                                ref={isActive ? activeSegmentRef : null}
                                className={`group relative flex gap-4 p-2 rounded-lg transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted/50"
                                    }`}
                            >
                                <div
                                    className="w-12 pt-1 text-xs text-muted-foreground text-right font-medium"
                                >
                                    {formatTime(segment.start_time)}
                                </div>
                                <div 
                                    className="flex-1 cursor-pointer"
                                    onClick={() => requestSeek(segment.start_time)}
                                >
                                    <div className="font-semibold text-sm mb-1">{segment.speaker_name}</div>
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {highlightText(segment.text_content, searchQuery)}
                                    </p>
                                </div>

                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Popover open={activePopover === segment.id} onOpenChange={(open) => setActivePopover(open ? segment.id : null)}>
                                        <PopoverTrigger render={<Button variant="outline" size="icon" className="h-7 w-7 rounded-full bg-background shadow-sm" />}>
                                            <MessageSquare className="h-3 w-3" />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 p-3 shadow-lg" align="end">
                                            <div className="space-y-2">
                                                <h4 className="text-xs font-medium">Add Note</h4>
                                                <Input
                                                    placeholder="Type a comment..."
                                                    className="h-8 text-xs"
                                                    value={commentInput}
                                                    onChange={(e) => setCommentInput(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" ? handleAddComment(segment.id) : null}
                                                />
                                                <Button size="sm" className="w-full h-8 text-xs" onClick={() => handleAddComment(segment.id)}>Save</Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                
                                {/* Render Comments */}
                                {((segment.comments && segment.comments.length > 0) || (localComments[segment.id] && localComments[segment.id].length > 0)) && (
                                    <div className="mt-3 space-y-2 pl-[3.25rem]">
                                        {[...(segment.comments || []), ...(localComments[segment.id] || [])].map((comment, idx) => (
                                            <div key={comment.id || idx} className="flex items-start gap-2 bg-muted/40 p-2 rounded-md text-sm">
                                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <MessageSquare className="w-3 h-3 text-primary" />
                                                </div>
                                                <p className="text-muted-foreground leading-relaxed flex-1">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}