import { useState } from 'react'
import { Button } from "../../../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select"
import { ChevronRight, BriefcaseMedicalIcon } from "lucide-react"

export default function Component() {
  const [salesOn, setSalesOn] = useState("MRP")
  const [saleType, setSaleType] = useState("SALE")

  return (
    <header className="flex items-center justify-between p-1 bg-gray-100 border-b">
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="sm" className="text-gray-600">
          <BriefcaseMedicalIcon className="h-4 w-4" />
        </Button>
        <ChevronRight className="h-3 w-3 text-gray-400" />
        <span className="font-semibold text-gray-700 text-sm">Sales</span>
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-600">Sales on:</span>
        <Select value={salesOn} onValueChange={setSalesOn}>
          <SelectTrigger className="w-[80px] h-8 text-sm">
            <SelectValue placeholder="MRP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MRP">MRP</SelectItem>
            <SelectItem value="Cost">Cost</SelectItem>
            <SelectItem value="Retail">Retail</SelectItem>
          </SelectContent>
        </Select>
        <Select value={saleType} onValueChange={setSaleType}>
          <SelectTrigger className="w-[80px] h-8 text-sm">
            <SelectValue placeholder="SALE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SALE">SALE</SelectItem>
            <SelectItem value="RETURN">RETURN</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
          Patient List
        </Button>
        <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
          Sales Today
        </Button>
        <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
          Show List
        </Button>
        <Button variant="destructive" size="sm" className="text-xs">
          Clear Screen
        </Button>
      </div>
    </header>
  )
}