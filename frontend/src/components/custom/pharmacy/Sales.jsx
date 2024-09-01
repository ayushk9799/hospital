import React from "react";
import SalesHeader from "./Sales/SalesHeader";
import SalesBody from "./Sales/SalesBody";
import SalesRight from "./Sales/SalesRight";
import SalesFooter from "./Sales/SalesFooter";

const Sales = () => {
  return (
    <div className="h-full">
      <SalesHeader />
      <div className="w-full grid grid-cols-12 h-[calc(100vh-178px)]">
        <div className="col-span-9 border-r-2 border-gray-300">
          <SalesBody className="bg-blue-400 h-full" />
        </div>
        <div className="col-span-3">
          <SalesRight className="bg-green-400 h-full" />
        </div>
      </div>
      <SalesFooter />
    </div>
  );
};

export default Sales;
