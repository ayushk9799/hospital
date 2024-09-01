import React, { useState } from "react";
import {
  ChevronRight,
  BriefcaseMedicalIcon,
  Building2,
  Phone,
  Mail,
  Info,
  PlusIcon
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { ScrollArea } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import OrderDetailsDialog from './supplier/OrderDetailsDialog';
import SupplierRegDialog from './supplier/SupplierRegDialog';

export const supplierArray = [
    {
      id: "SID145",
      name: "ABC Pharmaceuticals",
      lastPurchased: "2023-04-15",
      address: "123 Pharma St, Med City, MC 12345",
      contactNumber: "+1 (555) 123-4567",
      email: "contact@abcpharma.com",
      totalPurchaseValue: 10000,
      itemsOffered: ["Aspirin", "Ibuprofen", "Amoxicillin"],
      orders: [
        {
          id: "ORD001",
          date: "2023-04-15",
          deliveredDate: "2023-04-20",
          status: "Delivered",
          items: [
            {
              name: "Aspirin",
              type: "Tablet",
              expiryDate: "2025-04-15",
              unitPrice: 0.5,
              quantity: 1000,
              amountPaid : 400,
              discount: 5,
            },
            {
              name: "Ibuprofen",
              type: "Capsule",
              expiryDate: "2025-06-30",
              unitPrice: 0.75,
              quantity: 500,
              amountPaid : 300,
              discount: 3,
            }
          ],
          payments: [
            { id: "PAY001", amount: 400, date: "2023-04-15" },
            { id: "PAY002", amount: 300, date: "2023-04-16" },
          ],
        },
      ],
    },
    {
      id: "SID146",
      name: "MediCorp Supplies",
      lastPurchased: "2023-05-02",
      address: "456 Health Ave, Wellness, WT 67890",
      contactNumber: "+1 (555) 987-6543",
      email: "info@medicorpsupplies.com",
      totalPurchaseValue: 15000,
      itemsOffered: ["Paracetamol", "Omeprazole", "Metformin"],
      orders: [
        {
          id: "ORD003",
          date: "2023-05-02",
          deliveredDate: "2023-05-05",
          status: "Delivered",
          items: [
            {
              name: "Paracetamol",
              type: "Tablet",
              expiryDate: "2025-05-02",
              unitPrice: 0.3,
              quantity: 2000,
              discount: 2,
              amountPaid : 500,
            },
            {
              name: "Omeprazole",
              type: "Capsule",
              expiryDate: "2024-11-30",
              unitPrice: 1.2,
              quantity: 500,
              discount: 5,
              amountPaid : 500,
            }
          ],
          payments: [
            { id: "PAY003", amount: 500, date: "2023-05-02" },
            { id: "PAY004", amount: 500, date: "2023-05-03" },
          ],
        },
      ],
    },
  ]

const Supplier = () => {
  const [suppliers, setSuppliers] = useState(supplierArray);
  const [newSupplier, setNewSupplier] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSupplierRegDialogOpen, setIsSupplierRegDialogOpen] = useState(false);

  const calculateOrderTotal = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((acc, item) => {
        const itemTotal = item.unitPrice * item.quantity * (1 - item.discount / 100);
        return acc + itemTotal;
      }, 0);
    }
    return 0;
  };

  const calculateOrderQuantity = (order) => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((acc, item) => acc + item.quantity, 0);
    }
    return order.quantity || 0;
  };

  const calculateOverallDiscount = (order) => {
    if (order.items && order.items.length > 0) {
      const totalBeforeDiscount = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
      const totalAfterDiscount = calculateOrderTotal(order);
      const discountAmount = totalBeforeDiscount - totalAfterDiscount;
      const discountPercentage = (discountAmount / totalBeforeDiscount) * 100;
      return discountPercentage.toFixed(2) + '%';
    }
    return order.discount || 'N/A';
  };

  const calculateTotalPaymentsForOrder = (order) => {
    return order.payments.reduce((total, payment) => total + payment.amount, 0);
  };

  const handleOpenOrderDialog = (order) => {
    setSelectedOrder(order);
    setIsOrderDialogOpen(true);
  };

  const handleCloseOrderDialog = () => {
    setIsOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center space-x-1 bg-gray-100 p-1 justify-between">
       <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="text-gray-600">
               <BriefcaseMedicalIcon className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="font-semibold text-gray-700 text-sm">Supplier</span>
       </div>
       <Button 
         variant="outline" 
         size="sm" 
         className="text-gray-600 hover:bg-gray-100"
         onClick={() => setIsSupplierRegDialogOpen(true)}
       >
         <PlusIcon className="h-4 w-4" /> <span className="font-semibold text-gray-700 text-sm">Add Supplier</span>
       </Button>
      </div>
      <div className="grid grid-cols-4 w-full flex-grow">
        <div className="col-span-3 border-r-2 border-gray-200 p-4">
          {selectedSupplier ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedSupplier.name} <span className="text-sm text-gray-500">({selectedSupplier.id})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedSupplier.address && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building2 size={16} />
                        <span className="text-sm">{selectedSupplier.address}</span>
                      </div>
                    )}
                    {selectedSupplier.contactNumber && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone size={16} />
                        <span className="text-sm">{selectedSupplier.contactNumber}</span>
                      </div>
                    )}
                    {selectedSupplier.email && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Mail size={16} />
                        <span className="text-sm">{selectedSupplier.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedSupplier.lastPurchased && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Last Purchase:</span>
                        <span className="text-sm">{selectedSupplier.lastPurchased}</span>
                      </div>
                    )}
                    {selectedSupplier.totalPurchaseValue !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Purchase Value:</span>
                        <span className="text-sm">${selectedSupplier.totalPurchaseValue.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Items Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSupplier.itemsOffered && selectedSupplier.itemsOffered.length > 0 ? (
                      <ul className="list-disc list-inside text-sm">
                        {selectedSupplier.itemsOffered.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No items offered</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-lg font-medium">Orders</h4>
              {selectedSupplier.orders && selectedSupplier.orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Delivered Date</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Payments</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSupplier.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'Delivered' ? 'success' :
                            order.status === 'Pending' ? 'warning' :
                            order.status === 'Return' ? 'destructive' : 'default'
                          }>
                            {order.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{calculateOrderQuantity(order)}</TableCell>
                        <TableCell>₹{calculateOrderTotal(order).toLocaleString()}</TableCell>
                        <TableCell>{order.deliveredDate || 'N/A'}</TableCell>
                        <TableCell>{calculateOverallDiscount(order)}</TableCell>
                        <TableCell>₹{calculateTotalPaymentsForOrder(order).toLocaleString()}</TableCell>
                        <TableCell>
                          <OrderDetailsDialog 
                            order={{...order, payments: order.payments}} 
                            trigger={
                              <Button variant="ghost" size="sm" onClick={() => handleOpenOrderDialog(order)}>
                                <Info size={16} />
                              </Button>
                            } 
                            onClose={handleCloseOrderDialog}
                            open={isOrderDialogOpen}
                            setOpen={setIsOrderDialogOpen}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500">No orders found</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Select a supplier to view details</p>
          )}
        </div>
        <div className="px-2 py-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-4">Supplier List</h2>
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-2"
          />
          <ScrollArea className="flex-grow">
            <div className="space-y-2 pr-4">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className={`py-2 px-4 bg-white shadow rounded-lg mb-2 cursor-pointer transition-colors duration-200 hover:bg-gray-100 ${
                    selectedSupplier && selectedSupplier.id === supplier.id
                      ? 'border-2 border-blue-400 shadow-md'
                      : ''
                  }`}
                  onClick={() => setSelectedSupplier(supplier)}
                >
                  <h3 className="font-semibold">
                    {supplier.name}{" "}
                    <span className="text-xs text-gray-500">
                      ({supplier.id})
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last purchase: {supplier.lastPurchased}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total Purchase Value: ${supplier.totalPurchaseValue}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      <SupplierRegDialog 
        open={isSupplierRegDialogOpen} 
        setOpen={setIsSupplierRegDialogOpen} 
      />
    </div>
  );
};

export default Supplier;
