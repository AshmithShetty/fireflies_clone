"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { fetchUsers, updateMeetingMetadata } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface EditMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: any;
  onSuccess: () => void;
}

export function EditMeetingDialog({ open, onOpenChange, meeting, onSuccess }: EditMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && meeting) {
      setTitle(meeting.title);
      setSelectedUserIds(new Set(meeting.participants.map((p: any) => p.id)));
      fetchUsers().then(setUsers).catch(console.error);
    }
  }, [open, meeting]);

  const toggleUser = (id: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUserIds(newSet);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");

    setLoading(true);
    try {
      await updateMeetingMetadata(meeting.id, {
        title,
        participant_ids: Array.from(selectedUserIds),
      });
      toast.success("Meeting updated!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error("Failed to update meeting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Meeting</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Marketing Sync" required />
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
