import { DashBoard, Settings, User } from "@/components/svg";
import { LayoutDashboard, CalendarClock, BookOpen, Video, MessageCircle } from "lucide-react";

export interface MenuItemProps {
  title: string;
  icon: any;
  href?: string;
  child?: MenuItemProps[];
  megaMenu?: MenuItemProps[];
  multi_menu?: MenuItemProps[];
  nested?: MenuItemProps[];
  onClick: () => void;
}

export const menusConfig = {
  mainNav: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      title: "Schedule",
      icon: CalendarClock,
      href: "/schedule",
    },
    {
      title: "Bookings",
      icon: BookOpen,
      href: "/bookings",
    },
    {
      title: "Meetings",
      icon: Video,
      href: "/meetings",
    },
    {
      title: "Chat",
      icon: MessageCircle,
      href: "/chat",
    },
    {
      title: "Profile",
      icon: User,
      href: "/profile",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Schedule",
        icon: CalendarClock,
        href: "/schedule",
      },
      {
        title: "Bookings",
        icon: BookOpen,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Video,
        href: "/meetings",
      },
      {
        title: "Chat",
        icon: MessageCircle,
        href: "/chat",
      },
      {
        title: "Profile",
        icon: User,
        href: "/profile",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Schedule",
        icon: CalendarClock,
        href: "/schedule",
      },
      {
        title: "Bookings",
        icon: BookOpen,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Video,
        href: "/meetings",
      },
      {
        title: "Chat",
        icon: MessageCircle,
        href: "/chat",
      },
      {
        title: "Profile",
        icon: User,
        href: "/profile",
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
