"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";

const LayoutLoader = () => {
  return (
    <div className=" h-screen flex items-center justify-center flex-col space-y-2">
      <Image
        src={FavIcon}
        alt="Company Fav icon"
        className="w-[39px] object-cover"
        priority={true}
      />{" "}
      <span className=" inline-flex gap-1">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </span>
    </div>
  );
};

export default LayoutLoader;
