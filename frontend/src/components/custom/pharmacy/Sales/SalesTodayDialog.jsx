import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import { Eye, FileDown } from "lucide-react";
import { format } from 'date-fns';

const SalesTodayDialog = ({ isOpen, setIsOpen }) => {
  // Mock data for today's sales
  const [todaySales] = useState([
    { billNo: "#B001234", customer: "John Doe", time: "14:30", amount: 78.50, status: "Paid" },
    { billNo: "#B001235", customer: "Jane Smith", time: "15:15", amount: 125.00, status: "Pending" },
    { billNo: "#B001236", customer: "Bob Johnson", time: "16:00", amount: 45.75, status: "Paid" },
    // Add more mock data as needed
  ]);

  const handleViewBill = (bill) => {
    // Implement view bill functionality
    console.log("Viewing bill:", bill);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between mr-5">
          <div>
            <DialogTitle>Sales Today - {format(new Date(), 'MMMM d, yyyy')}</DialogTitle>
            <DialogDescription>Showing {todaySales.length} sales for today</DialogDescription>
          </div>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" /> Export
          </Button>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {todaySales.map((sale) => (
              <TableRow key={sale.billNo}>
                <TableCell>{sale.billNo}</TableCell>
                <TableCell>{sale.customer}</TableCell>
                <TableCell>{sale.time}</TableCell>
                <TableCell>₹{sale.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={sale.status === "Paid" ? "success" : "warning"}>
                    {sale.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewBill(sale)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};

export default SalesTodayDialog;
