import React from "react";

const AssetCard = ({ asset }) => {
  return (
    <div className="cursor-default bg-blue-200 rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
      <div className="w-full h-32 mb-3 overflow-hidden rounded-md">
        <img
          src={asset.photos?.[0] || "/no-image.jpg"}
          alt={asset.name}
          className="object-cover w-full h-full"
        />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 truncate">
        {asset.name}
      </h2>
      <p className="text-sm text-gray-500">
        Created by: {asset?.createdBy?.fullName?.split(" ")[0] || "Unknown"}
      </p>
    </div>
  );
};

export default AssetCard;
