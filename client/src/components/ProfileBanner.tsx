import { Rating } from "@mui/material";
import { MapPin } from "lucide-react";
import React from "react";

const ProfileBanner = () => {
  return (
    <div className="rounded-xl bg-gray-50 p-4 ring-1 ring-gray-100 flex flex-col justify-center">
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
    </div>
  );
};

export default ProfileBanner;
