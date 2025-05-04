"use client";
import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Icon } from "@iconify/react";
import ThemeButton from "@/components/partials/header/theme-button";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import FavIcon from "@/public/images/all-img/fav-icon.png";

const Header = () => {
  const [scroll, setScroll] = useState<boolean>(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 50);
    });
  }, []);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = React.useState<boolean>(false);
  const [show, setShow] = React.useState<boolean>(false);
  if (!isDesktop) {
    return (
      <>
        <div
          className={
            scroll
              ? "bg-card/50 dark:bg-card/70 backdrop-blur-lg z-50 shadow-sm fixed top-0 left-0 w-full py-3"
              : "fixed top-0 left-0 w-full py-3"
          }
        >
          <nav className="container flex justify-between relative z-50">
            <Link href="/" className="flex items-center gap-1">
              <Image
                src={FavIcon}
                alt="Company Fav icon"
                className="w-[39px] object-cover"
                priority={true}
              />{" "}
              <div className="flex-1  text-xl">
                <span className="text-blue-700 font-extrabold">Mind</span>{" "}
                <span className="text-gray-700 dark:text-primary font-light">
                  Namo
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-6">
              <ThemeButton />
              {/* <Button asChild size="sm">
                <Link
                  href="https://1.envato.market/TrexoPro-regular"
                  target="__blank"
                  className="text-sm font-semibold"
                >
                  <Icon
                    icon="heroicons:shopping-cart"
                    className="w-4 h-4 mr-1.5"
                  />
                  Buy Now
                </Link>
              </Button> */}
              {/* <button type="button">
                <Menu
                  className=" h-6 w-6 cursor-pointer"
                  onClick={() => setOpen(!open)}
                />
              </button> */}
            </div>
          </nav>
        </div>
      </>
    );
  }
  return (
    <div
      className={
        scroll
          ? "bg-card/50 backdrop-blur-lg shadow-xl z-30 dark:bg-card/70 fixed top-0 left-0 w-full py-3"
          : " z-30 fixed top-0 left-0 w-full py-3"
      }
    >
      <nav className="container flex justify-between">
        <Link
          target="_blank"
          href="/dashboard"
          className="flex items-center gap-1"
        >
          <Image
            src={FavIcon}
            alt="Company Fav icon"
            className="w-[39px] object-cover"
            priority={true}
          />{" "}
          <div className="flex-1  text-xl">
            <span className="text-primary font-extrabold">Mind</span>{" "}
            <span className="text-gray-700 dark:text-primary font-light">
              Namo
            </span>
          </div>
        </Link>
        {/* <NavMenu /> */}
        <div className="flex items-center gap-6">
          <ThemeButton />
        </div>
      </nav>
    </div>
  );
};

export default Header;
