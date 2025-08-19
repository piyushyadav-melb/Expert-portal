"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Header from "@/components/partials/header";
import Sidebar from "@/components/partials/sidebar";
import Footer from "@/components/partials/footer";
import ThemeCustomize from "@/components/partials/customizer/theme-customizer";
import MobileSidebar from "@/components/partials/sidebar/mobile-sidebar";
import HeaderSearch from "@/components/header-search";
import LayoutLoader from "@/components/layout-loader";
import { useSidebar, useThemeStore } from "@/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMounted } from "@/hooks/use-mounted";
import { useAppSelector } from "@/hooks";
import { fetchProfile } from "@/service/profile.service";
import toast from "react-hot-toast";
import { useSocket } from "@/config/use-socket";
interface IDashboardLayoutProps {
  children: ReactNode;
}

const LayoutWrapper = ({
  children,
  isMobile,
  setOpen,
  open,
  location,
}: {
  children: React.ReactNode;
  isMobile: boolean;
  setOpen: any;
  open: boolean;
  location: any;
}) => {
  return (
    <>
      <motion.div
        key={location}
        initial="pageInitial"
        animate="pageAnimate"
        exit="pageExit"
        variants={{
          pageInitial: {
            opacity: 0,
            y: 50,
          },
          pageAnimate: {
            opacity: 1,
            y: 0,
          },
          pageExit: {
            opacity: 0,
            y: -50,
          },
        }}
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.5,
        }}
      >
        <main>{children}</main>
      </motion.div>
      <MobileSidebar className="left-[300px]" />
      <HeaderSearch open={open} setOpen={setOpen} />
    </>
  );
};

const DashboardLayout: React.FC<IDashboardLayoutProps> = ({ children }) => {
  const { collapsed, sidebarType, setCollapsed, subMenu } = useSidebar();
  const [open, setOpen] = useState(false);
  const { layout } = useThemeStore();
  const location = usePathname();
  const isMobile = useMediaQuery("(min-width: 768px)");
  const mounted = useMounted();
  const navigation = useRouter();
  const socket = useSocket();

  const fetchProfileData = async () => {
    const response: any = await fetchProfile();
    //If profile is not completed, redirect to onboarding step
    if (!response?.data?.is_profile_completed) {
      console.log("profile step", response?.data?.step_completed);
      const step =
        response?.data?.step_completed == "0"
          ? "step-1"
          : response?.data?.step_completed == "1"
            ? "step-2"
            : "step-3";
      console.log("step", step);
      toast.error("Please complete your profile to continue");
      navigation.replace(`onboarding/${step}`);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (!mounted) {
    return <LayoutLoader />;
  }
  if (layout === "semibox") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} />
        <Sidebar />
        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
            "ltr:xl:ml-[272px] rtl:xl:mr-[272px]": !collapsed,
          })}
        >
          <div className={cn("pt-6 pb-8 px-4  page-min-height-semibox ")}>
            <div className="semibox-content-wrapper ">
              <LayoutWrapper
                isMobile={isMobile}
                setOpen={setOpen}
                open={open}
                location={location}
              >
                {children}
              </LayoutWrapper>
            </div>
          </div>
        </div>
        <Footer handleOpenSearch={() => setOpen(true)} />
        <ThemeCustomize />
      </>
    );
  }
  if (layout === "horizontal") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} />
        <div className={cn("content-wrapper transition-all duration-150 ")}>
          <div
            className={cn("  pt-6 px-6 pb-8  page-min-height-horizontal ", {})}
          >
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        {/* <Footer handleOpenSearch={() => setOpen(true)} /> */}
        <ThemeCustomize />
      </>
    );
  }
  if (sidebarType !== "module") {
    return (
      <>
        <Header handleOpenSearch={() => setOpen(true)} />
        <Sidebar />
        <div
          className={cn("content-wrapper transition-all duration-150 ", {
            "ltr:xl:ml-[248px] rtl:xl:mr-[248px] ": !collapsed,
            "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
          })}
        >
          <div className={cn("  pt-6 px-6 pb-8  page-min-height ", {})}>
            <LayoutWrapper
              isMobile={isMobile}
              setOpen={setOpen}
              open={open}
              location={location}
            >
              {children}
            </LayoutWrapper>
          </div>
        </div>
        {/* <Footer handleOpenSearch={() => setOpen(true)} /> */}
        <ThemeCustomize />
      </>
    );
  }
  return (
    <>
      <Header handleOpenSearch={() => setOpen(true)} />
      <Sidebar />
      <div
        className={cn("content-wrapper transition-all duration-150 ", {
          "ltr:xl:ml-[300px] rtl:xl:mr-[300px]": !collapsed,
          "ltr:xl:ml-[72px] rtl:xl:mr-[72px]": collapsed,
        })}
      >
        <div className={cn(" layout-padding px-6 pt-6  page-min-height ")}>
          <LayoutWrapper
            isMobile={isMobile}
            setOpen={setOpen}
            open={open}
            location={location}
          >
            {children}
          </LayoutWrapper>
        </div>
      </div>
      {/* <Footer handleOpenSearch={() => setOpen(true)} /> */}
      {isMobile && <ThemeCustomize />}
    </>
  );
};

export default DashboardLayout;
