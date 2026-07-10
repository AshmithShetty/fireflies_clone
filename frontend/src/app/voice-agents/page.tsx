"use client";

import { Button } from "@/components/ui/button";
import { Play, Sparkles, X, MessageSquare, Mic } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function VoiceAgentsPage() {
  const { currentUser } = useAppStore();

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto">
      {/* Tabs */}
      <div className="border-b px-8 pt-6 flex items-end justify-center shrink-0 space-x-12">
         <button className="text-primary font-medium border-b-2 border-primary pb-3 px-1">Discover</button>
         <button className="text-muted-foreground hover:text-foreground font-medium pb-3 px-1">My Voice Agents</button>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-10 space-y-12 pb-20">
         
         {/* Main Hero section */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
               <div className="flex items-start justify-between">
                  <h1 className="text-[32px] font-medium leading-tight max-w-[280px]">Experience Voice Agents</h1>
                  <div className="flex flex-col items-center bg-muted/30 px-3 py-1.5 rounded-lg border">
                     <Sparkles className="w-4 h-4 mb-1 text-primary" />
                     <span className="text-xs text-muted-foreground text-center">50 free AI<br/>credits</span>
                  </div>
               </div>
               <p className="text-[17px] text-muted-foreground leading-relaxed max-w-md">
                  Voice Agents handle your calls, ask the right questions, and deliver clear insights.
               </p>
               <div className="flex items-center space-x-4 pt-2">
                  <Button variant="ghost" className="text-muted-foreground font-medium h-11 px-6"><Mic className="w-4 h-4 mr-2" /> Try It Live</Button>
                  <Button variant="outline" className="h-11 px-6 font-medium shadow-sm"><Play className="w-4 h-4 mr-2 fill-current" /> Watch Demo</Button>
               </div>
            </div>
            <div className="w-full md:w-[380px] h-[220px] rounded-2xl overflow-hidden shadow-2xl border bg-gradient-to-br from-indigo-900 via-purple-900 to-[#1a1a2e] relative">
               {/* Decorative Graphic */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/20 blur-xl"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-primary flex items-center justify-center border border-white/20 shadow-lg">
                  <span className="text-white text-xs">🎧</span>
               </div>
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"><Mic className="w-3 h-3 text-white" /></div>
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center"><X className="w-3 h-3 text-white" /></div>
               </div>
               <div className="absolute top-6 left-[-10px] bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-[10px]">
                  How do you handle tight deadlines?
               </div>
            </div>
         </div>

         {/* Voice Cloning Banner */}
         <div className="bg-background border rounded-xl p-5 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex items-center space-x-4 pl-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary" />
               </div>
               <p className="text-[15px] font-medium">
                  Try Voice Cloning — <span className="font-normal text-muted-foreground">Make your agent sound exactly like you in 30 seconds.</span>
               </p>
            </div>
            <div className="flex items-center space-x-4">
               <Button variant="ghost" className="text-primary font-medium hover:text-primary hover:bg-primary/10">Create Voice Agent</Button>
               <Button variant="ghost" size="icon" className="text-muted-foreground"><X className="w-4 h-4" /></Button>
            </div>
         </div>

         {/* Setup Custom Agent */}
         <div className="space-y-6 pt-6 border-t">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-[22px] font-medium tracking-tight mb-2">{currentUser.name.split(' ')[0]}, set up your Voice Agent in 2 minutes</h2>
                  <Button variant="ghost" className="text-muted-foreground -ml-4"><MessageSquare className="w-4 h-4 mr-2" /> Share Feedback</Button>
               </div>
               <Button variant="outline" className="h-10 px-6 font-medium shadow-sm" disabled>Custom Agent</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="h-32 border rounded-xl bg-muted/10 border-dashed"></div>
               <div className="h-32 border rounded-xl bg-muted/10 border-dashed"></div>
            </div>
         </div>

      </div>
    </div>
  );
}
