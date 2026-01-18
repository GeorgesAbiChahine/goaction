"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Files,
  Home,
} from "lucide-react";
import type { Route } from "./nav-main";
import DashboardNavigation from "./nav-main";
import { UserChip } from "./user-chip";
import { useUser } from "@auth0/nextjs-auth0";

const dashboardRoutes: Route[] = [
  {
    id: "home",
    title: "Home",
    icon: <Home className="size-4" />,
    link: "/dashboard",
  },
  {
    id: "files",
    title: "Files",
    icon: <Files className="size-4" />,
    link: "/dashboard/files",
  },
]

export function DashboardSidebar() {
  const { state } = useSidebar();
  const { user } = useUser();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <a href='/dashboard' className="flex justify-center items-center gap-2">

          {!isCollapsed ? (
            <div className="text-2xl text-center my-auto font-(family-name:--font-instrument-serif)">vectra</div>
          )
            :
            <div className="text-2xl size-8 flex justify-center items-center text-center my-auto font-(family-name:--font-instrument-serif)">V</div>

          }
        </a>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <DashboardNavigation routes={dashboardRoutes} />
      </SidebarContent>
      <SidebarFooter className="px-2">
        <UserChip user={user || undefined} />
      </SidebarFooter>
    </Sidebar>
  );
}
