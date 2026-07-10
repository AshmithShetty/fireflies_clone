"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, SlidersHorizontal, Sparkles, MessageSquare, Link as LinkIcon, Share2, Grid } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AISkillsPage() {
  const recommendedSkills = [
    { name: "Key Ideas", usage: "53.1k", active: true },
    { name: "Goal Prog...", usage: "59.7k", active: false },
    { name: "Time Man...", usage: "16.3k", active: false },
  ];

  const popularSkills = [
    { name: "Popular T...", usage: "174M", active: false },
    { name: "Sales Call", usage: "269k", active: false },
    { name: "1:1", usage: "261k", active: false },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Top Header / Tabs */}
      <div className="border-b px-8 pt-6 flex items-end justify-between shrink-0">
         <div className="flex items-center space-x-8">
            <button className="text-primary font-medium border-b-2 border-primary pb-3 px-1">Discover</button>
            <button className="text-muted-foreground hover:text-foreground font-medium pb-3 px-1">Active Skills (1)</button>
            <button className="text-muted-foreground hover:text-foreground font-medium pb-3 px-1">Feed</button>
         </div>
         <div className="pb-3">
            <Button variant="outline" className="h-9 px-6 text-muted-foreground bg-background shadow-sm">Create Skill</Button>
         </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex min-h-0">
         {/* Left List */}
         <div className="w-[340px] border-r flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b shrink-0 flex items-center space-x-2">
               <Button variant="outline" className="flex-1 justify-between text-muted-foreground font-normal bg-background">
                  <span className="flex items-center"><Grid className="w-4 h-4 mr-2" /> All Skills</span>
                  <span>v</span>
               </Button>
               <Button variant="outline" size="icon" className="shrink-0 bg-background"><Search className="w-4 h-4 text-muted-foreground" /></Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-12">
               <div className="space-y-3">
                  <h3 className="text-sm text-muted-foreground font-medium px-1">Recommended</h3>
                  <div className="space-y-2">
                     {recommendedSkills.map((skill, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${skill.active ? 'border-primary ring-1 ring-primary/20 shadow-sm' : 'bg-background hover:bg-muted/30'}`}>
                           <div className="flex items-center space-x-4">
                              <span className="font-medium text-[15px]">{skill.name}</span>
                              <span className="text-sm text-muted-foreground flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1" /> {skill.usage}</span>
                           </div>
                           <Switch checked={skill.active} />
                        </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <h3 className="text-sm text-muted-foreground font-medium px-1">Popular</h3>
                  <div className="space-y-2">
                     {popularSkills.map((skill, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-background hover:bg-muted/30 flex items-center justify-between">
                           <div className="flex items-center space-x-4">
                              <span className="font-medium text-[15px]">{skill.name}</span>
                              <span className="text-sm text-muted-foreground flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1" /> {skill.usage}</span>
                           </div>
                           <Switch checked={skill.active} />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Right Detail Panel */}
         <div className="flex-1 p-10 overflow-y-auto bg-muted/5">
            <div className="max-w-2xl mx-auto space-y-8">
               <div className="flex justify-end">
                  <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                     <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                  </Button>
               </div>

               <div className="space-y-4">
                  <h1 className="text-[28px] font-medium tracking-tight">Key Ideas</h1>
                  <p className="text-lg text-muted-foreground">Extract key ideas from audio content.</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground font-medium py-2">
                     <div className="flex items-center"><div className="w-4 h-4 bg-pink-500 rounded-sm mr-2" /> Fireflies</div>
                     <div className="flex items-center"><Sparkles className="w-4 h-4 mr-1.5" /> 53.1k</div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                     <Button variant="outline" className="px-6 text-muted-foreground" disabled>Enable</Button>
                     <Button variant="outline" className="px-6 border-muted-foreground/30 shadow-sm ml-auto">Edit</Button>
                  </div>
               </div>

               <div className="pt-8">
                  <Button variant="ghost" className="text-muted-foreground -ml-4">
                     <MessageSquare className="w-4 h-4 mr-2" /> Share Feedback
                  </Button>
               </div>

               <div className="mt-8 p-6 bg-background rounded-xl border shadow-sm flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                     <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" className="w-5 h-5" alt="Slack" />
                     </div>
                     <div>
                        <h4 className="font-medium text-[15px] flex items-center">
                           Get insights on Slack 
                           <span className="text-muted-foreground font-normal ml-2">— Receive skills output to your Slack channel.</span>
                        </h4>
                     </div>
                  </div>
                  <Button variant="ghost" className="text-primary font-medium hover:text-primary hover:bg-primary/10">Connect</Button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
