"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, ChevronDown } from "lucide-react";

export default function IntegrationsPage() {
  const integrations = [
    { name: "ActiveCampaign", desc: "Sync Fireflies meeting notes to ActiveCampaig...", color: "bg-blue-600" },
    { name: "Activepieces", desc: "Activepieces offers a no-code integration with Fireflies.ai, enabling...", color: "bg-purple-600" },
    { name: "Affinity", desc: "Automatically sync meeting data and task...", color: "bg-indigo-500" },
    { name: "Aircall", desc: "Automatically capture, transcribe, an...", color: "bg-emerald-500" },
    { name: "Airtable", desc: "Automatically push meeting data and...", color: "bg-amber-500" },
    { name: "Allo", desc: "Automatically capture, transcribe, and generate meeting notes for calls...", color: "bg-yellow-500" },
    { name: "Amazon S3", desc: "Effortlessly sync your Fireflies...", color: "bg-orange-600" },
    { name: "Any.do", desc: "Effortlessly sync action items and tas...", color: "bg-blue-500" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Tabs */}
      <div className="border-b px-8 pt-6 flex items-end justify-center shrink-0 space-x-12">
         <button className="text-primary font-medium border-b-2 border-primary pb-3 px-1">Discover</button>
         <button className="text-muted-foreground hover:text-foreground font-medium pb-3 px-1">Connected</button>
      </div>

      <div className="flex-1 overflow-y-auto p-10">
         <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
               <Button variant="outline" className="h-9 px-4 text-primary border-primary/30 bg-primary/5">All</Button>
               <Button variant="outline" className="h-9 px-4 text-muted-foreground font-normal">Audio recording</Button>
               <Button variant="outline" className="h-9 px-4 text-muted-foreground font-normal">Applicant tracking system</Button>
               <Button variant="outline" className="h-9 px-4 text-muted-foreground font-normal">CRM</Button>
               <Button variant="outline" className="h-9 px-4 text-muted-foreground font-normal">MCP</Button>
               <Button variant="outline" className="h-9 px-4 text-muted-foreground font-normal">More <ChevronDown className="w-3 h-3 ml-1.5" /></Button>
               <div className="relative ml-auto w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-9 h-9" />
               </div>
            </div>

            <Button variant="ghost" className="text-muted-foreground -ml-4"><MessageSquare className="w-4 h-4 mr-2" /> Share Feedback</Button>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
               {integrations.map((int, idx) => (
                  <div key={idx} className="p-6 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-56">
                     <div className={`w-10 h-10 rounded-md ${int.color} text-white flex items-center justify-center font-bold text-xl mb-6 shadow-sm`}>
                        {int.name.charAt(0)}
                     </div>
                     <h3 className="font-semibold text-[17px] mb-1">{int.name}</h3>
                     <p className="text-[13px] text-muted-foreground mb-4">Fireflies</p>
                     <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-3 mt-auto">
                        {int.desc}
                     </p>
                  </div>
               ))}
               
               {/* Placeholders to fill screen */}
               {[1, 2, 3, 4].map((idx) => (
                   <div key={`p-${idx}`} className="h-56 p-6 rounded-xl border bg-muted/10 flex flex-col items-center justify-center opacity-50">
                      <div className="w-10 h-10 rounded-md bg-muted mb-6" />
                      <div className="w-24 h-4 bg-muted rounded mb-2" />
                      <div className="w-16 h-3 bg-muted rounded" />
                   </div>
               ))}
            </div>

         </div>
      </div>
    </div>
  );
}
