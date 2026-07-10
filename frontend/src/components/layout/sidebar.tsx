"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bot, Video, Activity, Upload, Layers, BarChart, Mic, Sparkles, Users, Lock, X, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function Sidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)

    const navGroups = [
        [
            { name: "Home", href: "/", icon: Home },
            { name: "AskFred", href: "/askfred", icon: Bot, shortcut: "Ctrl + J" },
            { name: "Meetings", href: "/meetings", icon: Video },
            { name: "Meeting Status", href: "/meeting-status", icon: Activity },
            { name: "Uploads", href: "/uploads", icon: Upload },
        ],
        [
            { name: "Integrations", href: "/integrations", icon: Layers },
            { name: "Analytics", href: "/analytics", icon: BarChart },
        ],
        [
            { name: "Voice Agents", href: "/voice-agents", icon: Mic, badge: "NEW" },
            { name: "AI Skills", href: "/ai-skills", icon: Sparkles, iconColor: "text-primary" },
        ],
        [
            { name: "Team", href: "/settings", icon: Users },
        ]
    ]

    return (
        <aside className={`${isCollapsed ? "w-[68px]" : "w-64"} border-r bg-background h-full flex flex-col justify-between shrink-0 overflow-y-auto transition-all duration-300 ease-in-out`}>
            <div className="p-4 flex-1">
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6 mt-2`}>
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2 px-2 font-bold text-xl">
                            <div className="w-6 h-6 flex flex-wrap bg-background shadow-sm border rounded-sm overflow-hidden p-0.5 gap-0.5">
                                <div className="w-[8px] h-[8px] bg-pink-500 rounded-sm"></div>
                                <div className="w-[8px] h-[8px] bg-purple-500 rounded-sm"></div>
                                <div className="w-[8px] h-[8px] bg-indigo-500 rounded-sm"></div>
                                <div className="w-[8px] h-[8px] bg-primary rounded-sm"></div>
                            </div>
                            <span className="tracking-tight text-[1.35rem]">fireflies.ai</span>
                        </div>
                    )}
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 text-muted-foreground border shadow-sm rounded-md ${isCollapsed ? 'mb-2' : ''}`}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                    >
                        {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                    </Button>
                </div>
                <nav className="space-y-4">
                    {navGroups.map((group, idx) => (
                        <div key={idx} className="space-y-0.5">
                            {group.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 rounded-md transition-colors ${isActive
                                            ? "bg-muted/60 text-primary font-medium"
                                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground font-normal"
                                            }`}
                                        title={isCollapsed ? item.name : undefined}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Icon className={`w-[18px] h-[18px] ${item.iconColor || ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                            {!isCollapsed && <span className="text-[14px]">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <>
                                                {item.shortcut && <span className="text-[10px] text-muted-foreground">{item.shortcut}</span>}
                                                {item.badge && <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded-sm bg-muted">{item.badge}</span>}
                                            </>
                                        )}
                                    </Link>
                                )
                            })}
                            {idx < navGroups.length - 1 && <div className="border-b my-2" />}
                        </div>
                    ))}
                    
                    <div className="border-b my-2" />
                    <Link
                        href="/privacy"
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-md transition-colors hover:bg-muted/40 text-muted-foreground hover:text-foreground font-normal`}
                        title={isCollapsed ? "Your Privacy Choices" : undefined}
                    >
                        <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
                        {!isCollapsed && <span className="text-[14px]">Your Privacy Choices</span>}
                    </Link>
                </nav>
            </div>

            <div className={`p-4 mt-auto ${isCollapsed ? 'px-2' : ''}`}>
                {!isCollapsed ? (
                    <div className="p-4 rounded-xl border bg-background flex flex-col space-y-3 relative shadow-sm">
                        <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                            <X className="w-3.5 h-3.5" />
                        </button>
                        <p className="text-sm text-foreground">Invite coworkers to your Fireflies team</p>
                        <Button variant="outline" className="w-full h-8 text-xs bg-background">Create Team</Button>
                    </div>
                ) : (
                    <Button variant="outline" size="icon" className="w-full h-10 border-dashed bg-muted/30" title="Create Team">
                        <Users className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </aside>
    )
}