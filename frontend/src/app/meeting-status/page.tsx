"use client";

import { Button } from "@/components/ui/button";
import { Video, X, Calendar, Activity, ChevronDown } from "lucide-react";

export default function MeetingStatusPage() {
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden p-10">
      <div className="max-w-[800px] mx-auto w-full space-y-8">
         
         {/* Banner */}
         <div className="bg-muted/30 border rounded-xl py-3 px-4 flex items-center justify-between text-[15px]">
            <div className="flex-1 flex justify-center items-center space-x-2">
               <span className="text-foreground">Meeting Status is moving to Notifications soon.</span>
               <button className="text-primary font-medium hover:underline">Check Now &rarr;</button>
            </div>
            <button className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
         </div>

         {/* Filters */}
         <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
               <button className="flex items-center text-muted-foreground hover:text-foreground text-[15px]">
                  <Calendar className="w-4 h-4 mr-2" /> All <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
               </button>
               <button className="flex items-center text-muted-foreground hover:text-foreground text-[15px]">
                  <Activity className="w-4 h-4 mr-2" /> All Status <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
               </button>
            </div>
            <button className="text-muted-foreground hover:text-foreground text-[14px] underline underline-offset-4">Feedback</button>
         </div>

         {/* Empty State */}
         <div className="flex flex-col items-center justify-center py-20 text-center">
            <Video className="w-10 h-10 text-primary mb-6" />
            <h2 className="text-[22px] font-medium tracking-tight mb-3">No Meetings Yet</h2>
            <p className="text-[15px] text-muted-foreground mb-8">
               Once meetings are held, you'll see their processing<br/>status here.
            </p>
            <Button variant="outline" className="h-10 px-8 font-normal shadow-sm bg-background">Capture</Button>
         </div>

      </div>
    </div>
  );
}
