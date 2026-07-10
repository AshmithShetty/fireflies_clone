"use client";

import { Button } from "@/components/ui/button";
import { Upload, Inbox } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewMeetingDialog } from "@/components/meetings/new-meeting-dialog";

export default function UploadsPage() {
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const router = useRouter();
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden p-10">
      <div className="max-w-[800px] mx-auto w-full space-y-12">
         
         {/* Upload Area */}
         <div className="border-2 border-dashed border-primary/30 rounded-2xl bg-primary/5 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
               <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-[22px] font-medium tracking-tight mb-3">Upload a file to generate a transcript</h2>
            <p className="text-[14px] text-muted-foreground mb-8">
               Browse or drag and drop <strong>MP3, M4A, WAV, MP4</strong> or <strong>WEBM</strong> files. (Max video size: 100 MB, Max audio size: 500 MB)
            </p>
            <Button onClick={() => setIsNewMeetingOpen(true)} variant="outline" className="h-10 px-8 font-normal shadow-sm bg-background">Browse Files</Button>
         </div>

         {/* Empty State */}
         <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/60">
            <Inbox className="w-16 h-16 mb-6 opacity-50" strokeWidth={1} />
            <h3 className="text-xl font-medium text-foreground">You have no recent uploads!</h3>
         </div>
      </div>
      
      <NewMeetingDialog
        open={isNewMeetingOpen}
        onOpenChange={setIsNewMeetingOpen}
        onSuccess={() => router.push('/meetings')}
      />
    </div>
  );
}
