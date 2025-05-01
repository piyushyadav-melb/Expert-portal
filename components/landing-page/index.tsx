"use client";
import Header from "./header";
import Hero from "./hero";
import LayoutLoader from "@/components/layout-loader";
import { useMounted } from "@/hooks/use-mounted";

const LandingPage = () => {
  const mounted = useMounted();
  if (!mounted) {
    return <LayoutLoader />;
  }
  return (
    <div className="bg-background">
      <Header />
      <Hero />
    </div>
  );
};

export default LandingPage;
