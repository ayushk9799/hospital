import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Eye, FileX } from "lucide-react";
import ViewBillDialog from "../reports/ViewBillDialog";
import { format } from "date-fns";

const BillsTableWithDialog = ({ bills }) => {
  const [selectedBill, setSelectedBill] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setIsViewDialogOpen(true);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill No</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.length === 0 ? (
            <TableRow className="hover:bg-white">
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <FileX className="w-8 h-8 mb-2" />
                  <p className="font-semibold">No bills available</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            bills.map((bill) => (
              <TableRow key={bill._id}>
                <TableCell>{`#B${bill._id.slice(-6)}`}</TableCell>
                <TableCell className='capitalize'>{bill.patientInfo.name}</TableCell>
                <TableCell>{format(new Date(bill.createdAt), "MMM dd, hh:mm a")}</TableCell>
                <TableCell>₹{bill.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  <Badge variant={bill?.payment?.status === "paid" ? "success" : "destructive"}>
                    {bill?.payment?.status === "paid" ? "Paid" : "Due"}
                  </Badge>
                </TableCell>
                <TableCell>{bill?.payment?.paymentMethod || "__"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => handleViewBill(bill)}><Eye className="h-3 w-3 mr-2" /></Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ViewBillDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        billData={selectedBill}
      />
    </>
  );
};

export default BillsTableWithDialog;