"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchMatch {
    meeting_id: string;
    meeting_title: string;
    segment_id: string | null;
    speaker_name: string | null;
    text_content: string | null;
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || "";
    
    const [results, setResults] = useState<SearchMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`http://localhost:8000/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="flex-1 overflow-y-auto bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Search className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
                        <p className="text-muted-foreground text-sm">Showing global matches for "{query}"</p>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-xl"></div>
                        ))}
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                        No matches found for "{query}". Try a different keyword.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.map((match, idx) => (
                            <div key={idx} className="bg-background border rounded-xl p-5 hover:border-primary/50 transition-colors shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2 text-primary font-medium text-[15px]">
                                        <FileText className="w-4 h-4" />
                                        <span>{match.meeting_title}</span>
                                    </div>
                                    <Button onClick={() => router.push(`/meeting/${match.meeting_id}`)} variant="ghost" size="sm" className="h-8">
                                        View Meeting <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Button>
                                </div>
                                {match.text_content && (
                                    <div className="bg-muted/30 p-3 rounded-lg border text-sm text-foreground/90">
                                        <span className="font-semibold mr-2">{match.speaker_name}:</span>
                                        <span dangerouslySetInnerHTML={{
                                            __html: match.text_content.replace(new RegExp(`(${query})`, "gi"), "<mark class='bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5'>$1</mark>")
                                        }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
