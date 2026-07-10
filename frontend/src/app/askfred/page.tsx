"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Layers, Check, FileText, Wand2, Calendar, Mic, ChevronDown, User, Bot, Loader2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AskFredPage() {
  const { currentUser } = useAppStore();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && messages.length === 0) {
      setInputValue(q);
      handleSend(q);
    }
  }, [searchParams]);

  const handleSend = async (messageText: string = inputValue) => {
    if (!messageText.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { role: "user", content: messageText }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: messageText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I ran into an error connecting to the AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { text: "List my action items & todos for this week", icon: Check },
    { text: "Summarize my last meeting", icon: FileText },
    { text: "Prepare me for the upcoming meeting", icon: Wand2 },
    { text: "Connect Gmail, Notion, and 30+ sources for richer insights.", icon: Layers },
    { text: "Prepare weekly digest, based on my meetings", icon: Calendar },
  ];

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-64 border-r flex flex-col h-full shrink-0">
        <div className="p-4 space-y-2 shrink-0">
           <Button variant="ghost" className="w-full justify-start text-[15px] font-normal text-foreground px-3">
              <Plus className="w-4 h-4 mr-3 text-muted-foreground" /> New Chat
           </Button>
           <Button variant="ghost" className="w-full justify-start text-[15px] font-normal text-foreground px-3">
              <Search className="w-4 h-4 mr-3 text-muted-foreground" /> Search
           </Button>
           <Button variant="ghost" className="w-full justify-start text-[15px] font-normal text-foreground px-3">
              <Layers className="w-4 h-4 mr-3 text-muted-foreground" /> Connectors
           </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-10">
           {/* Abstract Gradient Placeholder */}
           <div className="w-40 h-10 rounded-full bg-gradient-to-r from-emerald-100 via-blue-50 to-primary/10 blur-sm mb-6" />
           <div className="w-40 h-10 rounded-full bg-muted/20 mb-8" />
           
           <h3 className="font-medium text-[15px] text-foreground mb-1">No chats yet</h3>
           <p className="text-sm text-muted-foreground">Your chats will appear here once you start one.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center pt-12 px-10 h-full overflow-hidden">
         <div className="w-full max-w-[760px] flex-1 flex flex-col space-y-8 overflow-hidden pb-6">
            
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-end pb-8">
                    <h1 className="text-[28px] font-medium tracking-tight mb-8">Hi {currentUser.name.split(' ')[0]}, how can I help today?</h1>
                    
                    {/* Suggestions */}
                    <div className="space-y-1 mb-8">
                       {suggestions.map((item, idx) => (
                          <Button key={idx} variant="ghost" onClick={() => handleSend(item.text)} className="w-full justify-start h-12 text-[14px] font-normal text-muted-foreground hover:text-foreground">
                             <item.icon className="w-4 h-4 mr-4" /> {item.text}
                          </Button>
                       ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-6 pr-4 pt-10">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex space-x-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-purple-600" />
                                </div>
                            )}
                            <div className={`p-4 rounded-2xl max-w-[85%] text-[15px] leading-relaxed ${msg.role === 'user' ? 'bg-primary/10 text-foreground' : 'bg-muted/30 text-foreground border'}`}>
                                {msg.content}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex space-x-4 justify-start">
                            <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="p-4 rounded-2xl bg-muted/30 border flex items-center space-x-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" /> <span>Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* Prompt Input Area */}
            <div className="bg-background border rounded-2xl p-4 shadow-sm flex flex-col min-h-[140px] relative focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all shrink-0">
               <textarea 
                  className="flex-1 w-full resize-none outline-none text-[15px] bg-transparent"
                  placeholder="Ask anything, @ for context and / for skills"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
               />
               <div className="flex items-center justify-between pt-4 mt-auto">
                  <div className="flex items-center space-x-2">
                     <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Plus className="w-4 h-4" /></Button>
                     <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground"><Layers className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Button variant="ghost" className="text-muted-foreground font-normal text-[13px] h-8 px-2">
                        Sonnet 4.6 (Auto) <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                     </Button>
                     <Button onClick={() => handleSend()} disabled={isLoading} variant="ghost" size="icon" className="w-8 h-8 text-primary hover:text-primary hover:bg-primary/10 bg-primary/5">
                        <Plus className="w-4 h-4 rotate-45" />
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* Bottom Footer */}
         <div className="mt-auto mb-6 text-[13px] text-muted-foreground">
            Consumes AI credits
         </div>
      </div>
    </div>
  );
}
