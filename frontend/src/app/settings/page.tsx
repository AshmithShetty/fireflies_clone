"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, Video, Bell, Sparkles, Monitor, Book, Code, Cookie, Users, User, HelpCircle, X, Calendar, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const sidebarLinks = [
    { name: "Recording & Privacy", icon: Video, active: true },
    { name: "Compliance Notification", icon: Bell },
    { name: "AI settings", icon: Sparkles },
    { name: "Live meeting", icon: Monitor },
    { name: "Knowledge base", icon: Book },
    { name: "MCP & Dev Tools", icon: Code },
    { name: "Cookies & analytics", icon: Cookie },
  ];

  const bottomLinks = [
    { name: "Members and groups", icon: Users },
    { name: "Account", icon: User },
    { name: "Support", icon: HelpCircle },
  ];

  return (
    <div className="flex h-full w-full bg-background overflow-hidden">
      {/* Settings Sidebar */}
      <div className="w-72 border-r flex flex-col h-full shrink-0">
        <div className="p-4 shrink-0">
          <Link href="/" className="flex items-center space-x-2 text-foreground font-medium mb-6 hover:text-muted-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center p-1 bg-muted/30 rounded-md border">
            <button className="flex-1 py-1.5 text-sm font-medium bg-background shadow-sm rounded-sm">Personal</button>
            <button className="flex-1 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">Team</button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-8">
          <nav className="space-y-1">
            {sidebarLinks.map((item) => (
              <button key={item.name} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm ${item.active ? 'text-primary font-medium' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}`}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
          
          <nav className="space-y-1">
            {bottomLinks.map((item) => (
              <button key={item.name} className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground`}>
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-xl border bg-background shadow-sm relative flex items-start space-x-3">
            <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5 text-lg">☺️</div>
            <div>
              <p className="text-sm font-medium">Did you like the settings?</p>
              <button className="text-xs text-muted-foreground underline hover:text-foreground mt-1">Share Feedback</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Content */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <div className="p-6 border-b shrink-0 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search Personal settings..." className="pl-10 h-11 bg-muted/10 rounded-lg text-[15px]" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-[22px] font-normal text-foreground mb-6">Recording</h2>
            
            {/* Setting Cards */}
            <div className="space-y-4">
              <div className="p-6 rounded-xl border bg-background shadow-sm flex items-start space-x-4">
                <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-medium">Auto-record meetings</h3>
                      <p className="text-[14px] text-muted-foreground mt-0.5">Fireflies notetaker will join and record your calendar events.</p>
                    </div>
                    <Switch />
                  </div>
                  <Button variant="outline" className="w-full justify-between h-10 font-normal text-muted-foreground">
                    Record all calendar events with a meeting link
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-xl border bg-background shadow-sm flex items-start space-x-4">
                <Video className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-medium flex items-center space-x-2">
                        <span>Capture meeting video</span>
                        <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center"><Sparkles className="w-3 h-3 text-primary" /></div>
                      </h3>
                      <p className="text-[14px] text-muted-foreground mt-0.5">Capture your meeting screen and shared content as video.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl border bg-background shadow-sm flex items-start space-x-4">
                <span className="text-xl text-muted-foreground shrink-0 mt-1 font-serif leading-none">T</span>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-medium">Meeting language</h3>
                      <p className="text-[14px] text-muted-foreground mt-0.5">For transcripts and summaries.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full justify-between h-10 font-normal text-muted-foreground">
                    English (Global)
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 rounded-xl border bg-background shadow-sm flex items-start space-x-4">
                <Trash2 className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[15px] font-medium flex items-center space-x-2">
                        <span>Auto-delete meetings</span>
                        <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center"><Sparkles className="w-3 h-3 text-primary" /></div>
                      </h3>
                      <p className="text-[14px] text-muted-foreground mt-0.5">Automatically delete meetings after a set retention period.</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
