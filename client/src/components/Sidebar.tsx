"use client";
import { setIsDropdownExpanded, setIsSidebarCollapsed } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  History,
  KeyRound,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMe } from "@/hooks/useMe";

type SidebarLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  subLinks?: {
    href: string;
    label: string;
    subLinkIcon: LucideIcon;
  }[];
  dropdownIcon?: LucideIcon;
  isSubLinkExpanded?: boolean;

  toggleDropdown?: () => void;
};

const SidebarLink = ({
  href,
  icon: Icon,
  dropdownIcon: DropdownIcon,
  label,
  isCollapsed,
  subLinks,
  isSubLinkExpanded,
  toggleDropdown,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  let isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <>
      <>
        <Link href={href}>
          <div
            className={`cursor-pointer flex items-center ${
              isCollapsed
                ? "justify-center py-4 gap-0"
                : "justify-start px-8 py-4"
            }
		hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
      isActive ? "bg-blue-200 text-white" : ""
    }
	  }`}
          >
            <Icon className="w-6 h-6 !text-gray-700" />

            <span
              className={`${
                isCollapsed ? "hidden" : "block"
              } font-medium text-gray-700`}
            >
              {label}
            </span>
            {DropdownIcon && (
              <DropdownIcon
                className={`w-4 h-4 !text-gray-700 ${
                  isCollapsed ? "" : "ml-auto"
                }`}
                onClick={toggleDropdown}
              />
            )}
          </div>
        </Link>
      </>
      {subLinks &&
        isSubLinkExpanded &&
        subLinks.map((subLink, index) => {
          const SubLinkIcon = subLink.subLinkIcon || null;
          isActive = pathname === subLink.href;
          return (
            <Link href={subLink.href} key={index}>
              <div
                className={`cursor-pointer flex items-center ${
                  isCollapsed
                    ? "justify-center py-4"
                    : "justify-start px-8 py-4"
                }
		hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors 
	  ${isActive ? "bg-blue-200 text-white" : ""}}`}
              >
                <SubLinkIcon className="w-6 h-6 !text-gray-700" />

                <span
                  className={`${
                    isCollapsed ? "hidden" : "block"
                  } font-medium text-gray-700`}
                >
                  {subLink.label}
                </span>
              </div>
            </Link>
          );
        })}
    </>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const isDropdownExpanded = useAppSelector(
    (state) => state.global.isDropdownExpanded,
  );

  const { me } = useMe();
  const role = me?.data.role;
  const isAdmin = role === "admin";

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDropdown = () => {
    dispatch(setIsDropdownExpanded(!isDropdownExpanded));
  };
  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <div>
          <Image
            src={
              "https://s3-inventory-management-img-bucket.s3.ap-southeast-2.amazonaws.com/logo.png"
            }
            alt="Logo"
            width={27}
            height={27}
            className="rounded w-8"
          />
        </div>
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl`}
        >
          OKSHN
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
      {/* LINKS */}
      <div className="flex-grow mt-8">
        {isAdmin ? (
          <>
            <SidebarLink
              href="/dashboard"
              icon={Layout}
              label="Dashboard"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href="/inventory"
              icon={Archive}
              label="Inventory"
              isCollapsed={isSidebarCollapsed}
            />
            <SidebarLink
              href="/account"
              icon={UserRound}
              label="Account"
              isCollapsed={isSidebarCollapsed}
              isSubLinkExpanded={isDropdownExpanded}
              toggleDropdown={toggleDropdown}
              dropdownIcon={isDropdownExpanded ? ChevronUp : ChevronDown}
              subLinks={[
                {
                  href: "/account/profile",
                  subLinkIcon: UserRoundPen,
                  label: "Profile",
                },
                {
                  href: "/account/changePassword",
                  subLinkIcon: KeyRound,
                  label: "Change Password",
                },
                {
                  href: "/account/settings",
                  subLinkIcon: SlidersHorizontal,
                  label: "Settings",
                },
              ]}
            />
            <SidebarLink
              href="/history"
              icon={History}
              label="history"
              isCollapsed={isSidebarCollapsed}
            />
          </>
        ) : (
          <SidebarLink
            href="/account"
            icon={UserRound}
            label="Account"
            isCollapsed={isSidebarCollapsed}
            isSubLinkExpanded={isDropdownExpanded}
            toggleDropdown={toggleDropdown}
            dropdownIcon={isDropdownExpanded ? ChevronUp : ChevronDown}
            subLinks={[
              {
                href: "/account/profile",
                subLinkIcon: UserRoundPen,
                label: "Profile",
              },
              {
                href: "/account/changePassword",
                subLinkIcon: KeyRound,
                label: "Change Password",
              },
              {
                href: "/account/settings",
                subLinkIcon: SlidersHorizontal,
                label: "Settings",
              },
            ]}
          />
        )}
      </div>
      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-500">&copy; 2024 OKSHN</p>
      </div>
    </div>
  );
};

export default Sidebar;

//* ${isActive ? 'bg-blue-200 text-white' : ''}
