import React from "react";
import { Search } from "lucide-react";
import { SiteLogo } from "@/components/svg";
import Link from "next/link";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";

const horizontalHeader = ({
  handleOpenSearch,
}: {
  handleOpenSearch: () => void;
}) => {
  return (
    <div className="flex items-center lg:gap-12 gap-3 ">
      <div>
        <Link
          href="/dashboard"
          className=" text-primary flex items-center gap-2"
        >
          <Image
            src={FavIcon}
            alt="dashboard - Company Fav icon"
            className="w-[39px] object-cover"
            priority={true}
          />
          <span className=" text-xl lg:inline-block hidden">
            {" "}
            <span className="text-primary font-extrabold">Mind</span>{" "}
            <span className="text-gray-700 font-light">Namo</span>
          </span>
        </Link>
      </div>
      {/* <button
        onClick={handleOpenSearch}
        className=" inline-flex lg:gap-2 lg:mr-0 mr-2 items-center text-default-600 text-sm"
      >
        <span>
          <Search className=" h-4 w-4" />
        </span>
        <span className=" lg:inline-block hidden"> Search...</span>
      </button> */}
    </div>
  );
};

export default horizontalHeader;
