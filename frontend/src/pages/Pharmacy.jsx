import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import Sales from "../components/custom/pharmacy/Sales";
import Purchase from "../components/custom/pharmacy/Purchase";
import PharmacyReports from "../components/custom/pharmacy/PharmacyReports";
import PharmacyDashboard from "../components/custom/pharmacy/PharmacyDashboard";
import Supplier from "../components/custom/pharmacy/Supplier";
import ItemsMaster from "../components/custom/pharmacy/ItemsMaster";

const Pharmacy = () => {
  return (
    <div className="flex flex-col flex-1 mt-1 h-[calc(100vh-52px)]">
      <Tabs defaultValue="reports" className="w-full h-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="supplier">Supplier</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="itemsMaster">Items Master</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard"><PharmacyDashboard /></TabsContent>
        <TabsContent value="sales"><Sales /></TabsContent>
        <TabsContent value="supplier"><Supplier /></TabsContent>
        <TabsContent value="purchases"><Purchase /></TabsContent>
        <TabsContent value="reports"><PharmacyReports /></TabsContent>
        <TabsContent value="itemsMaster"><ItemsMaster /></TabsContent>
      </Tabs>
    </div>
  );
};

export default Pharmacy;
