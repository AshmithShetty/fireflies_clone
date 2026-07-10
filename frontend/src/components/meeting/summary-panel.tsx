// Renders the AI-generated meeting summary and action items in a tabbed interface.

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2 } from "lucide-react";

interface SummaryPanelProps {
    summary: any;
    actionItems: any[];
}

export function SummaryPanel({ summary, actionItems }: SummaryPanelProps) {
    return (
        <div className="flex flex-col h-full bg-background rounded-xl border">
            <Tabs defaultValue="summary" className="flex-1 flex flex-col">
                <div className="px-4 pt-4 border-b">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger value="summary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                            AI Summary
                        </TabsTrigger>
                        <TabsTrigger value="action_items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                            Action Items
                        </TabsTrigger>
                    </TabsList>
                </div>

                <ScrollArea className="flex-1 p-4">
                    <TabsContent value="summary" className="m-0 mt-2 space-y-4">
                        {summary ? (
                            <>
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Overview</h3>
                                    <p className="text-sm leading-relaxed">{summary.overview_text}</p>
                                </div>
                                <div className="mt-6">
                                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Key Topics</h3>
                                    <div className="text-sm whitespace-pre-wrap">{summary.key_topics}</div>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">No AI summary generated for this meeting yet.</p>
                        )}
                    </TabsContent>

                    <TabsContent value="action_items" className="m-0 mt-2 space-y-3">
                        {actionItems && actionItems.length > 0 ? (
                            actionItems.map((item) => (
                                <div key={item.id} className="flex items-start space-x-3 p-3 rounded-md border bg-muted/30">
                                    <CheckCircle2 className={`w-5 h-5 mt-0.5 ${item.is_completed ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-sm ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {item.description}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">No action items detected.</p>
                        )}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </div>
    );
}