import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { parseAge } from "../assets/Data";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  PrinterIcon,
  Wallet,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Separator } from "../components/ui/separator";
import { fetchServices } from "../redux/slices/serviceSlice";
import { SearchSuggestion } from "../components/custom/registration/CustomSearchSuggestion";
import {
  createBill,
  setCreateBillStatusIdle,
  updateBill,
  fetchBillById,
} from "../redux/slices/BillingSlice";
import { useToast } from "../hooks/use-toast";
import { setSelectedPatientForBill } from "../redux/slices/patientSlice";
import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { format } from "date-fns";
import { ScrollArea } from "../components/ui/scroll-area";
import OPDBillTokenModal from "../components/custom/registration/OPDBillTokenModal";
import ViewBillDialog from "../components/custom/billing/ViewBillDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import PaymentDialog from "../components/custom/billing/PaymentDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { updateOperationName } from "../redux/slices/patientSlice";

import SelectServicesDialog from "../components/custom/registration/SelectServicesDialog";

const CreateServiceBill = ({
  initialBillId,
  initialBillDatas,
  patientData,
  isEmbedded = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { billId: urlBillId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  const hospitalSettings = useSelector(
    (state) => state.hospitalSettings.settings
  );
  const {settings} = useSelector((state) => state.hospitalSettings);


  const [billDataForPrint, setBillDataForPrint] = useState(null);
  const [newlyAddedServices, setNewlyAddedServices] = useState([]);
  const [isViewFromUpdate, setIsViewFromUpdate] = useState(false);

  const [billPatientDetails, setBillPatientDetails] = useState(null);

  const patientDetails = billPatientDetails;
  const { services, servicesStatus } = useSelector((state) => state.services);
  const createBillStatus = useSelector((state) => state.bills.createBillStatus);
  const updateBillStatus = useSelector((state) => state.bills.updateBillStatus);
  const [addedServices, setAddedServices] = useState([]);
  const [newService, setNewService] = useState({
    serviceName: "",
    quantity: "",
    rate: "",
    total: "",
    category: "",
  });
  const [serviceName, setServiceName] = useState("");
  const [additionalDiscount, setAdditionalDiscount] = useState("");
  const [additionalDiscountType, setAdditionalDiscountType] =
    useState("amount");
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isViewBillDialogOpen, setIsViewBillDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [breakTotalMode, setBreakTotalMode] = useState(() => {
    return hospitalSettings?.defaultBreakBillMode !== false;
  });

  const [targetTotal, setTargetTotal] = useState("");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInitialSetupDone, setIsInitialSetupDone] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState(null);

  const [initialBillData, setInitialBillData] = useState(initialBillDatas);
  const [billData, setBillData] = useState(initialBillData || {});

  // First, add a new state to track manual subtotal edits
  const [manualSubtotal, setManualSubtotal] = useState(null);

  // Use either the prop billId or URL billId
  const billId = initialBillId || urlBillId;

  // Add this selector to get hospital settings

  // Modify the breakTotalMode state initialization to use hospital settings
  useEffect(() => {
    setBreakTotalMode(hospitalSettings?.defaultBreakBillMode !== false);
  }, [hospitalSettings]);

  // Initialize state with props if provided
  useEffect(() => {
    if (initialBillData && patientData) {
      setIsEditing(true);
      // Process all services from all bills
      const formattedServices = initialBillData.services.flatMap(
        (bill, billIndex) =>
          bill.services.map((service, serviceIndex) => ({
            id: `${billIndex}-${serviceIndex}`, // Create unique ID combining bill and service index
            service: service.name,
            category: service.category,
            type: service.type,
            quantity: service.quantity,
            date: service.date,
            rate: service.rate,
            _id: service._id,
            total: service.rate * service.quantity,
            isExisting: true,
            billId: bill._id,
          }))
      );
      setAddedServices(formattedServices);
      setSelectedServices(formattedServices.map((service) => service.id));
      const totalAdditionalDiscount =
        initialBillData?.services?.[0]?.additionalDiscount;
      setAdditionalDiscount(totalAdditionalDiscount.toString());

      setBillPatientDetails({
        _id: patientData._id,
        name: patientData.name,
        contactNumber: patientData.contactNumber,
        registrationNumber: patientData.registrationNumber,
        age: patientData.age,
        gender: patientData.gender,
        address: patientData.address,
        bloodGroup: patientData.bloodGroup,
        type: patientData.type,
        admissionDate: patientData.admissionDate || null,
        dischargeDate: patientData.dischargeDate || null,
        bookingDate: patientData.bookingDate || null,
        ipdNumber: patientData.ipdNumber || null,
      });
    } else if (billId) {
      dispatch(fetchBillById(billId))
        .unwrap()
        .then((billData) => {
          setIsEditing(true);
          setNewlyAddedServices([]);
          const lastServiceId = location.state?.lastServiceId;
          let services = billData.services;

          if (lastServiceId) {
            const lastServiceIndex = services.findIndex(
              (service) => service._id === lastServiceId
            );
            if (lastServiceIndex !== -1) {
              services = services.slice(0, lastServiceIndex + 1);
            }
          }
          // Format billData to match initialBillData.services[0] structure
          const formattedBillData = {
            services: [
              {
                _id: billData._id,
                services: services.map((service) => ({
                  name: service.name,
                  category: service.category,
                  quantity: service.quantity,
                  _id: service._id,
                  type: service.type,
                  date: service.date,
                  rate: service.rate,
                })),
                createdAt: billData.createdAt,
                totalAmount: billData.totalAmount,
                additionalDiscount: billData.additionalDiscount,
                subtotal: billData.subtotal,
                amountPaid: billData.amountPaid,
                payments: billData.payments,
                invoiceNumber: billData.invoiceNumber,
              },
            ],
            visit: billData?.visit,
            admission: billData?.admission,
            operationName: billData.operationName,
            procedureName: billData.procedureName,
            createdBy: billData.createdBy,
          };


          const formattedServices = services.map((service, index) => {
            return {
              id: index + 1,
              service: service.name,
              _id: service._id,
              date: service.date,
              type: service.type,
              category: service.category,
              quantity: service.quantity,
              rate: service.rate,
              total: service.rate * service.quantity,
              isExisting: true,
            };
          });

          setAddedServices(formattedServices);
          setSelectedServices(formattedServices.map((service) => service.id));
          setAdditionalDiscount(billData.additionalDiscount || "");
          setBillPatientDetails({
            _id: billData.patient?._id || billData.patientInfo?._id,
            name: billData.patientInfo?.name || billData.patient?.name,
            contactNumber:
              billData.patientInfo?.phone || billData.patient?.phone,
            registrationNumber:
              billData.patient?.registrationNumber ||
              billData.patientInfo?.registrationNumber,
            age: billData.patient?.age || billData.patientInfo?.age,
            gender: billData.patient?.gender || billData.patientInfo?.gender,
            address: billData.patient?.address || billData.patientInfo?.address,
            bloodGroup:
              billData.patient?.bloodGroup || billData.patientInfo?.bloodGroup,
            ipdNumber:
              billData.patientInfo?.ipdNumber || billData.patient?.ipdNumber,
            type: billData.patientType || billData.patientInfo?.type,
            bookingDate:
              billData.patient?.bookingDate || billData.createdAt || null,
          });

          setBillData(formattedBillData); // Now storing in the same format as initialBillDat
        })
        .catch((error) => {
          toast({
            title: "Error fetching bill",
            description: "Could not load the bill details. Please try again.",
            variant: "destructive",
          });
          if (!isEmbedded) {
            navigate("/billings");
          }
        });
    }
  }, []);

  // Modify navigation behavior based on isEmbedded

  const calculateTotals = useMemo(() => {
    const originalSubtotal =
      billData?.subtotal || billData?.services?.[0]?.subtotal || 0;
    const originalServices = billData?.services?.[0]?.services || [];

    // Calculate totals based on mode
    const relevantServices = breakTotalMode
      ? addedServices.filter((service) => service.type === "breakup")
      : addedServices.filter((service) => service.type !== "breakup");

    const currentServicesTotal = relevantServices.reduce(
      (sum, service) => sum + service.total,
      0
    );

    // Calculate the base amount (portion of original subtotal that wasn't from services)
    const baseAmount = Math.max(0, originalSubtotal - currentServicesTotal);

    // If in break total mode, use target total as the main total
    if (breakTotalMode) {
      const targetTotalValue = parseFloat(targetTotal || 0);

      let discountValue = 0;
      if (additionalDiscount !== "") {
        if (additionalDiscountType === "amount") {
          discountValue = parseFloat(additionalDiscount);
        } else {
          discountValue =
            (parseFloat(additionalDiscount) / 100) * targetTotalValue;
        }
      }

      // Ensure discount doesn't exceed target total
      discountValue = Math.min(discountValue, targetTotalValue);
      

      return {
        subtotal: originalSubtotal, // Adjust subtotal to match target total after discount
        additionalDiscount: discountValue.toFixed(2),
        totalAmount: originalSubtotal - discountValue,
        currentServicesSubtotal: currentServicesTotal,
        totalAmountPaid:
          billData?.amountPaid || billData?.services?.[0]?.amountPaid || 0,
      };
    }

    // Normal mode calculation
    const subtotal = currentServicesTotal;

    let discountValue = 0;
    if (additionalDiscount !== "") {
      if (additionalDiscountType === "amount") {
        discountValue = parseFloat(additionalDiscount);
      } else {
        discountValue = (parseFloat(additionalDiscount) / 100) * subtotal;
      }
    }

    // Ensure discount doesn't exceed subtotal
    discountValue = Math.min(discountValue, subtotal);

    return {
      subtotal: subtotal,
      additionalDiscount: discountValue.toFixed(2),
      totalAmount: subtotal - discountValue,
      currentServicesSubtotal: currentServicesTotal,
      totalAmountPaid:
        billData?.amountPaid || billData?.services?.[0]?.amountPaid || 0,
    };
  }, [
    addedServices,
    additionalDiscount,
    additionalDiscountType,
    billData,
    breakTotalMode,
    targetTotal,
    manualSubtotal,
  ]);


  useEffect(() => {
    if (calculateTotals.totalAmount) {
      setTargetTotal(calculateTotals.totalAmount);
    }
  }, [calculateTotals]);

  useEffect(() => {
    if (servicesStatus === "idle") dispatch(fetchServices());
  }, [dispatch, servicesStatus]);

  useEffect(() => {
    if (createBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill created successfully",
        description: "The bill has been successfully created.",
      });

      // If patient type is OPD, show print modal
      if (patientDetails?.type === "OPD") {
        setBillData({
          patient: patientDetails,
          bill: {
            _id: Date.now().toString(),
            services: addedServices.map((service) => ({
              name: service.service,
              quantity: service.quantity,
              rate: service.rate,
            })),
            createdAt: new Date(),
            subtotal: calculateTotals.subtotal,
            additionalDiscount: calculateTotals.additionalDiscount,
            totalAmount: calculateTotals.totalAmount,
            amountPaid: calculateTotals.totalAmount,
          },
          payment: {
            paymentMethod: "Cash",
          },
        });
        setIsPrintModalOpen(true);
      }

      dispatch(setCreateBillStatusIdle());
      navigate("/billings");
    } else if (createBillStatus === "failed") {
      toast({
        title: "Error creating bill",
        description: "There was an error creating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [
    createBillStatus,
    dispatch,
    toast,
    navigate,
    patientDetails,
    addedServices,
    calculateTotals,
  ]);

  useEffect(() => {
    if (updateBillStatus === "succeeded") {
      toast({
        variant: "success",
        title: "Bill updated succesuhusfully",
        description: "The bill has been successfully updated.",
      });
      dispatch(setCreateBillStatusIdle());
      setIsViewFromUpdate(true);
      handlePrintBill();
    } else if (updateBillStatus === "failed") {
      toast({
        title: "Error updating bill",
        description: "There was an error updating the bill. Please try again.",
        variant: "destructive",
      });
      dispatch(setCreateBillStatusIdle());
    }
  }, [updateBillStatus, dispatch, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => {
      const updatedItem = { ...prev, [name]: value };
      if (updatedItem.quantity && updatedItem.rate) {
        const quantity = parseInt(updatedItem.quantity);
        const rate = parseFloat(updatedItem.rate);
        updatedItem.total = quantity * rate;
      }
      return updatedItem;
    });
  };

  useEffect(() => {
    if (serviceName) {
      setNewService((prev) => ({ ...prev, serviceName }));
    }
  }, [serviceName]);

  const handleBreakTotalModeChange = (e) => {
    const isChecked = e.target.checked;

    // If there are newly added services, show warning
    if (newlyAddedServices.length > 0) {
      setPendingModeChange(isChecked);
      setIsWarningDialogOpen(true);
      return;
    }

    applyModeChange(isChecked);
  };

  const applyModeChange = (isChecked) => {
    setBreakTotalMode(isChecked);

    // Keep existing services but update their types if needed

    // Only clear newly added services
    const existingServices = addedServices.filter(
      (service) =>
        (service.isExisting &&
          (isChecked
            ? service.type === "breakup"
              ? true
              : false
            : service.type !== "breakup"
            ? true
            : false)) ||
        service.category === "Room Rent"
    );
    setNewlyAddedServices([]);
    setSelectedServices(existingServices.map((service) => service.id));

    // Update target total based on existing services
  };



  const handleAddService = (e) => {
    e.preventDefault();

    const totalValue = parseFloat(newService.total);
    const quantityValue = parseFloat(newService.quantity);

    if (breakTotalMode) {
      // Check if adding this service would exceed target total
      const currentBreakupTotal = addedServices
        .filter((ser) => ser.type === "breakup" || ser.category === "Room Rent")
        .reduce((sum, service) => sum + service.total, 0);

      

      if (currentBreakupTotal + totalValue > parseFloat(targetTotal||0)) {
        toast({
          title: "Exceeds Target Total",
          description: "This service would exceed the target total amount.",
          variant: "destructive",
        });
        return;
      }
    }

    const newServiceWithoutDiscount = {
      id: Date.now(),
      service: newService.serviceName,
      category: newService.category || "Not specified",
      quantity: quantityValue,
      rate: totalValue / quantityValue,
      total: totalValue,
      isExisting: false,
      date: new Date().toISOString(),
      type: breakTotalMode ? "breakup" : "additional",
    };

    setAddedServices((prev) => [...prev, newServiceWithoutDiscount]);
    setNewlyAddedServices((prev) => [...prev, newServiceWithoutDiscount]);
    setSelectedServices((prev) => [...prev, newServiceWithoutDiscount.id]);

    setNewService({
      serviceName: "",
      quantity: "",
      rate: "",
      total: "",
      category: "",
    });
    setServiceName("");
  };

  const handleRemoveService = (id) => {
    const serviceToRemove = addedServices.find((service) => service.id === id);

    setAddedServices((prev) => prev.filter((service) => service.id !== id));

    // If it's a newly added service, remove it from newlyAddedServices as well
    if (!serviceToRemove.isExisting) {
      setNewlyAddedServices((prev) =>
        prev.filter((service) => service.id !== id)
      );
    }

    setSelectedServices((prev) => prev.filter((serviceId) => serviceId !== id));
  };

  const handleEditService = (id) => {
    const serviceToEdit = addedServices.find((service) => service.id === id);
    if (serviceToEdit) {
      // Only turn off break total mode if editing an existing service
      if (serviceToEdit.isExisting) {
        setBreakTotalMode(false);
      }

      setNewService({
        serviceName: serviceToEdit.service,
        quantity: serviceToEdit.quantity.toString(),
        rate: serviceToEdit.rate.toString(),
        total: serviceToEdit.total.toString(),
        category: serviceToEdit.category,
      });
      setServiceName(serviceToEdit.service);

      // Remove from addedServices
      setAddedServices((prev) => prev.filter((service) => service.id !== id));

      // If it's a newly added service, remove from newlyAddedServices as well
      if (!serviceToEdit.isExisting) {
        setNewlyAddedServices((prev) =>
          prev.filter((service) => service.id !== id)
        );
      }

      setSelectedServices((prev) =>
        prev.filter((serviceId) => serviceId !== id)
      );
    }
  };

  const handleServiceSuggestionSelect = (suggestion) => {
    setNewService((prev) => ({
      ...prev,
      serviceName: suggestion.name,
      rate: suggestion.rate,
      total: suggestion.rate,
      category: suggestion.category,
      quantity: 1,
    }));
  };
  // Create bill data sending to backend
  const handleCreate = () => {
    if (addedServices.length === 0) {
      toast({
        title: "No services added",
        description:
          "Please add at least one service before creating the bill.",
        variant: "destructive",
      });
      return;
    }

    let additionalDiscountAmount = parseFloat(additionalDiscount) || 0;

    if (additionalDiscountType === "percentage") {
      additionalDiscountAmount =
        (additionalDiscountAmount / 100) * calculateTotals.subtotal;
    }

    const billData = {
      services: addedServices.map((service) => ({
        name: service.service,
        quantity: service.quantity,
        rate: service.rate,
        _id: service._id,
        discount: service.discAmt,
        date: service.date,
        category: service.category,
        isExisting: service.isExisting || false,
        type: service.type,
      })),
      patient: patientDetails._id,
      patientType: patientDetails.type,
      patientInfo: {
        name: patientDetails.name,
        phone: patientDetails.contactNumber,
      },
      totals: {
        totalAmount: calculateTotals.totalAmount,
        subtotal: calculateTotals.subtotal,
        additionalDiscount: additionalDiscountAmount,
        currentServicesSubtotal: calculateTotals.currentServicesSubtotal,
      },
    };

    if (isEditing) {
      dispatch(
        updateBill({
          billId: billId || initialBillData.services[0]._id,
          billData,
        })
      );
    } else {
      dispatch(createBill(billData));
    }
  };

  const handleReset = () => {
    setAddedServices([]);
    setNewlyAddedServices([]); // Clear newly added services

    setNewService({
      serviceName: "",
      quantity: "",
      rate: "",
      total: "",
      category: "",
    });
    setServiceName("");
    setAdditionalDiscount("");
    setAdditionalDiscountType("amount");
    setSelectedServices([]);
  };

  const handlePrintBill = () => {
    // Filter services based on selection
    const selectedServicesList = addedServices.filter(
      (service) =>
        selectedServices.includes(service.id) &&
        (breakTotalMode
          ? service.type !== "additional" &&
            (service.type || service.category === "Room Rent")
          : true)
    );
    // Calculate totals for selected services only
    const selectedServicesTotal = selectedServicesList.reduce(
      (sum, service) => sum + service.total,
      0
    );

    let discountAmount = parseFloat(additionalDiscount) || 0;
    if (additionalDiscountType === "percentage") {
      discountAmount = (discountAmount / 100) * selectedServicesTotal;
    }

    const totalAfterDiscount = selectedServicesTotal - discountAmount;
    const firstBill = billData?.services?.[0] || {};
    if (patientDetails?.type === "OPD") {
      const opdBillData = {
        patient: {
          name: patientDetails?.name,
          age: patientDetails?.age,
          gender: patientDetails?.gender,
          contactNumber: patientDetails?.contactNumber,
          registrationNumber: patientDetails?.registrationNumber,
          address: patientDetails?.address,
        },
        bill: {
          _id: firstBill._id || Date.now().toString(),
          services: selectedServicesList.map((service) => ({
            name: service.service,
            quantity: service.quantity,
            rate: service.rate,
            total: service.total,
          })),
          createdAt: firstBill.createdAt || new Date(),
          subtotal: calculateTotals.subtotal,
          additionalDiscount: discountAmount,
          totalAmount: calculateTotals.totalAmount,
          amountPaid: calculateTotals.totalAmountPaid,
          payments: firstBill.payments || [],
          invoiceNumber: firstBill.invoiceNumber || null,
        },
        admissionRecord: billData?.visit,
        payment: firstBill.payments || [],
      };
      setBillDataForPrint(opdBillData);
      if (patientDetails?.name) {
        setIsPrintModalOpen(true);
      } else {
        setIsPrintModalOpen(false);
      }
    } else {
      // Format for ViewBillDialog
      const viewBillData = {
        _id: firstBill._id || Date.now().toString(),
        createdAt: firstBill.createdAt || new Date(),
        admissionDate: patientDetails?.admissionDate,
        dischargeDate: patientDetails?.dischargeDate,
        patientInfo: {
          name: patientDetails?.name,
          age: patientDetails?.age,
          gender: patientDetails?.gender,
          address: patientDetails?.address,
          contactNumber: patientDetails?.contactNumber,
          registrationNumber: patientDetails?.registrationNumber,
          ipdNumber: patientDetails?.ipdNumber,
        },
        services: selectedServicesList.map((service) => ({
          name: service.service,
          quantity: service.quantity,
          rate: service.rate,
          date: service.date,
        })),
        totalAmount: calculateTotals.totalAmount,
        invoiceNumber: firstBill.invoiceNumber || null,
        subtotal: calculateTotals.subtotal,
        additionalDiscount: discountAmount,
        amountPaid: calculateTotals.totalAmountPaid,
        payments: firstBill.payments || billData.payments || [],
        operationName: billData?.operationName,
        createdBy: billData?.createdBy,
      };
      setBillDataForPrint(viewBillData);
      if (patientDetails?.name) {
        setIsViewBillDialogOpen(true);
      } else {
        setIsViewBillDialogOpen(false);
      }
    }
  };

  const isLoading =
    createBillStatus === "loading" || updateBillStatus === "loading";

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedServices(addedServices.map((service) => service.id));
    } else {
      setSelectedServices([]);
    }
  };

  const handleSelectService = (id) => {
    setSelectedServices((prev) => {
      if (prev.includes(id)) {
        return prev.filter((serviceId) => serviceId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const renderHeader = () => {
    if (!isEmbedded) {
      return (
        <div className="flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2" />
            <h3 className=" font-bold">
              {isEditing ? "Edit Bill" : "Add Bill"}
            </h3>
          </div>
        </div>
      );
    }
    return null;
  };

  const remainingAmount = useMemo(() => {
    if (!breakTotalMode || !targetTotal) return 0;
    const currentTotal = addedServices
      .filter((ser) => ser.type === "breakup" || ser.category === "Room Rent")
      .reduce((sum, service) => sum + service.total, 0);
    return parseFloat(targetTotal) - currentTotal;
  }, [breakTotalMode, targetTotal, addedServices]);

  // Add this component definition before the return statement
  const BreakTotalModeToggle = () => (
    <div className="flex items-center justify-between mb-4 p-2 bg-gray-50 rounded-lg  h-5">
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="breakTotalMode"
          checked={breakTotalMode}
          onChange={handleBreakTotalModeChange}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="breakTotalMode" className="text-sm font-medium">
          Break Total Mode{" "}
          <span className="text-xs text-gray-500">
            (To be only used when{" "}
            <span className="font-bold text-black">net total</span> has to be
            divided)
          </span>
        </label>
      </div>
      {breakTotalMode && (
        <div className="flex items-center space-x-2 ">
          <label htmlFor="targetTotal" className="text-sm font-medium">
            Target Total:
          </label>
          <Input
            id="targetTotal"
            value={targetTotal}
            onChange={(e) => setTargetTotal(e.target.value)}
            className="w-32 h-6"
            placeholder="Enter total"
          />
          {targetTotal && (
            <div className="text-sm">
              Remaining:{" "}
              <span
                className={
                  remainingAmount < 0
                    ? "text-red-500 font-bold"
                    : "text-green-500 font-bold"
                }
              >
                ₹{remainingAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const handlePaymentSuccess = (updatedBill) => {
    // Update the billData state with the new data
    const formattedBillData = {
      // services: [
      //   {
      //     _id: updatedBill._id,
      //     services: updatedBill.services,
      //     createdAt: updatedBill.createdAt,
      //     totalAmount: updatedBill.totalAmount,
      //     additionalDiscount: updatedBill.additionalDiscount,
      //     subtotal: updatedBill.subtotal,
      //     amountPaid: updatedBill.amountPaid,
      //     payments: updatedBill.payments,
      //     invoiceNumber: updatedBill.invoiceNumber,
      //   },
      // ],
      updatedBill,
    };

    setBillData(updatedBill);
    // Update billDataForPrint if needed
    const formattedBillDataForPrint = {
      _id: updatedBill._id,
      totalAmount: updatedBill.totalAmount,
      amountPaid: updatedBill.amountPaid,
      payments: updatedBill.payments,
    };
    setBillDataForPrint(updatedBill);
    setIsViewBillDialogOpen(true);
  };

  // Modify the handleOpenPayment function
  const handleOpenPayment = () => {
    const formattedBillData = {
      _id: billData?.services?.[0]?._id || billId,
      totalAmount: calculateTotals.totalAmount,
      amountPaid: calculateTotals.totalAmountPaid,
      payments: billData?.services?.[0]?.payments || [],
      createdAt: billData?.services?.[0]?.createdAt || new Date(),
    };

    setBillDataForPrint(formattedBillData);
    setIsPaymentDialogOpen(true);
  };

  const [viewMode, setViewMode] = useState(settings.defaultBillPrintView || "list");
  useEffect(() => {
    if (settings) {
      setViewMode(settings.defaultBillPrintView || "list");
    }
  }, [settings]);

  // Add memoized values for filtered services and date grouping
  const filteredServicesForDisplay = useMemo(() => {
    return addedServices.filter(
      (service) =>
        (breakTotalMode
          ? service.type === "breakup"
          : service.type !== "breakup") || service.category === "Room Rent"
    );
  }, [addedServices, breakTotalMode]);

  const servicesGroupedByDate = useMemo(() => {
    if (breakTotalMode || viewMode !== "datewise") return null;

    const grouped = filteredServicesForDisplay.reduce((acc, service) => {
      const date = service.date
        ? format(new Date(service.date), "yyyy-MM-dd")
        : "No Date";
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(service);
      return acc;
    }, {});

    // Sort dates in descending order
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, services]) => ({
        date,
        services: services.sort((a, b) => new Date(a.date) - new Date(b.date)),
      }));
  }, [filteredServicesForDisplay, breakTotalMode, viewMode]);

  // Add this inside the component before the return statement
  const [isEditingOperation, setIsEditingOperation] = useState(false);
  const [operationNameInput, setOperationNameInput] = useState("");

  const handleOperationNameEdit = async () => {
    if (!operationNameInput.trim()) return;

    try {
      await dispatch(
        updateOperationName({
          admissionId: billData?.services?.[0]?._id || billId,
          operationName: operationNameInput,
        })
      ).unwrap();

      setBillData((prev) => ({
        ...prev,
        operationName: operationNameInput,
      }));

      setIsEditingOperation(false);
      toast({
        title: "Success",
        description: "Operation name updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update operation name",
        variant: "destructive",
      });
    }
  };

  // Add these state variables inside the component
  const [isOperationDialogOpen, setIsOperationDialogOpen] = useState(false);
  const [selectedOperationServices, setSelectedOperationServices] = useState(
    []
  );

  // Add this handler inside the component
  const handleOperationSelect = async (selectedServices) => {
    if (selectedServices.length === 0) return;

    // Store the selected services and show the choice modal
    setPendingOperationServices(selectedServices);
    setIsOperationChoiceModalOpen(true);
    setIsOperationDialogOpen(false);
  };


  const handleOperationChoice = async (includeInBill) => {
    if (!pendingOperationServices) return;


    // Get all selected services
    const selectedOperations = pendingOperationServices.map(
      (selectedService) => {
        const operationService = services.find(
          (s) => s._id === selectedService.id
        );
        return {
          service: operationService?.name,
          category: operationService?.category,
          quantity: 1,
          rate: selectedService.rate,
          total: selectedService.rate,
          type: "additional",
        };
      }
    );


    try {
      const result = await dispatch(
        updateOperationName({
          admissionId:
            billData?.admission?._id || billData?.services?.[0]?.admission,
          operationName: selectedOperations.map((op) => op.service).join(", "),
          billId: billId || initialBillData.services[0]._id,
          includeInBill,
          serviceDetails: includeInBill ? selectedOperations : null,
        })
      ).unwrap();

      setBillData(result);

      // If includeInBill is true, add all selected services to the bill
      if (includeInBill) {
        const newServices = selectedOperations.map((operation) => ({
          id: Date.now() + Math.random(), // Ensure unique IDs
          service: operation.service,
          category: operation.category,
          quantity: operation.quantity,
          rate: operation.rate,
          total: operation.total,
          isExisting: true,
          date: new Date().toISOString(),
          type: operation.type,
        }));

        setAddedServices((prev) => [...prev, ...newServices]);
        setNewlyAddedServices((prev) => [...prev, ...newServices]);
        setSelectedServices((prev) => [
          ...prev,
          ...newServices.map((s) => s.id),
        ]);
        setPendingOperationServices(null);
        setSelectedOperationServices([])
        
      }

      toast({
        title: "Success",
        description: "Operation name updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update operation name",
        variant: "destructive",
      });
    } finally {
      setIsOperationChoiceModalOpen(false);
      setPendingOperationServices(null);
    }
  };

  const [isOperationChoiceModalOpen, setIsOperationChoiceModalOpen] =
    useState(false);
  const [pendingOperationServices, setPendingOperationServices] =
    useState(null);

  return (
    <div className="w-full  max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
      {renderHeader()}

      <Card>
        <CardContent className="p-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${patientDetails?.name}`}
                  alt={patientDetails?.name}
                />
                <AvatarFallback>
                  {patientDetails?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{patientDetails?.name}</h2>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  <Badge variant="outline">{patientDetails?.gender}</Badge>
                  <Badge variant="outline">{parseAge(patientDetails?.age,{yearLabel:"Years",monthLabel:"Months",dayLabel:"Days"})}</Badge>
                  {patientDetails?.bloodGroup && (
                    <Badge variant="outline">{patientDetails.bloodGroup}</Badge>
                  )}
                  {patientDetails?.registrationNumber && (
                    <Badge variant="outline">
                      UHID No: {patientDetails.registrationNumber}
                    </Badge>
                  )}
                  {patientDetails?.ipdNumber && (
                    <Badge variant="outline">
                      IPD No: {patientDetails.ipdNumber}
                    </Badge>
                  )}
                  {patientDetails?.type === "IPD" && (
                    <Badge
                      variant="bluish"
                      className="cursor-pointer "
                      onClick={() => setIsOperationDialogOpen(true)}
                    >
                      <span className="flex items-center gap-1 text-xs">
                        Operation:{" "}
                        {billData?.operationName || "Select Operation"}
                        <Pencil className="ml-1 h-3 w-3" />
                      </span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patientDetails?.contactNumber}</span>
              </div>

              {patientDetails?.admissionDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>
                    Admit Date:{" "}
                    {format(
                      new Date(patientDetails.admissionDate),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </div>
              )}
              {patientDetails?.dischargeDate && (
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span>
                    Discharge:{" "}
                    {format(
                      new Date(patientDetails.dischargeDate),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </div>
              )}

              {patientDetails?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{patientDetails.address}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-3">
          <BreakTotalModeToggle />
          {/* Add view mode toggle buttons */}

          <form
            onSubmit={handleAddService}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-end mb-2"
          >
            <div className="col-span-full sm:col-span-1 md:col-span-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <SearchSuggestion
                suggestions={
                  breakTotalMode
                    ? services.filter((ser) => ser.category === "Sub Category")
                    : services
                }
                placeholder="Enter service name"
                value={serviceName}
                setValue={setServiceName}
                onSuggestionSelect={handleServiceSuggestionSelect}
              />
            </div>
            <div className="col-span-full sm:col-span-1 md:col-span-3 lg:col-span-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <Label htmlFor="quantity" className="hidden sm:block">
                    Quantity *
                  </Label>
                  <Input
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="Qty *"
                    value={newService.quantity}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="rate" className="hidden sm:block">
                    Rate
                  </Label>
                  <Input
                    type="number"
                    id="rate"
                    name="rate"
                    placeholder="Rate"
                    value={newService.rate}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor="total" className="hidden sm:block">
                    Total *
                  </Label>
                  <Input
                    type="number"
                    id="total"
                    name="total"
                    placeholder="Total *"
                    value={newService.total}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            <div className="col-span-full sm:col-span-1 flex items-center justify-center mt-2 sm:mt-0">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-auto sm:px-3 mr-2 flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span>Add</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full sm:w-8 sm:p-0"
                onClick={() =>
                  setNewService({
                    serviceName: "",
                    quantity: "",
                    rate: "",
                    total: "",
                    category: "",
                  })
                }
              >
                <Trash2 className="h-4 w-4 sm:inline" />
                <span className="sm:hidden">Clear</span>
              </Button>
            </div>
          </form>
          <Separator className="my-2" />

          {/* Mobile View */}
          <div className="sm:hidden space-y-1">
            {viewMode === "datewise" && !breakTotalMode
              ? servicesGroupedByDate?.map(({ date, services }) => (
                  <div key={date} className="mb-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {date === "No Date"
                        ? "No Date"
                        : format(new Date(date), "dd MMMM yyyy")}
                    </h3>
                    {services.map((service) => (
                      <Card key={service.id} className="mb-1">
                        <CardContent className="p-2">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 mr-2"
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleSelectService(service.id)}
                              />
                              <span className="font-semibold">
                                {service.service}
                              </span>
                            </div>
                            <div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 mr-2"
                                onClick={() => handleEditService(service.id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleRemoveService(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              Time:{" "}
                              {service.date
                                ? format(new Date(service.date), "hh:mm a")
                                : "-"}
                            </div>
                            <div>Quantity: {service.quantity}</div>
                            <div>
                              Rate: {service.rate.toLocaleString("en-IN")}
                            </div>
                            <div>
                              Total: ₹{service.total.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))
              : filteredServicesForDisplay.map((service) => (
                  <Card key={service.id} className="mb-1">
                    <CardContent className="p-2">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{service.service}</span>
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 mr-2"
                            onClick={() => handleEditService(service.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Date:{" "}
                          {service.date
                            ? format(
                                new Date(service.date),
                                "dd/MM/yyyy  hh:mm a"
                              )
                            : "-"}
                        </div>
                        <div>Quantity: {service.quantity}</div>
                        <div>Rate: {service.rate.toLocaleString("en-IN")}</div>
                        <div>
                          Total: ₹{service.total.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block">
            <ScrollArea className="h-[250px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] h-[35px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={
                          selectedServices.length ===
                            filteredServicesForDisplay.length &&
                          filteredServicesForDisplay.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="h-[35px]">Service</TableHead>
                    <TableHead className="h-[35px]">Date</TableHead>
                    <TableHead className="h-[35px]">Quantity</TableHead>
                    <TableHead className="text-right h-[35px]">Rate</TableHead>
                    <TableHead className="text-right h-[35px]">Total</TableHead>
                    <TableHead className="text-right h-[20px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewMode === "datewise" && !breakTotalMode
                    ? servicesGroupedByDate?.map(({ date, services }) => (
                        <>
                          <TableRow key={`date-${date}`}>
                            <TableCell colSpan={7} className="bg-gray-50">
                              <span className="font-semibold">
                                {date === "No Date"
                                  ? "No Date"
                                  : format(new Date(date), "dd MMMM yyyy")}
                              </span>
                            </TableCell>
                          </TableRow>
                          {services.map((service) => (
                            <TableRow key={service.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  className="h-3 w-3"
                                  checked={selectedServices.includes(
                                    service.id
                                  )}
                                  onChange={() =>
                                    handleSelectService(service.id)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                {service.service}
                              </TableCell>
                              <TableCell>
                                {service.date
                                  ? format(new Date(service.date), "hh:mm a")
                                  : "-"}
                              </TableCell>
                              <TableCell>{service.quantity}</TableCell>
                              <TableCell className="text-right">
                                {service.rate.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {service.total.toLocaleString("en-IN")}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0 mr-2"
                                  onClick={() => handleEditService(service.id)}
                                >
                                  <span className="sr-only">Edit</span>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleRemoveService(service.id)
                                  }
                                >
                                  <span className="sr-only">Remove</span>
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </>
                      ))
                    : filteredServicesForDisplay.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => handleSelectService(service.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {service.service}
                          </TableCell>
                          <TableCell>
                            {service.date
                              ? format(
                                  new Date(service.date),
                                  "dd/MM/yyyy hh:mm a"
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>{service.quantity}</TableCell>
                          <TableCell className="text-right">
                            {service.rate.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {service.total.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0 mr-2"
                              onClick={() => handleEditService(service.id)}
                            >
                              <span className="sr-only">Edit</span>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveService(service.id)}
                            >
                              <span className="sr-only">Remove</span>
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent
          className={`p-1 grid grid-cols-${!breakTotalMode ? "2" : "1"}`}
        >
          {!breakTotalMode && (
            <div className="flex  mb-2 space-x-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                List View
              </Button>
              <Button
                variant={viewMode === "datewise" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("datewise")}
                className="h-8"
              >
                Date-wise View
              </Button>
              <Button
                variant={viewMode === "listwithoutdate" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("listwithoutdate")}
                className="h-8"
              >
                List without Date
              </Button>

            </div>
          )}
          <div className="flex flex-col items-end space-y-0.5 text-sm">
            {/* Subtotal */}
            <div className="flex justify-end items-center w-full">
              <span className="text-gray-600 mr-4 min-w-[100px] text-right">
                Subtotal(₹):
              </span>
              <div className="w-32 text-right">
                <span className="font-medium">
                  {parseFloat(calculateTotals.subtotal || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Discount */}
            <div className="flex justify-end items-center w-full ">
              <span className="text-gray-600 mr-4 min-w-[100px] text-right">
                Discount(₹):
              </span>
              <div className="w-32">
                <Input
                  value={(parseFloat(additionalDiscount) || 0).toFixed(2)}
                  onChange={(e) => {
                    setAdditionalDiscount(e.target.value);
                  }}
                  className="w-full h-7 text-right text-red-600 font-medium border-0 p-0 focus:ring-1 focus-visible:ring-1 focus-visible:ring-offset-1 bg-transparent"
                  placeholder=""
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end items-center w-full border-t border-gray-200 ">
              <span className="font-medium mr-4 min-w-[100px] text-right">
                Net Total(₹):
              </span>
              <div className="w-32 text-right">
                <span className="font-medium">
                  {calculateTotals.totalAmount?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-end items-center w-full">
              <span className="text-gray-600 mr-4 min-w-[100px] text-right">
                Paid(₹):
              </span>
              <div className="w-32 text-right">
                <span className="text-green-600 font-bold">
                  {calculateTotals.totalAmountPaid?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Amount Due */}
            <div className="flex justify-end items-center w-full border-t border-gray-200 ">
              <span className="text-gray-600 mr-4 min-w-[100px] text-right">
                Balance Due(₹):
              </span>
              <div className="w-32 text-right">
                <span className="text-red-600 font-bold">
                  {(
                    calculateTotals.totalAmount -
                    (calculateTotals.totalAmountPaid || 0)
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-4 mt-2">
        <div className="flex w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="w-1/2 sm:w-auto"
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={handlePrintBill}
            className="w-1/2 sm:w-auto"
          >
            <PrinterIcon className="mr-2 h-4 w-4" />
            Print Bill
          </Button>
          <Button
            variant="outline"
            onClick={handleOpenPayment}
            className="w-1/2 sm:w-auto"
            disabled={!billId && !initialBillData} // Disable if no bill exists yet
          >
            <Wallet className="mr-2 h-4 w-4" />
            Pay
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isLoading}
            className="w-1/2 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Update Bill"
            ) : (
              "Create Bill"
            )}
          </Button>
        </div>
      </div>

      <OPDBillTokenModal
        isOpen={isPrintModalOpen}
        setIsOpen={() => {
          setIsPrintModalOpen(false);
          navigate("/billings");
        }}
        patientData={billDataForPrint}
        services={addedServices}
        selectedServices={selectedServices}
        onSelectService={handleSelectService}
        onSelectAll={handleSelectAll}
      />

      <ViewBillDialog
        isOpen={isViewBillDialogOpen}
        setIsOpen={() => {
          setIsViewBillDialogOpen(false);
          if (isViewFromUpdate) {
            setIsViewFromUpdate(false);
            navigate("/billings");
          }
        }}
        billData={billDataForPrint}
        services={addedServices}
        selectedServices={selectedServices}
        onSelectService={handleSelectService}
        onSelectAll={handleSelectAll}
        viewMode={viewMode}
      />

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        setIsOpen={setIsPaymentDialogOpen}
        billData={billDataForPrint}
        onPaymentSuccess={(updatedBill) => handlePaymentSuccess(updatedBill)}
      />

      <Dialog open={isWarningDialogOpen} onOpenChange={setIsWarningDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warning</DialogTitle>
            <DialogDescription>
              Changing the break total mode will delete all newly added services
              as they were calculated under different rules. Existing services
              will be preserved.Update the bill to reflect any chnages. Do you
              want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsWarningDialogOpen(false);
                setPendingModeChange(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                applyModeChange(pendingModeChange);
                setIsWarningDialogOpen(false);
                setPendingModeChange(null);
              }}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SelectServicesDialog
        isOpen={isOperationDialogOpen}
        onClose={() => setIsOperationDialogOpen(false)}
        services={services.filter((service) => service.category === "Surgery")}
        selectedServices={selectedOperationServices}
        onServicesChange={(services) => {
          setSelectedOperationServices(services);
          handleOperationSelect(services);
        }}
      />

      <Dialog
        open={isOperationChoiceModalOpen}
        onOpenChange={setIsOperationChoiceModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Operation Options</DialogTitle>
            <DialogDescription>
              How would you like to add the selected operation?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              variant="outline"
              onClick={() => handleOperationChoice(false)}
              className="w-full"
            >
              Add Operation Name Only
            </Button>
            <Button
              onClick={() => handleOperationChoice(true)}
              className="w-full"
            >
              Add Operation Name with Charges in Bill
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateServiceBill;
