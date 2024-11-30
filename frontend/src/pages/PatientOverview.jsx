import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import PatientDetails from "./PatientDetails";
import { Card } from "../components/ui/card";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatientDetails } from "../redux/slices/patientSlice";
import { useToast } from "../hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import CreateServiceBill from "./CreateServiceBill";
import PaymentDialog from "../components/custom/billing/PaymentDialog";
import { Button } from "../components/ui/button";

export default function PatientOverview() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("visits");
  const { patientDetailsStatus } = useSelector((state) => state.patients);
  const [patientDetails, setPatientDetails] = useState(null);
  const [billData, setBillData] = useState(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  // Fetch patient details when component mounts
  useEffect(() => {
    dispatch(fetchPatientDetails(patientId))
      .unwrap()
      .then((data) => {
        setPatientDetails(data);
        let allvisits = [...data.visits, ...data.admissionDetails];
        allvisits = allvisits.sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        if (allvisits.length > 0) {
          const selectedOne =
            allvisits.find((visit) => visit._id === location?.state?.ID) ||
            allvisits[0];

          if (selectedOne?.bills?.services?.length > 0) {
            setBillData({
              billId: selectedOne.bills.services[0]._id,
              billData: selectedOne.bills,
            });
          }
        }
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Error fetching patient details",
          variant: "destructive",
        });
      });
  }, [dispatch, patientId]);

  // Handle tab changes
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "payments" && billData?.billData) {
      setIsPaymentDialogOpen(true);
    }
  };

  // Set initial active tab if coming from another page
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  if (patientDetailsStatus === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Card className="min-h-screen border-none">
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <div className="border-b bg-white sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-14">
              <button
                className="flex items-center gap-2 hover:text-primary transition-colors mr-8"
                onClick={() => navigate("/patients")}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back</span>
              </button>

              <TabsList className="h-9 bg-muted/50">
                <TabsTrigger
                  value="visits"
                  className="text-sm px-4 data-[state=active]:bg-background"
                >
                  Visit History
                </TabsTrigger>
                <TabsTrigger
                  value="bills"
                  className="text-sm px-4 data-[state=active]:bg-background"
                >
                  Bills
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="text-sm px-4 data-[state=active]:bg-background"
                >
                  Payments
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <TabsContent value="visits" className="m-0">
            <PatientDetails patientData={patientDetails} />
          </TabsContent>

          <TabsContent value="bills" className="m-0">
            {billData ? (
              <CreateServiceBill
                initialBillId={billData.billId}
                initialBillData={billData.billData}
                patientData={patientDetails}
                isEmbedded={true}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bills found for this patient
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="m-0">
            {billData?.billData ? (
              <>
                <div className="text-center py-8 text-gray-500">
                  Click here to manage payments
                  <Button
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      setIsPaymentDialogOpen(true);
                    }}
                  >
                    Open Payment Dialog
                  </Button>
                </div>
                <PaymentDialog
                  isOpen={isPaymentDialogOpen}
                  setIsOpen={setIsPaymentDialogOpen}
                  billData={billData?.billData?.services?.[0]}
                />
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bills found for this patient
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
