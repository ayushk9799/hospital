import * as React from "react";
import { Button } from "../../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import {  PrinterIcon } from "lucide-react";

// Add this new Badge component
const Badge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
};

export default function ViewBillDialog({ isOpen, setIsOpen, billData }) {
  console.log(billData);
  const bill = billData || {
    billNo: "",
    dateTime: "",
    customer: "",
    amount: 0,
    status: "",
    items: [],
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="flex flex-row items-center justify-between mr-7">
          <div>
            <DialogTitle>Bill Details</DialogTitle>
            <DialogDescription>Full details of the bill</DialogDescription>
          </div>
            <Badge status={bill.status} />
        </DialogHeader>
        <div className="grid gap-4 py-0">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-right">Customer Name</Label>
              <p className="mt-1 font-medium">{bill.customer}</p>
            </div>
            <div>
              <Label className="text-right">Bill Number</Label>
              <p className="mt-1 font-medium">{bill.billNo}</p>
            </div>
            <div>
              <Label className="text-right">Date and Time</Label>
              <p className="mt-1 font-medium">{bill.dateTime}</p>
            </div>
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-semibold mb-2">Bill Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      ₹{(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-right">
              <span className="font-semibold">Total Amount: </span>
              <span className="text-lg font-bold">₹{bill.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
          <Button type="button" variant="outline">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
