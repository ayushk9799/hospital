import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { s3Domain } from "../assets/Data";
import { Backend_URL } from "../assets/Data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchHospitalInfo,
  updateHospitalInfo,
} from "../redux/slices/HospitalSlice";
import { X, Plus, Upload } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";

const HospitalInfo = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { hospitalInfo, hospitalInfoStatus, updateStatus } = useSelector(
    (state) => state.hospital
  );
  const moreLogosBlobs = useSelector((state) => state.hospital.moreLogosBlobs);
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    logo2: "",
    address: "",
    contactNumber: "",
    email: "",
    website: "",
    doctorName: "",
    doctorInfo: "",
    hospitalId: "",
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyContactNumber: "",
    pharmacyLogo: "",
    pharmacyExpiryThreshold: "",
    pharmacyItemCategories: [],
    morelogos: [],
  });

  const [newCategory, setNewCategory] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logo2Preview, setLogo2Preview] = useState(null);
  const [logo2File, setLogo2File] = useState(null);
  const [moreLogoFiles, setMoreLogoFiles] = useState([]);
  const [moreLogoPreview, setMoreLogoPreview] = useState([]);

  useEffect(() => {
    if (hospitalInfoStatus === "idle") {
      dispatch(fetchHospitalInfo());
    }
  }, [dispatch, hospitalInfoStatus]);

  useEffect(() => {
    if (hospitalInfo) {
      setFormData((prevData) => ({
        ...prevData,
        ...hospitalInfo,
      }));
    }
  }, [hospitalInfo]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e, field) => {
    const categories = e.target.value.split(",").map((cat) => cat.trim());
    setFormData((prevData) => ({
      ...prevData,
      [field]: categories,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogo2Upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo2File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo2Preview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMoreLogosUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setMoreLogoFiles((prevFiles) => [...prevFiles, ...files]);

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMoreLogoPreview((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMoreLogo = (index) => {
    setMoreLogoFiles((prev) => prev.filter((_, i) => i !== index));
    setMoreLogoPreview((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      morelogos: prev.morelogos.filter((_, i) => i !== index),
    }));
  };

  const uploadLogo = async () => {
    if (!logoFile) return null;

    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/getUploadUrl`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }

      const data = await response.json();

      const res = await fetch(data.url, {
        method: "PUT",
        body: logoFile,
        headers: {
          "Content-Type": "image/png",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to upload logo");
      } else {
        return `${s3Domain}/${data.key}`;
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Logo Upload Failed",
        description: "Failed to upload the logo. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadLogo2 = async () => {
    if (!logo2File) return null;

    try {
      const response = await fetch(
        `${Backend_URL}/api/hospitals/getUploadUrl`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload logo2");
      }

      const data = await response.json();

      const res = await fetch(data.url, {
        method: "PUT",
        body: logo2File,
        headers: {
          "Content-Type": "image/png",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to upload logo2");
      } else {
        return `${s3Domain}/${data.key}`;
      }
    } catch (error) {
      console.error("Error uploading logo2:", error);
      toast({
        title: "Logo2 Upload Failed",
        description: "Failed to upload the second logo. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const uploadMoreLogos = async () => {
    if (!moreLogoFiles.length) return [];

    const uploadedUrls = [];

    for (const file of moreLogoFiles) {
      try {
        const response = await fetch(
          `${Backend_URL}/api/hospitals/getUploadUrl`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload additional logo");
        }

        const data = await response.json();

        const res = await fetch(data.url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": "image/png",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to upload additional logo");
        } else {
          uploadedUrls.push(`${s3Domain}/${data.key}`);
        }
      } catch (error) {
        console.error("Error uploading additional logo:", error);
        toast({
          title: "Additional Logo Upload Failed",
          description:
            "Failed to upload one or more additional logos. Please try again.",
          variant: "destructive",
        });
      }
    }

    return uploadedUrls;
  };

  const triggerLogoUpload = () => {
    document.getElementById("logo-upload").click();
  };

  const triggerLogo2Upload = () => {
    document.getElementById("logo2-upload").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let updatedFormData = { ...formData };

      if (logoFile) {
        const logoUrl = await uploadLogo();
        if (logoUrl) {
          updatedFormData.logo = logoUrl;
        }
      }

      if (logo2File) {
        const logo2Url = await uploadLogo2();
        if (logo2Url) {
          updatedFormData.logo2 = logo2Url;
        }
      }

      if (moreLogoFiles.length > 0) {
        const moreLogoUrls = await uploadMoreLogos();
        if (moreLogoUrls.length > 0) {
          updatedFormData.morelogos = [
            ...(updatedFormData.morelogos || []),
            ...moreLogoUrls,
          ];
        }
      }

      await dispatch(updateHospitalInfo(updatedFormData)).unwrap();
      setMoreLogoFiles([]);
      setMoreLogoPreview([]);

      toast({
        variant: "success",
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
      setFormData((prevData) => ({
        ...prevData,
        [field]: [...prevData[field], newCategory.trim()],
      }));
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (field, index) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Hospital Information Management
            </CardTitle>
            <CardDescription className="text-gray-500">
              Manage your hospital's details
            </CardDescription>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={updateStatus === "loading"}
            className="w-full sm:w-auto"
          >
            {updateStatus === "loading" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="hospital" className="w-full">
          <TabsList className="grid w-full sm:w-1/2 grid-cols-2 mb-6">
            <TabsTrigger value="hospital" className="text-sm font-medium">
              <span className="hidden sm:inline">Hospital Information</span>
              <span className="sm:hidden">Hospital</span>
            </TabsTrigger>
            <TabsTrigger value="pharmacy" className="text-sm font-medium">
              <span className="hidden sm:inline">Pharmacy Information</span>
              <span className="sm:hidden">Pharmacy</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hospital">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label="Hospital ID"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  disabled
                />
                <InputField
                  label="Hospital Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <InputField
                  label="Website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                />
                <InputField
                  label="Doctor's Name (Only for Clinic)"
                  name="doctorName"
                  value={formData.doctorName}
                  onChange={handleChange}
                />
                <TextareaField
                  label="Doctor Information"
                  name="doctorInfo"
                  value={formData.doctorInfo}
                  onChange={handleChange}
                />
                <TextareaField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-span-1">
                <Label htmlFor="logo-upload" className="text-sm font-medium">
                  Hospital Logo
                </Label>
                <div className="mb-6 grid grid-cols-2 gap-6">
                  <div
                    className="mt-2 flex justify-center items-center rounded-lg border border-dashed border-gray-900/25 w-full sm:w-40 h-40 cursor-pointer"
                    onClick={triggerLogoUpload}
                  >
                    <div className="text-center">
                      {logoPreview || formData.logo ? (
                        <img
                          src={logoPreview || formData.logo}
                          alt="Logo Preview"
                          className="mx-auto h-32 w-32 object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload
                            className="h-10 w-10 text-gray-300"
                            aria-hidden="true"
                          />
                          <span className="mt-2 block text-sm font-semibold text-gray-900">
                            Upload
                          </span>
                        </div>
                      )}
                      <input
                        id="logo-upload"
                        name="logo-upload"
                        type="file"
                        className="hidden"
                        onChange={handleLogoUpload}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div
                    className="mt-2 flex justify-center items-center rounded-lg border border-dashed border-gray-900/25 w-full sm:w-40 h-40 cursor-pointer"
                    onClick={triggerLogo2Upload}
                  >
                    <div className="text-center">
                      {logo2Preview || formData.logo2 ? (
                        <img
                          src={logo2Preview || formData.logo2}
                          alt="Secondary Logo Preview"
                          className="mx-auto h-32 w-32 object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload
                            className="h-10 w-10 text-gray-300"
                            aria-hidden="true"
                          />
                          <span className="mt-2 block text-sm font-semibold text-gray-900">
                            Upload
                          </span>
                        </div>
                      )}
                      <input
                        id="logo2-upload"
                        name="logo2-upload"
                        type="file"
                        className="hidden"
                        onChange={handleLogo2Upload}
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <Label className="text-sm font-medium mb-2 block">
                    Additional Logos
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Existing logos display */}
                    {formData.morelogos?.map((logo, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={moreLogosBlobs[index] || logo}
                          alt={`Additional Logo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeMoreLogo(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}

                    {/* Preview of new uploads */}
                    {moreLogoPreview.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`New Logo Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeMoreLogo(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}

                    {/* Upload button */}
                    <div
                      className="flex justify-center items-center rounded-lg border border-dashed border-gray-900/25 w-full h-32 cursor-pointer"
                      onClick={() =>
                        document.getElementById("more-logos-upload").click()
                      }
                    >
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-300 mx-auto" />
                        <span className="mt-2 block text-sm font-semibold text-gray-900">
                          Add More
                        </span>
                      </div>
                    </div>
                    <input
                      id="more-logos-upload"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleMoreLogosUpload}
                      accept="image/*"
                    />
                  </div>
                </div>

                <CategoryField
                  label="Hospital Service Categories"
                  categories={formData.hospitalServiceCategories}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onAdd={() => handleAddCategory("hospitalServiceCategories")}
                  onRemove={(index) =>
                    handleRemoveCategory("hospitalServiceCategories", index)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pharmacy">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField
                  label="Pharmacy Name"
                  name="pharmacyName"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                />
                <InputField
                  label="Pharmacy Contact Number"
                  name="pharmacyContactNumber"
                  value={formData.pharmacyContactNumber}
                  onChange={handleChange}
                />
                <InputField
                  label="Pharmacy Logo URL"
                  name="pharmacyLogo"
                  value={formData.pharmacyLogo}
                  onChange={handleChange}
                />
                <TextareaField
                  label="Pharmacy Address"
                  name="pharmacyAddress"
                  value={formData.pharmacyAddress}
                  onChange={handleChange}
                />
                <InputField
                  label="Item Expiry Threshold (months)"
                  name="pharmacyExpiryThreshold"
                  type="number"
                  value={formData.pharmacyExpiryThreshold}
                  onChange={handleChange}
                />
              </div>
              <div className="col-span-1">
                <CategoryField
                  label="Pharmacy Item Categories"
                  categories={formData.pharmacyItemCategories}
                  newCategory={newCategory}
                  setNewCategory={setNewCategory}
                  onAdd={() => handleAddCategory("pharmacyItemCategories")}
                  onRemove={(index) =>
                    handleRemoveCategory("pharmacyItemCategories", index)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
    </Label>
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
    <Label htmlFor={name} className="text-sm font-medium">
      {label}
    </Label>
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

const CategoryField = ({
  label,
  categories,
  newCategory,
  setNewCategory,
  onAdd,
  onRemove,
}) => {
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
          <Button type="submit" disabled={!newCategory.trim()}>
            <Plus size={16} />
          </Button>
        </form>
        <ScrollArea className="h-[150px] w-full border rounded-md p-4">
          {categories?.length > 0 ? (
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
