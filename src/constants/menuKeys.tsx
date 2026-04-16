import React from "react";
import { PATH } from "@/constants/path";
import {
  LogOutIcon,
  Settings,
  ShoppingCart,
} from "lucide-react";

export const MENU_KEYS = {
  HOME: "home",
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
    label: "Shopping List",
    path: PATH.HOME,
    icon: <ShoppingCart className="h-5 w-5" />,
    activeColor: "text-purple-600 dark:text-purple-400",
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

export const mainSidebar: MenuKey[] = [MENU_KEYS.HOME];
export const manageSidebar: MenuKey[] = [MENU_KEYS.SETTINGS];
export const footerSidebar: MenuKey[] = [MENU_KEYS.LOGOUT];
