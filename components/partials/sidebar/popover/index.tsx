"use client";
import React, { useState } from "react";

import { cn, isLocationMatch, getDynamicPath } from "@/lib/utils";
import SidebarLogo from "../common/logo";
import { menusConfig } from "@/config/menus";
import MenuLabel from "../common/menu-label";
import SingleMenuItem from "./single-menu-item";
import SubMenuHandler from "./sub-menu-handler";
import NestedSubMenu from "../common/nested-menus";
import { useSidebar, useThemeStore } from "@/store";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import AddBlock from "../common/add-block";
import { useTranslations } from "next-intl";

const PopoverSidebar = () => {
  const t = useTranslations("Menu");
  const { collapsed, sidebarBg } = useSidebar();
  const { layout, isRtl } = useThemeStore();
  const menus: any = menusConfig?.sidebarNav?.classic || [];
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const [activeMultiMenu, setMultiMenu] = useState<number | null>(null);

  const toggleSubmenu = (i: number) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const toggleMultiMenu = (subIndex: number) => {
    if (activeMultiMenu === subIndex) {
      setMultiMenu(null);
    } else {
      setMultiMenu(subIndex);
    }
  };

  const pathname = usePathname();
  const locationName = getDynamicPath(pathname);

  React.useEffect(() => {
    let subMenuIndex = null;
    let multiMenuIndex = null;
    menus?.map((item: any, i: number) => {
      if (item?.child) {
        item.child.map((childItem: any, j: number) => {
          if (isLocationMatch(childItem.href, locationName)) {
            subMenuIndex = i;
          }
          if (childItem?.multi_menu) {
            childItem.multi_menu.map((multiItem: any, k: number) => {
              if (isLocationMatch(multiItem.href, locationName)) {
                subMenuIndex = i;
                multiMenuIndex = j;
              }
            });
          }
        });
      }
    });
    setActiveSubmenu(subMenuIndex);
    setMultiMenu(multiMenuIndex);
  }, [locationName]);

  // menu title

  return (
    <div
      className={cn("fixed  top-0  border-r  ", {
        "w-[248px]": !collapsed,
        "w-[72px]": collapsed,
        "m-6 bottom-0   bg-card rounded-md": layout === "semibox",
        "h-full   bg-card ": layout !== "semibox",
      })}
    >
      {sidebarBg !== "none" && (
        <div
          className=" absolute left-0 top-0   z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        ></div>
      )}
      <SidebarLogo />
      <Separator />
      <ScrollArea
        className={cn("sidebar-menu  h-[calc(100%-80px)] ", {
          "px-4": !collapsed,
        })}
      >
        <ul
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(" space-y-1", {
            " space-y-2 text-center": collapsed,
          })}
        >
          {menus.map((item: any, i: any) => (
            <li key={`menu_key_${i}`}>
              {/* single menu  */}

              {!item.child && !item.isHeader && (
                <SingleMenuItem item={item} collapsed={collapsed} trans={t} />
              )}

              {/* menu label */}
              {item.isHeader && !item.child && !collapsed && (
                <MenuLabel item={item} trans={t} />
              )}

              {/* sub menu */}
              {item.child && (
                <>
                  <SubMenuHandler
                    item={item}
                    toggleSubmenu={toggleSubmenu}
                    index={i}
                    activeSubmenu={activeSubmenu}
                    collapsed={collapsed}
                    menuTitle={item.title}
                    trans={t}
                  />
                  {!collapsed && (
                    <NestedSubMenu
                      toggleMultiMenu={toggleMultiMenu}
                      activeMultiMenu={activeMultiMenu}
                      activeSubmenu={activeSubmenu}
                      item={item}
                      index={i}
                      trans={t}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        {!collapsed && <div className="-mx-2 ">{/* <AddBlock /> */}</div>}
      </ScrollArea>
    </div>
  );
};

export default PopoverSidebar;
