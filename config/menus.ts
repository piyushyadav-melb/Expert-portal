import { DashBoard, Settings } from "@/components/svg";

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
      icon: DashBoard,
      href: "/dashboard",
    },
    {
      title: "Schedule",
      icon: Settings,
      href: "/schedule",
    },
    {
      title: "Bookings",
      icon: Settings,
      href: "/bookings",
    },
    {
      title: "Meetings",
      icon: Settings,
      href: "/meetings",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ],
  sidebarNav: {
    modern: [
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Schedule",
        icon: Settings,
        href: "/schedule",
      },
      {
        title: "Bookings",
        icon: Settings,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Settings,
        href: "/meetings",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/settings",
      },
    ],
    classic: [
      {
        isHeader: true,
        title: "menu",
      },
      {
        title: "Dashboard",
        icon: DashBoard,
        href: "/dashboard",
      },
      {
        title: "Schedule",
        icon: Settings,
        href: "/schedule",
      },
      {
        title: "Bookings",
        icon: Settings,
        href: "/bookings",
      },
      {
        title: "Meetings",
        icon: Settings,
        href: "/meetings",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/settings",
      },
    ],
  },
};

export type ModernNavType = (typeof menusConfig.sidebarNav.modern)[number];
export type ClassicNavType = (typeof menusConfig.sidebarNav.classic)[number];
export type MainNavType = (typeof menusConfig.mainNav)[number];
