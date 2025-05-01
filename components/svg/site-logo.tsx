import React from "react";
import Image from "next/image";
import FavIcon from "@/public/images/all-img/fav-icon.png";
const SiteLogo = () => {
  return (
    <Image
      src={FavIcon}
      alt="dashboard - Company Fav icon"
      className="w-[39px] m-auto object-cover"
      priority={true}
    />
  );
};

export default SiteLogo;
