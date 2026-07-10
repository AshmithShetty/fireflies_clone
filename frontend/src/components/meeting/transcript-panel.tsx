// Handles the interactive transcript rendering, local search, and timestamp syncing.

"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";

interface TranscriptSegment {
    id: string;
    speaker_name: string;
    start_time: number;
    end_time: number;
    text_content: string;
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

    // Auto-scroll to active segment
    useEffect(() => {
        if (activeSegmentRef.current && searchQuery === "") {
            activeSegmentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [currentMediaTime, searchQuery]);

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
                                className={`group flex gap-4 p-2 rounded-lg transition-colors cursor-pointer ${isActive ? "bg-primary/10" : "hover:bg-muted/50"
                                    }`}
                                onClick={() => requestSeek(segment.start_time)}
                            >
                                <div className="w-12 pt-1 text-xs text-muted-foreground text-right font-medium">
                                    {formatTime(segment.start_time)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-sm mb-1">{segment.speaker_name}</div>
                                    <p className="text-sm leading-relaxed text-foreground/90">
                                        {highlightText(segment.text_content, searchQuery)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    {filteredSegments.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground mt-10">
                            No transcript results found for "{searchQuery}"
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}