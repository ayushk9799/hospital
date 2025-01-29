import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { useDispatch } from 'react-redux'
import { createDepartment } from '../../../redux/slices/departmentSlice'
import {useToast} from '../../../hooks/use-toast'

const AddDepartmentDialog = ({ trigger }) => {
  const [name, setName] = React.useState('')
  const dispatch = useDispatch()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createDepartment({ name, staffIds: [] })).unwrap()
      toast({
        title: "Success",
        variant : 'success',
        description: "Department created successfully",
      })
      setName('')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong",
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter department name"
              required
            />
          </div>
          <Button type="submit">Create Department</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddDepartmentDialog