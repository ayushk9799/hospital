import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"
import { Button } from "../../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Badge } from "../../../ui/badge"
import { CalendarIcon, PackageIcon } from "lucide-react"
import { formatDate } from '../../../../assets/Data'
export default function OrderDetailsDialog({ order, trigger, onClose, open, setOpen }) {
  if (!order) return null;

  // Calculate total amount and discount
  const totalAmount = order.totalAmount;
  const totalDiscount = order.subtotal - order.totalAmount;

  // Calculate total amount paid
  const totalPaid = order.paidAmount;
  
  // Calculate remaining amount to be paid
  const remainingAmount = totalAmount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[70vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Order Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Card>
              <CardHeader className="py-2 flex flex-row justify-between items-center">
                <CardTitle className="text-base">Order Summary</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={remainingAmount <= 0 ? 'success' : totalPaid > 0 ? 'warning' : 'destructive'}>
                    {remainingAmount <= 0 ? 'Paid' : totalPaid > 0 ? 'Partially Paid' : 'Due'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 py-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <PackageIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Order ID:</span>
                    <span>ORD{order._id.slice(-5)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Order Date:</span>
                    <span>{formatDate(order.orderDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base">Payment</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Payment ID</TableHead>
                      <TableHead className="text-xs text-right">Amount</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-sm py-1">{order.payment._id.slice(-5)}</TableCell>
                      <TableCell className="text-sm py-1 text-right">₹{order.payment.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-sm py-1">{formatDate(order.payment.createdAt)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Item Name</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Quantity</TableHead>
                    <TableHead className="text-xs">MRP</TableHead>
                    <TableHead className="text-xs">Discount</TableHead>
                    <TableHead className="text-xs">Total</TableHead>
                    <TableHead className="text-xs ">Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items && order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm py-1 capitalize">{item.item.name}</TableCell>
                      <TableCell className="text-sm py-1 capitalize">{item.item.type}</TableCell>
                      <TableCell className="text-sm py-1">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-sm py-1">₹{item.MRP.toFixed(2)}</TableCell>
                      <TableCell className="text-sm py-1">{item.discount}%</TableCell>
                      <TableCell className="text-sm py-1">₹{(item.quantity * item.MRP * (1 - item.discount / 100)).toLocaleString()}</TableCell>
                      <TableCell className="text-sm py-1">{formatDate(item.expiryDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-base">Order Total</CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm py-1 font-semibold">Subtotal:</TableCell>
                    <TableCell className="text-sm py-1 text-right">₹{order.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm py-1 font-semibold">Total Discount ({((totalDiscount/order.subtotal)*100).toFixed(2)}%):</TableCell>
                    <TableCell className="text-sm py-1 text-right">₹{totalDiscount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm py-1 font-semibold">Total Amount:</TableCell>
                    <TableCell className="text-sm py-1 text-right">₹{totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm py-1 font-semibold">Total Amount Paid:</TableCell>
                    <TableCell className="text-sm py-1 text-right">₹{totalPaid.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-base py-1 font-semibold">Remaining Amount to be Paid:</TableCell>
                    <TableCell className="text-base py-1 text-right font-bold">₹{remainingAmount.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 mt-2">
            <Button variant="outline" size="sm">Print Order</Button>
            <Button size="sm" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}