"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@auth0/nextjs-auth0/types";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";


export function UserChip({ user }: { user: User | undefined | null }) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-background text-foreground">
            <Avatar>
              <AvatarFallback>{user?.name ? user.name[0] : 'U'}</AvatarFallback>
              <AvatarImage className="rounded-lg" src={user?.picture || ''} />
            </Avatar>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user?.name || 'Unknown'}
            </span>
            <span className="truncate text-xs">{user?.email || 'Unknown'}</span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <LogOut className="ml-auto" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle className="text-base text-destructive">Log out</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out?
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <a href="/auth/logout"><AlertDialogAction variant={'destructive'}>Log out</AlertDialogAction></a>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
