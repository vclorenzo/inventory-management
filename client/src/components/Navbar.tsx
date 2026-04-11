"use client";
import { setIsSidebarCollapsed } from "@/state";
import { api } from "@/state/api";
import { externalApi } from "@/state/externalApi";
import { useSignOutMutation } from "@/state/internal/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  toggleDarkMode,
  useIsDarkModeVisible,
  useIsNotificationVisible,
} from "@/utils/global";
import {
  Bell,
  Bookmark,
  Gavel,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

//hooks
import { useMe } from "@/hooks/useMe";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = useCallback(() => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  }, [dispatch, isSidebarCollapsed]);

  const isDarkModeVisible = useIsDarkModeVisible();
  const isNotificationVisible = useIsNotificationVisible();

  const { me } = useMe();
  const { name, email } = me?.user ?? { name: "", email: "" };
  const [signOut] = useSignOutMutation();

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const initials = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <div className="flex justify-between items-center w-full mb-7">
        <div className="flex justify-between items-center gap-5">
          <button
            type="button"
            className="px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
            onClick={toggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link
            href="/marketplace"
            className="px-4 py-2 rounded w-[150px] h-[50px] bg-blue-500 text-white hover:bg-blue-700 inline-flex items-center justify-center"
          >
            Marketplace
          </Link>
        </div>
        <div className="flex justify-between items-center gap-5">
          <div className="hidden md:flex justify-center items-center gap-5">
            {isDarkModeVisible && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleDarkMode(dispatch, isDarkMode)}
                >
                  {isDarkMode ? (
                    <Sun className="cursor-pointer text-gray-500" size={24} />
                  ) : (
                    <Moon className="cursor-pointer text-gray-500" size={24} />
                  )}
                </button>
              </div>
            )}
            {isNotificationVisible && (
              <div className="relative">
                <Link href={"/notifications"}>
                  <Bell className="cursor-pointer text-gray-500" size={24} />
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
                    3
                  </span>
                </Link>
              </div>
            )}
            {me ? (
              <div>
                <Link href={"/bookmarks"}>
                  <Bookmark
                    className="cursor-pointer text-gray-500"
                    size={24}
                  />
                </Link>
              </div>
            ) : undefined}
            <hr className="w-0 h-7 border border-solid border-l border-gray-300 mx-3" />
            <div className="relative" ref={dropdownRef}>
              <div
                className={`flex items-center gap-3 ${me ? "cursor-pointer" : ""}`}
                onClick={me ? toggleDropdown : undefined}
                role={me ? "button" : undefined}
                tabIndex={me ? 0 : -1}
                aria-haspopup={me ? "menu" : undefined}
                aria-expanded={me ? isOpen : undefined}
                onKeyDown={
                  me
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleDropdown();
                        }
                      }
                    : undefined
                }
              >
                {me ? (
                  <>
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {initials}
                    </div>
                    <div className="font-semibold">{me.user.name}</div>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Login
                  </Link>
                )}
              </div>
              {isOpen && me && (
                <div
                  className="
      absolute -right-1 mt-6 w-48 rounded-xl bg-white shadow-lg
      border border-gray-100 overflow-hidden
      animate-dropdown z-50
    "
                >
                  <Link
                    href="/account/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/settings"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>

                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                    onClick={async () => {
                      setIsOpen(false);

                      await signOut().unwrap();
                      dispatch(api.util.resetApiState());
                      dispatch(externalApi.util.resetApiState());
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          {me ? (
            <>
              <Link href={"/bids"}>
                <Gavel className="cursor-pointer text-gray-500" size={24} />
              </Link>
              <Link href={"/cart"}>
                <ShoppingCart
                  className="cursor-pointer text-gray-500"
                  size={24}
                />
              </Link>
            </>
          ) : undefined}
        </div>
      </div>
    </>
  );
};

export default Navbar;
