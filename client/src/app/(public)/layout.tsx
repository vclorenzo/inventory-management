"use client";

import React, { useEffect } from "react";
import { useMe } from "@/hooks/useMe";
import { useAppSelector } from "@/state/redux";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};

const PublicLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const { me, isLoading: isMeLoading } = useMe();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isMarketplaceRoute =
    pathname.startsWith("/marketplace") || pathname.startsWith("/auctions");
  const shouldShowSidebar = Boolean(me) && isMarketplaceRoute;

  useEffect(() => {
    if (!isMeLoading && me && isAuthPage) {
      router.replace("/");
    }
  }, [isAuthPage, isMeLoading, me, router]);

  if (isAuthPage && isMeLoading) {
    return (
      <div className="py-4 w-full min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (me && isAuthPage) return null;

  return (
    <div className="flex bg-gray-50 text-gray-900 w-full min-h-screen">
      {shouldShowSidebar && <Sidebar />}
      <main
        className={`flex flex-col w-full h-full bg-gray-50 py-7 px-9 ${
          shouldShowSidebar
            ? isSidebarCollapsed
              ? "md:pl-24"
              : "md:pl-72"
            : ""
        }`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const layout = ({ children }: Props) => {
  return <PublicLayout>{children}</PublicLayout>;
};

export default layout;
