// Implements the global search bar triggering the backend FTS5 engine.

"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { performGlobalSearch } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export function GlobalSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length > 0) {
                try {
                    const data = await performGlobalSearch(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className="relative w-full max-w-md">
            <Popover open={isOpen && results.length > 0} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search meetings, transcripts, or topics..."
                            className="pl-8 w-full bg-background"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </PopoverTrigger>
                <PopoverContent className="w-full max-w-md p-0" align="start">
                    <ScrollArea className="h-72">
                        <div className="p-2 space-y-1">
                            {results.map((res, index) => (
                                <Link
                                    key={`${res.meeting_id}-${index}`}
                                    href={`/meeting/${res.meeting_id}`}
                                    className="block px-3 py-2 rounded-md hover:bg-muted transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="text-sm font-medium">{res.meeting_title}</div>
                                    {res.text_content && (
                                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            <span className="font-semibold">{res.speaker_name}: </span>
                                            {res.text_content}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    );
}