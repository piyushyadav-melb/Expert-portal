import React from "react";
import Schedule from "@/components/schedule/Schedule";
import UnavailableDates from "@/components/unavailable-dates";

interface IPageProps {
  params: {
    lang: any;
  };
}

const Page: React.FunctionComponent<IPageProps> = async () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3">
        <Schedule />
      </div>
      <div className="lg:col-span-2">
        <UnavailableDates />
      </div>
    </div>
  );
};

export default Page;
