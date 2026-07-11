// Renders the AI summary, interactive action items list, and Groq-powered chat interface.

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Loader2, Plus, Pencil, Check, X } from "lucide-react";
import { updateActionItem, askMeetingQuestion, createActionItem } from "@/lib/api";

interface SummaryPanelProps {
    meetingId: string;
    summary: any;
    actionItems: any[];
}

export function SummaryPanel({ meetingId, summary, actionItems: initialActionItems }: SummaryPanelProps) {
    const [actionItems, setActionItems] = useState(initialActionItems || []);
    const [chatMessages, setChatMessages] = useState<{ role: string, content: string }[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    const [newItemText, setNewItemText] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editItemText, setEditItemText] = useState("");

    const handleAddActionItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim()) return;
        setIsAddingTask(true);
        try {
            const created = await createActionItem({ meeting_id: meetingId, description: newItemText.trim() });
            setActionItems(prev => [...prev, created]);
            setNewItemText("");
        } catch (error) {
            console.error("Failed to add action item", error);
        } finally {
            setIsAddingTask(false);
        }
    };

    const startEdit = (item: any) => {
        setEditingItemId(item.id);
        setEditItemText(item.description);
    };

    const saveEdit = async (id: string) => {
        if (!editItemText.trim()) return setEditingItemId(null);
        try {
            const updated = await updateActionItem(id, { description: editItemText.trim() });
            setActionItems(items => items.map(item => item.id === id ? updated : item));
            setEditingItemId(null);
        } catch (error) {
            console.error("Failed to update action item", error);
        }
    };

    const handleToggleActionItem = async (id: string, currentStatus: boolean) => {
        try {
            const updated = await updateActionItem(id, { is_completed: !currentStatus });
            setActionItems(items => items.map(item => item.id === id ? updated : item));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setChatInput("");
        setIsChatLoading(true);

        try {
            const response = await askMeetingQuestion(meetingId, userMessage);
            setChatMessages(prev => [...prev, { role: "assistant", content: response.answer }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to AI assistant." }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-background rounded-xl border">
            <Tabs defaultValue="summary" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-4 border-b shrink-0">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
                        <TabsTrigger value="summary" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                            AI Summary
                        </TabsTrigger>
                        <TabsTrigger value="action_items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                            Action Items
                        </TabsTrigger>
                        <TabsTrigger value="chat" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 pb-2 pt-2 font-semibold">
                            Ask AI
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 flex flex-col min-h-0 p-4 relative">
                    <TabsContent value="summary" className="m-0 space-y-4 h-full overflow-y-auto pr-2">
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

                    <TabsContent value="action_items" className="absolute inset-4 m-0">
                        <div className="flex flex-col h-full min-h-0 space-y-4">
                            <div className="flex-1 space-y-3 overflow-y-auto">
                            {actionItems && actionItems.length > 0 ? (
                                actionItems.map((item) => (
                                    <div key={item.id} className="group flex items-start space-x-3 p-3 rounded-md border bg-muted/30 relative hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            checked={item.is_completed}
                                            onCheckedChange={() => handleToggleActionItem(item.id, item.is_completed)}
                                            className="mt-0.5"
                                        />
                                        {editingItemId === item.id ? (
                                            <div className="flex-1 flex gap-2 mr-6">
                                                <Input 
                                                    value={editItemText} 
                                                    onChange={e => setEditItemText(e.target.value)} 
                                                    className="h-7 text-sm" 
                                                    autoFocus
                                                    onKeyDown={e => e.key === "Enter" ? saveEdit(item.id) : null}
                                                />
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => saveEdit(item.id)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => setEditingItemId(null)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className={`text-sm flex-1 ${item.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                                {item.description}
                                            </span>
                                        )}
                                        {editingItemId !== item.id && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute top-1.5 right-1.5 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                onClick={() => startEdit(item)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No action items detected.</p>
                            )}
                        </div>
                        <form onSubmit={handleAddActionItem} className="flex gap-2 mt-auto">
                            <Input
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                placeholder="Add new action item..."
                                disabled={isAddingTask}
                            />
                            <Button type="submit" size="icon" disabled={isAddingTask || !newItemText.trim()}>
                                {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            </Button>
                        </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="chat" className="absolute inset-4 m-0">
                        <div className="flex flex-col h-full min-h-0">
                            <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-sm text-muted-foreground mt-4">
                                    Ask a question about this meeting based on the transcript.
                                </div>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    {msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>}
                                    <div className={`p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        {msg.content}
                                    </div>
                                    {msg.role === 'user' && <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex gap-3 text-sm">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4" /></div>
                                    <div className="p-3 rounded-lg bg-muted flex items-center"><Loader2 className="w-4 h-4 animate-spin" /></div>
                                </div>
                            )}
                        </div>
                        <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto">
                            <Input
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask a question..."
                                disabled={isChatLoading}
                            />
                            <Button type="submit" size="icon" disabled={isChatLoading || !chatInput.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}