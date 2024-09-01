import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../ui/dialog"
import { Button } from "../../../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Badge } from "../../../ui/badge"
import { CalendarIcon, PackageIcon } from "lucide-react"

export default function OrderDetailsDialog({ order, trigger, onClose, open, setOpen }) {
  if (!order) return null;

  // Calculate total amount and discount
  const totalAmount = order.items.reduce((sum, item) => 
    sum + item.quantity * item.unitPrice * (1 - item.discount / 100), 0);
  const totalDiscount = order.items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice * item.discount / 100), 0);

  // Calculate total amount paid
  const totalPaid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
  
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
                  <Badge variant={
                    order.status === 'Delivered' ? 'success' :
                    order.status === 'Pending' ? 'warning' :
                    order.status === 'Return' ? 'destructive' : 'default'
                  }>
                    {order.status || 'N/A'}
                  </Badge>
                  <Badge variant={
                    remainingAmount <= 0 ? 'success' :
                    totalPaid > 0 ? 'warning' :
                    'destructive'
                  }>
                    {remainingAmount <= 0 ? 'Paid' :
                     totalPaid > 0 ? 'Partially Paid' :
                     'Due'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-2 py-2">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <PackageIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Order ID:</span>
                    <span>{order.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Order Date:</span>
                    <span>{order.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">Delivered Date:</span>
                    <span>{order.deliveredDate || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-base">Payments</CardTitle>
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
                    {order.payments && order.payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-sm py-1">{payment.id}</TableCell>
                        <TableCell className="text-sm py-1 text-right">₹{payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-sm py-1">{payment.date}</TableCell>
                      </TableRow>
                    ))}
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
                    <TableHead className="text-xs text-right">Quantity</TableHead>
                    <TableHead className="text-xs text-right">Unit Price</TableHead>
                    <TableHead className="text-xs text-right">Discount</TableHead>
                    <TableHead className="text-xs text-right">Total</TableHead>
                    <TableHead className="text-xs">Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items && order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-sm py-1">{item.name}</TableCell>
                      <TableCell className="text-sm py-1">{item.type}</TableCell>
                      <TableCell className="text-sm py-1 text-right">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-sm py-1 text-right">₹{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-sm py-1 text-right">{item.discount}%</TableCell>
                      <TableCell className="text-sm py-1 text-right">₹{(item.quantity * item.unitPrice * (1 - item.discount / 100)).toLocaleString()}</TableCell>
                      <TableCell className="text-sm py-1">{item.expiryDate}</TableCell>
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
                    <TableCell className="text-sm py-1 text-right">₹{(totalAmount + totalDiscount).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm py-1 font-semibold">Total Discount ({((totalDiscount/totalAmount)*100).toFixed(2)}%):</TableCell>
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