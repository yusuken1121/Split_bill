import React from "react";
import { PATH } from "@/constants/path";
import {
  LogOutIcon,
  Settings,
  ShoppingCart,
  ListTodo,
  LayoutDashboard,
  Receipt,
} from "lucide-react";

export const MENU_KEYS = {
  HOME: "home",
  PENDING: "pending",
  DASHBOARD: "dashboard",
  FIXED_COSTS: "fixed-costs",
  SETTINGS: "settings",
  LOGOUT: "logout",
} as const;

export type MenuKey = (typeof MENU_KEYS)[keyof typeof MENU_KEYS];

export interface SidebarItemConfig {
  label: string;
  path?: string;
  functionality?: () => void | Promise<void>;
  icon: React.ReactNode;
  activeColor?: string;
}

export const SIDEBAR_CONFIG: Record<MenuKey, SidebarItemConfig> = {
  [MENU_KEYS.HOME]: {
    label: "Add Item",
    path: PATH.HOME,
    icon: <ShoppingCart className="h-5 w-5" />,
    activeColor: "text-purple-600 dark:text-purple-400",
  },
  [MENU_KEYS.PENDING]: {
    label: "Pending Items",
    path: PATH.PENDING,
    icon: <ListTodo className="h-5 w-5" />,
    activeColor: "text-blue-600 dark:text-blue-400",
  },
  [MENU_KEYS.DASHBOARD]: {
    label: "Dashboard",
    path: PATH.DASHBOARD,
    icon: <LayoutDashboard className="h-5 w-5" />,
    activeColor: "text-green-600 dark:text-green-400",
  },
  [MENU_KEYS.FIXED_COSTS]: {
    label: "Fixed costs",
    path: PATH.FIXED_COSTS,
    icon: <Receipt className="h-5 w-5" />,
    activeColor: "text-orange-600 dark:text-orange-400",
  },
  [MENU_KEYS.SETTINGS]: {
    label: "Settings",
    path: PATH.SETTINGS,
    icon: <Settings className="h-4.5 w-4.5" />,
  },
  [MENU_KEYS.LOGOUT]: {
    label: "Logout",
    functionality: async () => {
      alert("Logout functionality called");
    },
    icon: <LogOutIcon className="h-4.5 w-4.5" />,
  },
};

export const mainSidebar: MenuKey[] = [
  MENU_KEYS.HOME,
  MENU_KEYS.PENDING,
  MENU_KEYS.DASHBOARD,
  MENU_KEYS.FIXED_COSTS,
];
export const manageSidebar: MenuKey[] = [MENU_KEYS.SETTINGS];
export const footerSidebar: MenuKey[] = [MENU_KEYS.LOGOUT];
