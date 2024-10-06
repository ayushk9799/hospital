import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Mail,
  Phone,
  Clock,
  AlertCircle // Add this import
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import {useSelector} from 'react-redux'
// Sample staff data


export default function Reports() {
  const navigate = useNavigate();
  const {staffMembers} = useSelector((state)=>state.staff)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('All')
  const [filterRole, setFilterRole] = useState('All')
  const departments = useSelector((state)=>state.departments.departments)
  const filteredStaff = staffMembers.filter(staff => 
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterDepartment === 'All' || staff.department.includes(filterDepartment)) &&
    (filterRole === 'All' || staff.roles.includes(filterRole.toLowerCase()))
  )

  const handleStaffClick = (staff) => {
    navigate(`/staff/${staff._id}`, { state: { staffData: staff } });
  };

  const handleEditStaff = (staff) => {
    navigate('/addstaff', { state: { editMode: true, staffData: staff } });
  };

  return (
    <div className="container mx-auto p-2 space-y-2">
      <Card>
        <CardHeader>
          <CardTitle>Staff List</CardTitle>
          <CardDescription>Manage and view staff information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
              <Select onValueChange={setFilterDepartment} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.name} value={dept.name}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select onValueChange={setFilterRole} defaultValue="All">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Role" /> 
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Roles</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="nurse">Nurse</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="admin">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigate('/addstaff')}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Staff
              </Button>
              {/* <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" /> Export
              </Button> */}
            </div>
          </div>
          {filteredStaff.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  
                  <TableHead>Shift</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff._id}>
                    <TableCell className="font-medium">
                      <div 
                        className="flex items-center space-x-2 "
                      >
                        <Avatar>
                          <AvatarFallback>
                            {staff.name.split(' ')
                              .filter((n, i, arr) => i === 0 || i === arr.length - 1)
                              .map(n => n[0].toUpperCase())
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span 
                          onClick={() => handleStaffClick(staff)} 
                          className='cursor-pointer hover:underline capitalize'
                        >
                          {staff.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{staff.roles.join(',')}</TableCell>
                    <TableCell>{staff.department.join(',')}</TableCell>
                    {/* <TableCell>
                      <Badge variant={staff.status === 'Active' ? 'default' : 'secondary'}>
                        {staff.status}
                      </Badge>
                    </TableCell> */}
                    <TableCell>{staff.shift?.type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => window.location.href = `mailto:${staff.email}`}>
                            <Mail className="mr-2 h-4 w-4" />
                            <span>Email</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `tel:${staff.contactNumber}`}>
                            <Phone className="mr-2 h-4 w-4" />
                            <span>Call</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/schedule/${staff._id}`)}>
                            <Clock className="mr-2 h-4 w-4" />
                            <span>View Schedule</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStaff(staff)}>
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/staff/${staff._id}`)}>
                            View Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No staff members found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}