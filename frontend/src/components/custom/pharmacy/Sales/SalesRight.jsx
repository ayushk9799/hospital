import React from 'react'
import { Card, CardContent } from '../../../ui/card'
import { Input } from '../../../ui/input'
import { Label } from '../../../ui/label'
import { Button } from '../../../ui/button'
import { Search } from 'lucide-react'

const SalesRight = () => {
  return (
    <div className="space-y-1">
      <Card className="p-2">
        <CardContent className="p-2">
          <Label htmlFor="patientSearch" className="text-sm">Patient Name or ID</Label>
          <div className='flex items-center gap-2 mt-1'>
            <Input id="patientSearch" placeholder='Search Patient' className="h-8" />
            <Button variant='outline' size="sm"><Search size={16} /></Button>
          </div>
        </CardContent>
      </Card>

      <Card className="p-2">
        <CardContent className="p-2">
          <div className="space-y-2">
            {['Patient Name', 'Address', 'Contact Number', 'Doctor Name', 'Description'].map((label) => (
              <div key={label}>
                <Label htmlFor={label.toLowerCase().replace(' ', '')} className="text-sm">{label}</Label>
                <Input 
                  id={label.toLowerCase().replace(' ', '')} 
                  placeholder={`Enter ${label.toLowerCase()}`} 
                  className="h-8 mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        <Card className='p-2'>
            <CardContent className='p-2'>
                <p>Last Transaction : </p>
                <div className='grid grid-cols-2 items-center gap-2'>
                    <p className='font-semibold'>Patient Name </p>
                    <p className='font-semibold'>Total Amount </p>
                </div>
                <div className='grid grid-cols-2 items-center gap-2'>
                    <p>John Doe </p>
                    <p>₹4000 </p>
                </div>
            </CardContent>
        </Card>
    
    </div>
  )
}

export default SalesRight