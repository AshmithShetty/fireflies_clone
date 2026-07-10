"use client"

import { usePathname, useRouter } from "next/navigation"
import { Bell, Mic, Search, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuGroup,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAppStore } from "@/store/useAppStore"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { NewMeetingDialog } from "@/components/meetings/new-meeting-dialog"

const pathnameToTitle: Record<string, string> = {
    "/": "Home",
    "/askfred": "AskFred",
    "/meetings": "Meetings",
    "/meeting-status": "Meeting Status",
    "/uploads": "Uploads",
    "/integrations": "Integrations",
    "/analytics": "Analytics",
    "/voice-agents": "Voice Agents",
    "/ai-skills": "AI Skills",
    "/settings": "Settings",
    "/privacy": "Your Privacy Choices"
}

export function TopNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { currentUser } = useAppStore()
    const { theme, setTheme } = useTheme()
    const [searchQuery, setSearchQuery] = useState("")
    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false)

    // Determine the title based on the pathname, defaulting to empty if not found
    let title = pathnameToTitle[pathname] || ""
    if (pathname.startsWith('/meeting/')) {
        title = "Meetings" // Specific meeting detail view
    }

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <header className="h-16 border-b bg-background flex items-center px-6 sticky top-0 z-10 shrink-0">
            {/* Left - Page Title */}
            <div className="flex-1 shrink-0">
                <span className="text-[17px] text-muted-foreground">{title}</span>
            </div>

            {/* Center - Global Search */}
            <div className="flex-1 max-w-[420px] flex items-center justify-center shrink-0">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by title or keyword" 
                        className="w-full pl-9 pr-14 h-9 bg-background rounded-md text-sm shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <span className="text-[11px] text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">Ctrl + K</span>
                    </div>
                </div>
            </div>

            {/* Right - Actions & Profile */}
            <div className="flex-1 flex items-center justify-end space-x-3 shrink-0">
                <Button variant="outline" className="h-9 px-4 text-emerald-600 border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-700 font-medium">
                    Upgrade
                </Button>
                <Button onClick={() => setIsNewMeetingOpen(true)} variant="ghost" className="h-9 px-4 text-muted-foreground font-medium hover:text-foreground">
                    Capture
                </Button>
                <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10">
                    <Mic className="h-[18px] w-[18px]" strokeWidth={2.5} />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-sm ml-2" />}>
                        <Avatar className="h-8 w-8 rounded-sm">
                            <AvatarFallback className="rounded-sm bg-foreground text-background font-medium">
                                {currentUser.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {currentUser.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem>Billing</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Log out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <NewMeetingDialog
                open={isNewMeetingOpen}
                onOpenChange={setIsNewMeetingOpen}
                onSuccess={() => {
                    // Optional: trigger a refresh if on a list view
                    if (pathname === '/' || pathname === '/meetings') {
                        window.location.reload()
                    }
                }}
            />
        </header>
    )
}