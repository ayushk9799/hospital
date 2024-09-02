import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from "../../../ui/radio-group"
import { Label } from "../../../ui/label"
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from "../../../ui/table"
import { Input } from "../../../ui/input"
import { Button } from "../../../ui/button"
import { Plus, Pencil, Trash } from 'lucide-react'  // Add this import

const SalesBody = () => {
  const [searchType, setSearchType] = useState("itemName")
  const [items, setItems] = useState([
    { id: 1, name: 'Paracetamol', mrp: 50, qty: 100, disc: 0 },
    { id: 2, name: 'Amoxicillin', mrp: 75, qty: 50, disc: 5 },
    { id: 3, name: 'Ibuprofen', mrp: 60, qty: 75, disc: 2 },
  ])

  const handleSearchTypeChange = (value) => {
    setSearchType(value)
    // You can add additional logic here, e.g., triggering a search
    console.log("Search type changed to:", value)
  }

  const calculateAmount = (mrp, qty, disc) => {
    const amount = mrp * qty;
    const discountAmount = amount * (disc / 100);
    return amount - discountAmount;
  }

  return (
    <div className='h-full w-full px-2'>
      <div className='flex items-center justify-between mt-1'>
        <div className='flex items-center space-x-2'>
          <p className="text-sm font-medium">Search by:</p>
          <RadioGroup 
            defaultValue="itemName" 
            onValueChange={handleSearchTypeChange}
            className="flex space-x-2"
          >
            {["Item Name", "Category", "Generics", "Types"].map((type) => (
              <div key={type.toLowerCase()} className="flex items-center space-x-1">
                <RadioGroupItem 
                  value={type.toLowerCase().replace(' ', '')} 
                  id={type.toLowerCase().replace(' ', '')}
                  className="h-3 w-3"
                />
                <Label 
                  htmlFor={type.toLowerCase().replace(' ', '')}
                  className="text-xs"
                >
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="text-sm">Sales On:MRP</div>
      </div>
      <Table className="w-full mt-1">
        <TableHeader >
          <TableRow className='bg-blue-200 border-2 border-blue-300 hover:bg-blue-200'>
            <TableHead className="h-7">Sr.</TableHead>
            <TableHead className="h-7">Item Name</TableHead>
            <TableHead className="h-7">MRP</TableHead>
            <TableHead className="h-7">Qty</TableHead>
            <TableHead className="h-7">Disc</TableHead>
            <TableHead className="h-7">Amount</TableHead>
            <TableHead className="h-7">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className='border-2 border-blue-300'>
            <TableCell></TableCell>
            <TableCell><Input type="text" placeholder="Item Name" className="h-7 text-sm" /></TableCell>
            <TableCell className="w-[120px]"><Input type="number" placeholder="MRP" className="h-7 text-sm w-[100px]" /></TableCell>
            <TableCell className="w-[120px]"><Input type="text" placeholder="Qty" className="h-7 text-sm" /></TableCell>
            <TableCell className="w-[120px]"><Input type="text" placeholder="Disc" className="h-7 text-sm" /></TableCell>
            <TableCell>₹0.00</TableCell>
            <TableCell>
              <Button size="icon" variant="outline" className="h-7 w-7 mr-1">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-7 w-7">
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
          {items.map((item) => {
            const amount = calculateAmount(item.mrp, item.qty, item.disc);
            return (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>₹{item.mrp}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>{item.disc}%</TableCell>
                <TableCell>₹{amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Button size="icon" variant="outline" className="h-7 w-7 mr-1">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-7 w-7">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      
    </div>
  )
}

export default SalesBody