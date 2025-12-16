"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  Plane,
  FileText,
  Trophy,
  Megaphone,
  LayoutDashboard,
  Settings,
  UserCog,
  Dumbbell,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Roster", href: "/dashboard/roster", icon: Users },
  { name: "Travel", href: "/dashboard/travel", icon: Plane },
  { name: "Games", href: "/dashboard/games", icon: Trophy },
  { name: "Workouts", href: "/dashboard/workouts", icon: Dumbbell },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
  { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
]

const adminNavigation = [
  { name: "Team", href: "/dashboard/team", icon: UserCog },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ userRole }: { userRole?: string }) {
  const pathname = usePathname()
  const isHeadCoach = userRole === "HEAD_COACH"

  return (
    <>
      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚾</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CoachHub</h1>
                  <p className="text-xs text-gray-500">Baseball</p>
                </div>
              </div>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}

              {isHeadCoach && (
                <>
                  <div className="my-4 border-t border-gray-200"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </div>
                  {adminNavigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </>
              )}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center w-full">
              v1.0.0 • Port 7373
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
