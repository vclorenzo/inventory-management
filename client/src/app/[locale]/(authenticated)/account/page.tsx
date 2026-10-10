"use client";
import Cards from "@/components/Cards";
import Header from "@/components/Header";
import Tabs from "@/components/Tabs";
import { UserSetting } from "@/types/pages/User";
import { useState } from "react";
import { mockAccountSettings } from "../constants/User";
import { useGetProductsQuery } from "@/state/internal/productsApi";
import { CircularProgress, Rating } from "@mui/material";
import ProductsCatalog from "@/components/ProductsCatalog";
import { MapPin } from "lucide-react";
import Reviews from "@/components/Reviews";
import { useMe } from "@/hooks/useMe";
import ProfileBanner from "@/components/ProfileBanner";

const Account = () => {
  const [userSettings, setUserSettings] =
    useState<UserSetting[]>(mockAccountSettings);

  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchTerm);

  const { me, isLoading: isMeLoading } = useMe();
  const userId = me?.data.userId;

  const handleToggleChange = (index: number) => {
    const settingsCopy = [...userSettings];
    settingsCopy[index].value = !settingsCopy[index].value as boolean;
    setUserSettings(settingsCopy);
  };

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch products
      </div>
    );
  }

  return (
    <div className="w-full">
      <Header name="Account" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <tbody>
            {/* <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex flex-col justify-center">
              <article className="space-y-2">
                <div className="flex  justify-center items-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
                    vl
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">Vanz Lorenzo</p>
                  </div>
                </div>
              </article>
              <div className="flex justify-center gap-5 mt-5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">5.0</span>
                  <Rating value={5} readOnly size="small" />
                  <span className="text-gray-500">(11)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Pateros</span>
                </div>
              </div>
            </div> */}
            <ProfileBanner />
          </tbody>
        </table>
        <Tabs
          tabs={[
            {
              label: "Listings",
              content: (
                <>
                  {isLoading ? (
                    <>
                      <CircularProgress />
                    </>
                  ) : (
                    <ProductsCatalog />
                  )}
                </>
              ),
            },
            {
              label: "Reviews",
              content: (
                <div className={`filter-panel mb-24`}>
                  {isMeLoading ? (
                    <CircularProgress />
                  ) : (
                    userId && <Reviews userId={userId} />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Account;
