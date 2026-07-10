// Renders the left-hand navigation sidebar for main application routing.

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderClock, Settings, HelpCircle } from "lucide-react"

export function Sidebar() {
    const pathname = usePathname()

    const navItems = [
        { name: "Meetings", href: "/", icon: Home },
        { name: "Notebooks", href: "/notebooks", icon: FolderClock },
    ]

    const bottomItems = [
        { name: "Settings", href: "/settings", icon: Settings },
        { name: "Help", href: "/help", icon: HelpCircle },
    ]

    return (
        <aside className="w-64 border-r bg-muted/40 h-full flex flex-col justify-between">
            <div className="p-4 space-y-4">
                <div className="flex items-center space-x-2 px-2 font-bold text-xl mb-6">
                    <div className="w-6 h-6 bg-primary rounded-md" />
                    <span>Fireflies Clone</span>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="p-4 space-y-1">
                {bottomItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </div>
        </aside>
    )
}