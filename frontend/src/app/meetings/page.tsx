"use client";

import { useEffect, useState, useMemo } from "react";
import { fetchMeetings } from "@/lib/api";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, MessageSquare, LayoutGrid, Hash, Sparkles, Bot, Mic, Calendar } from "lucide-react";
import { fetchTags } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { NewMeetingDialog } from "@/components/meetings/new-meeting-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { format, subDays, isAfter } from "date-fns";

import { Suspense } from "react";

function MeetingsLibraryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState(searchParams.get('search') || "");
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [filterType, setFilterType] = useState("hosted");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [askFredQuery, setAskFredQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // 'all', '7', '30'

  const loadData = async () => {
    setLoading(true);
    try {
      const [meetingsData, tagsData] = await Promise.all([fetchMeetings(), fetchTags()]);
      setMeetings(meetingsData);
      setTags(tagsData);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchParams.get('search')) {
      setFilterText(searchParams.get('search')!);
    }
  }, [searchParams]);

  const filteredMeetings = useMemo(() => {
    let result = [...meetings];
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      result = result.filter((m) =>
        m.title.toLowerCase().includes(lowerFilter) ||
        m.participants.some((p: any) => p.name.toLowerCase().includes(lowerFilter))
      );
    }
    if (selectedTags.size > 0) {
      result = result.filter((m) => m.tags.some((t: any) => selectedTags.has(t.name)));
    }
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = subDays(new Date(), days);
      result = result.filter((m) => isAfter(new Date(m.date), cutoffDate));
    }
    return result;
  }, [meetings, filterText, selectedTags, dateFilter]);

  const toggleTag = (name: string) => {
    const newSet = new Set(selectedTags);
    if (newSet.has(name)) newSet.delete(name);
    else newSet.add(name);
    setSelectedTags(newSet);
  };

  const handleAskFredSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && askFredQuery.trim()) {
      router.push(`/askfred?q=${encodeURIComponent(askFredQuery.trim())}`);
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Left Sidebar - Channels */}
      <div className="w-64 border-r flex flex-col h-full shrink-0">
        <div className="p-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search channels" className="pl-8 h-8 text-sm" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start h-8 px-2 text-primary bg-primary/5 font-medium">
              <Hash className="h-4 w-4 mr-2" /> My Meetings
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 font-normal text-muted-foreground">
              <LayoutGrid className="h-4 w-4 mr-2" /> All Meetings
            </Button>
            <Button variant="ghost" className="w-full justify-start h-8 px-2 font-normal text-muted-foreground">
              <MessageSquare className="h-4 w-4 mr-2" /> Voice Agent Meetings
            </Button>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium px-2 text-foreground">All channels</h3>
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-2 border border-dashed rounded-lg bg-muted/20 mx-2">
              <div className="h-8 w-8 rounded bg-pink-100 flex items-center justify-center text-pink-500 font-bold text-lg mb-1">#</div>
              <p className="text-xs text-muted-foreground max-w-[140px]">Create channels to organize your conversations</p>
              <Button variant="outline" size="sm" className="h-7 text-xs mt-2"><Plus className="h-3 w-3 mr-1" /> Channel</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle - Meetings List */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r">
        <div className="p-4 border-b flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-1 border rounded-md p-0.5 bg-muted/20">
            <Button onClick={() => setFilterType("hosted")} variant="ghost" size="sm" className={`h-7 px-4 text-sm ${filterType === 'hosted' ? 'bg-background shadow-sm' : 'text-muted-foreground font-normal'}`}>Hosted by me</Button>
            <Button onClick={() => setFilterType("shared")} variant="ghost" size="sm" className={`h-7 px-4 text-sm ${filterType === 'shared' ? 'bg-background shadow-sm' : 'text-muted-foreground font-normal'}`}>Shared with me</Button>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 text-sm" />}>
                <Calendar className="h-3.5 w-3.5 mr-2" /> Date
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuCheckboxItem checked={dateFilter === "all"} onCheckedChange={() => setDateFilter("all")}>All time</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={dateFilter === "7"} onCheckedChange={() => setDateFilter("7")}>Last 7 days</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={dateFilter === "30"} onCheckedChange={() => setDateFilter("30")}>Last 30 days</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 text-sm" />}>
                <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Filters
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedTags.has(tag.name)}
                    onCheckedChange={() => toggleTag(tag.name)}
                  >
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                 value={filterText}
                 onChange={e => setFilterText(e.target.value)}
                 className="h-8 w-48 pl-8 text-sm" 
                 placeholder="Search meetings..." 
              />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          {loading ? (
             <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
          ) : filteredMeetings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4">
               <div className="w-full space-y-3 opacity-20 pointer-events-none mb-4">
                  <div className="h-10 border rounded-lg bg-background w-3/4 mx-auto flex items-center px-4"><div className="w-4 h-4 bg-muted rounded mr-3"></div><div className="h-2 w-24 bg-muted rounded"></div></div>
                  <div className="h-10 border rounded-lg bg-background w-full flex items-center px-4"><div className="w-4 h-4 bg-muted rounded mr-3"></div><div className="h-2 w-32 bg-muted rounded"></div></div>
                  <div className="h-10 border rounded-lg bg-background w-5/6 mx-auto flex items-center px-4"><div className="w-4 h-4 bg-muted rounded mr-3"></div><div className="h-2 w-20 bg-muted rounded"></div></div>
               </div>
               <h2 className="text-lg font-semibold tracking-tight">Looks like you haven't recorded a meeting yet</h2>
               <p className="text-sm text-muted-foreground pb-2">Once you record your first meeting with Fireflies, it'll show up right here.</p>
               <Button variant="outline" onClick={() => setIsNewMeetingOpen(true)}>Capture</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  id={meeting.id}
                  title={meeting.title}
                  date={meeting.date}
                  duration={meeting.duration}
                  participants={meeting.participants}
                  tags={meeting.tags}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Ask Fred */}
      <div className="w-80 flex flex-col h-full bg-background shrink-0">
        <div className="p-4 flex items-center justify-between border-b shrink-0">
           <div className="flex items-center space-x-2 font-medium">
             <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-purple-600" /></div>
             <span>Ask Fred</span>
           </div>
           <div className="flex items-center space-x-1 text-muted-foreground">
             <Button variant="ghost" size="icon" className="w-7 h-7"><MessageSquare className="w-3.5 h-3.5" /></Button>
             <Button variant="ghost" size="icon" className="w-7 h-7"><Plus className="w-3.5 h-3.5" /></Button>
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           <div className="p-4 rounded-xl border shadow-sm flex items-start space-x-3 bg-background">
              <div className="w-6 h-6 bg-muted rounded-md flex items-center justify-center shrink-0">
                 <img src="https://www.gstatic.com/images/branding/product/1x/gmail_32dp.png" className="w-3 h-3" alt="Gmail" />
              </div>
              <div className="flex-1">
                 <p className="text-sm">Connect Slack and Gmail — get answers with full context.</p>
                 <button className="text-sm text-primary font-medium mt-2 flex items-center">Connect <span className="ml-1">›</span></button>
              </div>
           </div>
           
           <div>
              <Sparkles className="w-5 h-5 text-emerald-400 mb-3" />
              <h2 className="text-lg text-muted-foreground mb-1">Hi Ashmith!</h2>
              <h2 className="text-lg font-medium mb-4">Get ready for your meeting</h2>
              
              <div className="space-y-2">
                 <Button onClick={() => router.push('/askfred?q=Key%20initiatives')} variant="outline" className="w-full justify-start font-normal h-10 px-3 bg-background"><span className="text-rose-500 mr-2 text-lg">📌</span> Key initiatives</Button>
                 <Button onClick={() => router.push('/askfred?q=Summarize%20the%20channel')} variant="outline" className="w-full justify-start font-normal h-10 px-3 bg-background"><span className="mr-2 text-lg">📝</span> Summarize the channel</Button>
                 <Button onClick={() => router.push('/askfred?q=My%20action%20items')} variant="outline" className="w-full justify-start font-normal h-10 px-3 bg-background"><span className="text-emerald-500 mr-2 text-lg">✅</span> My action items</Button>
                 <Button onClick={() => router.push('/askfred?q=Key%20decisions')} variant="outline" className="w-full justify-start font-normal h-10 px-3 bg-background"><span className="text-blue-500 mr-2 text-lg">🎯</span> Key decisions</Button>
              </div>
           </div>
        </div>
        
        <div className="p-4 border-t shrink-0">
           <div className="flex items-center space-x-2 text-xs font-medium text-muted-foreground mb-2 px-1">
              <Hash className="w-3.5 h-3.5" /> <span>All Meetings</span>
           </div>
           <div className="relative">
              <Input 
                value={askFredQuery}
                onChange={e => setAskFredQuery(e.target.value)}
                onKeyDown={handleAskFredSearch}
                placeholder="Ask anything. Type / to run AI skills." 
                className="h-10 text-sm pr-10" 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-muted-foreground">
                 <Mic className="w-4 h-4" />
              </div>
           </div>
        </div>
      </div>
      
      <NewMeetingDialog
        open={isNewMeetingOpen}
        onOpenChange={setIsNewMeetingOpen}
        onSuccess={loadData}
      />
    </div>
  );
}

export default function MeetingsLibrary() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-muted-foreground">Loading meetings...</div>}>
      <MeetingsLibraryContent />
    </Suspense>
  );
}
