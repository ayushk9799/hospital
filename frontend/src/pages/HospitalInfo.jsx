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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useSelector, useDispatch } from 'react-redux';
import { fetchHospitalInfo, updateHospitalInfo } from '../redux/slices/HospitalSlice';
import { X, Plus } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

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
    pharmacyName: '',
    pharmacyAddress: '',
    pharmacyContactNumber: '',
    pharmacyLogo: '',
    pharmacyExpiryThreshold: '',
    pharmacyItemCategories: [],
  });

  const [newCategory, setNewCategory] = useState('');

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

  const handleCategoryChange = (e, field) => {
    const categories = e.target.value.split(',').map(cat => cat.trim());
    setFormData(prevData => ({
      ...prevData,
      [field]: categories
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send the entire formData object, which now includes the category arrays
      await dispatch(updateHospitalInfo(formData)).unwrap();
      toast({
        variant: 'success',
        title: "Updated Successfully",
        description: "Hospital information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Unable to update",
        description: "Failed to update hospital information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddCategory = (field) => {
    if (newCategory.trim()) {
      setFormData(prevData => ({
        ...prevData,
        [field]: [...prevData[field], newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (field, index) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index)
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">Hospital Information Management</CardTitle>
            <CardDescription className="text-gray-500">Manage your hospital's details</CardDescription>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={updateStatus === 'loading'}
            // className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {updateStatus === 'loading' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="hospital" className="w-full">
          <TabsList className="grid w-1/2 grid-cols-2 mb-6">
            <TabsTrigger value="hospital" className="text-sm font-medium">Hospital Information</TabsTrigger>
            <TabsTrigger value="pharmacy" className="text-sm font-medium">Pharmacy Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hospital">
            <div className="grid grid-cols-3 gap-6">
              <InputField label="Hospital ID" name="hospitalId" value={formData.hospitalId} onChange={handleChange} disabled />
              <InputField label="Hospital Name" name="name" value={formData.name} onChange={handleChange} required />
              <InputField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField label="Website" name="website" type="url" value={formData.website} onChange={handleChange} />
              <InputField label="Doctor Name" name="doctorName" value={formData.doctorName} onChange={handleChange} />
              <TextareaField label="Doctor Information" name="doctorInfo" value={formData.doctorInfo} onChange={handleChange} />
              <TextareaField label="Address" name="address" value={formData.address} onChange={handleChange} required />
              <InputField label="Logo URL" name="logo" value={formData.logo} onChange={handleChange} />
            </div>
          </TabsContent>
          
          <TabsContent value="pharmacy">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 grid grid-cols-2 gap-6">
                <InputField label="Pharmacy Name" name="pharmacyName" value={formData.pharmacyName} onChange={handleChange} />
                <InputField label="Pharmacy Contact Number" name="pharmacyContactNumber" value={formData.pharmacyContactNumber} onChange={handleChange} />
                <InputField label="Pharmacy Logo URL" name="pharmacyLogo" value={formData.pharmacyLogo} onChange={handleChange} />
                <TextareaField label="Pharmacy Address" name="pharmacyAddress" value={formData.pharmacyAddress} onChange={handleChange} />
                <InputField label="Item Expiry Threshold (months)" name="pharmacyExpiryThreshold" type="number" value={formData.pharmacyExpiryThreshold} onChange={handleChange} />
              </div>
              <div className="col-span-1">
                <CategoryField 
                  label="Pharmacy Item Categories" 
                  categories={formData.pharmacyItemCategories} 
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onAdd={() => handleAddCategory('pharmacyItemCategories')}
                  onRemove={(index) => handleRemoveCategory('pharmacyItemCategories', index)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const InputField = ({ label, name, value, onChange, type = "text", required = false, disabled = false }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      required={required}
      disabled={disabled}
      className="w-full"
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange, required = false }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
    <Textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      required={required}
      className="w-full"
    />
  </div>
);

const CategoryField = ({ label, categories, newCategory, setNewCategory, onAdd, onRemove }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-col space-y-2">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter a new category"
            className="flex-grow"
          />
          <Button 
            type="submit" 
            disabled={!newCategory.trim()}
          >
            <Plus size={16} />
          </Button>
        </form>
        <ScrollArea className="h-[150px] w-full border rounded-md p-4">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="text-sm py-1 px-2 flex items-center space-x-1"
                >
                  <span>{category}</span>
                  <button
                    onClick={() => onRemove(index)}
                    className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No categories added yet.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default HospitalInfo;