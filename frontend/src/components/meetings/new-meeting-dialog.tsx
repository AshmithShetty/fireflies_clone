"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetchUsers, fetchTags, createMeeting } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NewMeetingDialog({ open, onOpenChange, onSuccess }: NewMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("3600");
  const [mediaUrl, setMediaUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedTagNames, setSelectedTagNames] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers().then(setUsers).catch(console.error);
      fetchTags().then(setTags).catch(console.error);
      setTitle("");
      setDate(new Date().toISOString().slice(0, 16));
      setDuration("3600");
      setMediaUrl("");
      setTranscript("");
      setSelectedUserIds(new Set());
      setSelectedTagNames(new Set());
    }
  }, [open]);

  const toggleUser = (id: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const toggleTag = (name: string) => {
    const newSet = new Set(selectedTagNames);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedTagNames(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return toast.error("Title and date are required");

    setLoading(true);
    try {
      await createMeeting({
        title,
        date: new Date(date).toISOString(),
        duration: parseInt(duration),
        media_url: mediaUrl || undefined,
        transcript: transcript || undefined,
        participant_ids: Array.from(selectedUserIds),
        tag_names: Array.from(selectedTagNames)
      });
      toast.success("Meeting created!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Marketing Sync" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Duration (seconds)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="flex flex-wrap gap-2">
              {users.map(u => (
                <Badge
                  key={u.id}
                  variant={selectedUserIds.has(u.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleUser(u.id)}
                >
                  {u.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <Badge
                  key={t.id}
                  variant={selectedTagNames.has(t.name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(t.name)}
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Media URL (optional)</Label>
            <Input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://example.com/video.mp4" />
          </div>
          <div className="space-y-2">
            <Label>Transcript (optional)</Label>
            <Textarea 
              value={transcript} 
              onChange={e => setTranscript(e.target.value)} 
              placeholder="Paste raw transcript text here to generate meeting notes and action items..." 
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
