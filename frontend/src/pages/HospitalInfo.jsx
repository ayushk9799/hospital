import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { useSelector, useDispatch } from 'react-redux';
import { fetchHospitalInfo, updateHospitalInfo } from '../redux/slices/HospitalSlice';

const HospitalInfo = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { hospitalInfo, hospitalInfoStatus, updateStatus } = useSelector((state) => state.hospital);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    contactNumber: '',
    email: '',
    website: '',
    doctorName: '',
    doctorInfo: '',
    hospitalId: '',
  });

  useEffect(() => {
    if (hospitalInfoStatus === 'idle') {
      dispatch(fetchHospitalInfo());
    }
  }, [dispatch, hospitalInfoStatus]);

  useEffect(() => {
    if (hospitalInfo) {
      setFormData(prevData => ({
        ...prevData,
        ...hospitalInfo
      }));
    }
  }, [hospitalInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateHospitalInfo(formData)).unwrap();
      toast({
        title: "Success",
        description: "Hospital information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hospital information. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle>Hospital Information Management</CardTitle>
        <CardDescription>Enter or update your hospital's details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalId">Hospital ID</Label>
              <Input
                id="hospitalId"
                name="hospitalId"
                value={formData.hospitalId}
                onChange={handleChange}
                placeholder="Enter hospital ID"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Hospital Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Enter contact number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter website URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorName">Doctor Name</Label>
              <Input
                id="doctorName"
                name="doctorName"
                value={formData.doctorName}
                onChange={handleChange}
                placeholder="Enter doctor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorInfo">Doctor Information</Label>
              <Textarea
                id="doctorInfo"
                name="doctorInfo"
                value={formData.doctorInfo}
                onChange={handleChange}
                placeholder="Enter doctor information"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter hospital address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="Enter logo URL"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setFormData(hospitalInfo)}>Reset</Button>
            <Button type="submit" disabled={updateStatus === 'loading'}>
              {updateStatus === 'loading' ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HospitalInfo;