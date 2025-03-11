import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
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
  const [breakTotalMode, setBreakTotalMode] = useState(true);
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
        bookingDate: patientData.bookingDate || null,
        ipdNumber: patientData.ipdNumber || null,
      });
    } else if (billId) {
      // Existing fetch logic for navigation scenario
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
                  type: service.type,
                  date: service.date,
                  rate:
                    service.category === "Surgery"
                      ? service.rate - billData.additionalDiscount
                      : service.rate,
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
            operationName: billData.services
              .filter((ser) => ser.category === "Surgery")
              .map((ser) => ser.name)
              .join(","),
          };

          const formattedServices = services.map((service, index) => {
            const discountedRate =
              service.category === "Surgery"
                ? service.rate - billData.additionalDiscount
                : service.rate;

            return {
              id: index + 1,
              service: service.name,
              _id: service._id,
              date: service.date,
              type: service.type,
              category: service.category,
              quantity: service.quantity,
              rate: discountedRate,
              total: discountedRate * service.quantity,
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
    if (breakTotalMode && targetTotal) {
      const targetTotalValue = parseFloat(targetTotal);

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
        baseAmount,
      };
    }

    // Normal mode calculation
    // Use manualSubtotal if it exists, otherwise calculate from services
    const subtotal =
      manualSubtotal !== null
        ? parseFloat(manualSubtotal)
        : currentServicesTotal + baseAmount;

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
      baseAmount,
    };
  }, [
    addedServices,
    additionalDiscount,
    additionalDiscountType,
    billData,
    breakTotalMode,
    targetTotal,
    manualSubtotal, // Add manualSubtotal to dependencies
  ]);
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
        ((service.isExisting &&
        (isChecked ? (service.type === "breakup" ? true : false) : (service.type!=="breakup"?true:false)))||service.category==="Room Rent")
    );
    console.log(existingServices);
    setNewlyAddedServices([]);
    setSelectedServices(existingServices.map((service) => service.id));

    // Update target total based on existing services
  };

  useEffect(() => {
    if (calculateTotals.totalAmount) {
      setTargetTotal(calculateTotals.totalAmount.toString());
    }
  }, [calculateTotals.totalAmount]);
  const handleAddService = (e) => {
    e.preventDefault();

    const totalValue = parseFloat(newService.total);
    const quantityValue = parseFloat(newService.quantity);

    if (breakTotalMode && targetTotal) {
      // Check if adding this service would exceed target total
      const currentBreakupTotal = addedServices
        .filter((ser) => ser.type === "breakup")
        .reduce((sum, service) => sum + service.total, 0);

      if (currentBreakupTotal + totalValue > parseFloat(targetTotal)) {
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
      type: breakTotalMode ? "breakup" : "additional", // Add service type based on mode
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
        category: service.category,
        isExisting: service.isExisting || false,
        type: service.type, // Include the service type
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
        selectedServices.includes(service.id) && (breakTotalMode ? (service.type!=="additional"&&(service.type||service.category==="Room Rent")):true)
    );
console.log(selectedServicesList);
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
        })),
        totalAmount: calculateTotals.totalAmount,
        invoiceNumber: firstBill.invoiceNumber || null,
        subtotal: calculateTotals.subtotal,
        additionalDiscount: discountAmount,
        amountPaid: calculateTotals.totalAmountPaid,
        payments: firstBill.payments || billData.payments || [],
        operationName: billData?.operationName,
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
            <h1 className="text-lg font-bold">
              {isEditing ? "Edit Bill" : "Add Bill"}
            </h1>
          </div>
        </div>
      );
    }
    return null;
  };

  const remainingAmount = useMemo(() => {
    if (!breakTotalMode || !targetTotal) return 0;
    const currentTotal = addedServices
      .filter((ser) => ser.type === "breakup"||ser.category==="Room Rent")
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
          Break Total Mode
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

  // Modify the subtotal input handler
  const handleSubtotalChange = (e) => {
    const value = e.target.value;
    setManualSubtotal(value === "" ? null : parseFloat(value));
    setBillData((prev) => ({
      ...prev,
      subtotal: value,
    }));
  };

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
                  <Badge variant="outline">{patientDetails?.age} yrs</Badge>
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
                  {(billData?.operationName ||
                    initialBillData?.operationName) && (
                    <Badge variant="outline">
                      Operation :{" "}
                      {billData?.operationName ||
                        initialBillData?.operationName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gray-400" />
                <span>
                  {patientDetails?.bookingDate
                    ? format(
                        new Date(patientDetails.bookingDate),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patientDetails?.contactNumber}</span>
              </div>

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
          <div className="sm:hidden space-y-1">
            {addedServices.map((service) => (
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
                        ? format(new Date(service.date), "dd/MM/yyyy  HH:MM:SS")
                        : "-"}
                    </div>
                    <div>Quantity: {service.quantity}</div>
                    <div>Rate: {service.rate.toLocaleString("en-IN")}</div>
                    <div>Total: ₹{service.total.toLocaleString("en-IN")}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="hidden sm:block">
            <ScrollArea className="h-[250px] w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={
                          selectedServices.length === addedServices.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addedServices
                    .filter((service) =>
                      ((breakTotalMode
                        ? service.type === "breakup"
                        : service.type !== "breakup")|| service.category==="Room Rent")
                    )
                    .map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selectedServices.includes(service.id)}
                            onChange={() => handleSelectService(service.id)}
                          />
                        </TableCell>
                        <TableCell>{service.service}</TableCell>
                        <TableCell>
                          {service.date
                            ? format(
                                new Date(service.date),
                                "dd/MM/yyyy hh:mm:ss a"
                              )
                            : "-"}
                        </TableCell>
                        <TableCell>{service.quantity}</TableCell>
                        <TableCell>
                          {service.rate.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          {service.total.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 mr-2"
                            onClick={() => handleEditService(service.id)}
                          >
                            <span className="sr-only">Edit</span>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <span className="sr-only">Remove</span>
                            <Trash2 className="h-4 w-4" />
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
        <CardContent className="p-1">
          <div className="flex flex-col items-end space-y-0.5">
            {/* Subtotal */}
            <div className="flex justify-end w-48 items-center text-sm">
              <span className="text-gray-600 mr-3">Subtotal:</span>
              <div className="flex items-center">
                <span className="mr-1">₹</span>
                <Input
                  value={parseFloat(calculateTotals.subtotal || 0).toFixed(2)}
                  onChange={handleSubtotalChange}
                  className="w-20 h-7 text-right font-medium border-0 p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Discount */}
            <div className="flex justify-end w-48 items-center text-sm">
              <span className="text-gray-600 mr-3">Discount:</span>
              <div className="flex items-center">
                <span className="text-red-600 mr-1">₹</span>
                <Input
                  value={(parseFloat(additionalDiscount) || 0).toFixed(2)}
                  onChange={(e) => setAdditionalDiscount(e.target.value)}
                  className="w-20 h-7 text-right text-red-600 font-medium border-0 p-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
              <span className="font-medium mr-3">Net Total:</span>
              <span className="font-medium">
                ₹
                {calculateTotals.totalAmount?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Amount Paid */}
            <div className="flex justify-end w-48 items-center text-sm">
              <span className="text-gray-600 mr-3">Paid:</span>
              <span className="text-green-600 font-bold">
                ₹
                {calculateTotals.totalAmountPaid?.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* Amount Due */}
            <div className="flex justify-end w-48 items-center text-sm border-t border-gray-200 pt-0.5">
              <span className="text-gray-600 mr-3">Balance:</span>
              <span className="text-red-600 font-bold">
                ₹
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
    </div>
  );
};

export default CreateServiceBill;
