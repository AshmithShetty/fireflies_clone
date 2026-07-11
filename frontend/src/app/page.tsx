"use client";

import { useEffect, useState } from "react";
import { fetchMeetings, fetchTags } from "@/lib/api";
import { MeetingCard } from "@/components/meetings/meeting-card";
import { Button } from "@/components/ui/button";
import { Calendar, Upload, Plus, Settings, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { NewMeetingDialog } from "@/components/meetings/new-meeting-dialog";

export default function Home() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Recent");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  const { currentUser } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchMeetings({ search: debouncedSearch, dateFilter, tag: selectedTag });
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load meetings", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [debouncedSearch, dateFilter, selectedTag]);

  useEffect(() => {
    async function loadTags() {
      try {
        const data = await fetchTags();
        setAvailableTags(data);
      } catch (error) {
        console.error("Failed to load tags", error);
      }
    }
    loadTags();
  }, []);

  const reloadData = async () => {
    setLoading(true);
    try {
      const data = await fetchMeetings({ search: debouncedSearch, dateFilter, tag: selectedTag });
      setMeetings(data);
    } catch (error) {
      console.error("Failed to load meetings", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
         <div className="flex-1 space-y-4">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Welcome Aboard, {currentUser.name.split(' ')[0]}!</h1>
            <p className="text-base text-muted-foreground max-w-[400px] leading-relaxed">
               Fireflies is now ready to automate your meetings and streamline your workflows.
            </p>
         </div>
         <div className="w-full md:w-[400px] h-[200px] rounded-xl overflow-hidden shadow-lg border relative bg-gradient-to-br from-indigo-900 via-purple-900 to-primary">
            {/* Mocked UI graphic inside the banner */}
            <div className="absolute inset-4 bg-background/10 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col p-4 space-y-3">
               <div className="flex items-center space-x-2 text-white/90 text-sm font-medium">
                  <div className="w-4 h-4 bg-primary rounded flex items-center justify-center text-[10px]">F</div>
                  <span>Fireflies Product Demo</span>
               </div>
               <div className="flex-1 flex items-center justify-center">
                  <div className="w-16 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                     <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
               </div>
               <div className="flex items-center space-x-2 mt-auto">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 border border-white/20"></div>
                  <div className="h-2 w-16 bg-white/20 rounded-full"></div>
               </div>
            </div>
         </div>
      </div>

      {/* Quick Start Section */}
      <div className="space-y-6">
         <div className="space-y-1.5">
            <h2 className="text-xl font-medium tracking-tight">Quick Start</h2>
            <p className="text-sm text-muted-foreground">Capture your first meeting or upload a recording to see Fireflies in action.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setIsNewMeetingOpen(true)} variant="outline" className="h-14 justify-between px-5 font-normal hover:bg-muted/50 border-muted-foreground/20 shadow-sm">
               <div className="flex items-center space-x-3 text-foreground">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span className="text-[15px]">Schedule Meeting</span>
               </div>
               <span className="text-muted-foreground">›</span>
            </Button>
            <Button onClick={() => setIsNewMeetingOpen(true)} variant="outline" className="h-14 justify-between px-5 font-normal hover:bg-muted/50 border-muted-foreground/20 shadow-sm">
               <div className="flex items-center space-x-3 text-foreground">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  <span className="text-[15px]">Upload File</span>
               </div>
               <span className="text-muted-foreground">›</span>
            </Button>
            <Button onClick={() => setIsNewMeetingOpen(true)} variant="outline" className="h-14 justify-between px-5 font-normal hover:bg-muted/50 border-muted-foreground/20 shadow-sm">
               <div className="flex items-center space-x-3 text-foreground">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span className="text-[15px]">Capture Meeting</span>
               </div>
               <span className="text-muted-foreground">›</span>
            </Button>
         </div>
      </div>

      {/* Meetings Section */}
      <div className="space-y-6 pt-4">
         <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-0 gap-4">
            <div className="flex items-center space-x-6 h-10 px-1">
               <button onClick={() => setActiveTab("Recent")} className={`h-full border-b-2 text-sm ${activeTab === 'Recent' ? 'border-foreground text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground font-medium'}`}>Recent</button>
               <button onClick={() => setActiveTab("Upcoming")} className={`h-full border-b-2 text-sm ${activeTab === 'Upcoming' ? 'border-foreground text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground font-medium'}`}>Upcoming</button>
               <button onClick={() => setActiveTab("AI Feed")} className={`h-full border-b-2 text-sm ${activeTab === 'AI Feed' ? 'border-foreground text-foreground font-medium' : 'border-transparent text-muted-foreground hover:text-foreground font-medium'}`}>AI Feed</button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 pb-2 md:pb-1">
               <div className="relative w-full md:w-56 lg:w-64">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input
                       placeholder="Search meetings..."
                       className="pl-8 h-9"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                   />
               </div>
               
               <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[130px] h-9">
                     <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="All Time">All Time</SelectItem>
                     <SelectItem value="Today">Today</SelectItem>
                     <SelectItem value="Past 7 Days">Past 7 Days</SelectItem>
                     <SelectItem value="Past 30 Days">Past 30 Days</SelectItem>
                  </SelectContent>
               </Select>
               
               <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-[130px] h-9">
                     <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="All Tags">All Tags</SelectItem>
                     {availableTags.map(tag => (
                         <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                     ))}
                  </SelectContent>
               </Select>

               <Button onClick={() => router.push('/settings')} variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-foreground font-normal ml-2 hidden lg:flex">
                  <Settings className="w-4 h-4 mr-1.5" />
                  Settings
               </Button>
            </div>
         </div>

         <div className="pt-2">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                  {[1, 2, 3].map((i) => (
                     <div key={i} className="h-40 bg-muted rounded-xl"></div>
                  ))}
               </div>
            ) : activeTab === "Recent" && meetings.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {meetings.slice(0, 6).map((meeting) => (
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
            ) : (
               <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  {activeTab === "Recent" ? "No recent meetings found." : `No ${activeTab.toLowerCase()} items found.`}
               </div>
            )}
         </div>
      </div>

      <NewMeetingDialog
        open={isNewMeetingOpen}
        onOpenChange={setIsNewMeetingOpen}
        onSuccess={reloadData}
      />
    </div>
  );
}