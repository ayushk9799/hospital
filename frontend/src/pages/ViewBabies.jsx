import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Calendar,
  Clock,
  Scale,
  Star,
  Printer,
  Heart,
  NotebookTabs,
  Pen,
  FilePenLine
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getBabiesByAdmission } from "../redux/slices/babySlice";
import { format } from "date-fns";
import BirthCertificate from "../components/BirthCertificate";
import BabyRegDialog from "../components/custom/baby/BabyRegDialog";
import EditBabyDetailsDlg from "../components/custom/baby/EditBabyDetailsDlg";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

export default function ViewBabies() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { ipdAdmissionId } = useParams();
  const { currentPatientBabies, fetchCurrentPatientBabiesStatus: status } = useSelector((state) => state.babies);
  const hospitalInfo = useSelector((state) => state.hospital.hospitalInfo);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showBabyReg, setShowBabyReg] = useState(false);
  const location = useLocation();
  const { motherData } = location.state || {};
  const [showEditBaby, setShowEditBaby] = useState(false);
  const [selectedBabyForEdit, setSelectedBabyForEdit] = useState(null);
 const [motherDetails, setMotherDetails] = useState(null);
  useEffect(() => {
    const fetchBabies = async () => {
      const babies = await dispatch(getBabiesByAdmission(ipdAdmissionId)).unwrap();
      setMotherDetails(babies[0]?.ipdAdmission);
    }
    fetchBabies();
  }, [dispatch, ipdAdmissionId]);

  const handleViewDetails = (babyId) => {
    navigate(`/babies/${babyId}`);
  };

  const handlePrintCertificate = (baby) => {
    setSelectedBaby(baby);
    setShowCertificate(true);
  };

  const handleEditBaby = (baby) => {
    setSelectedBabyForEdit(baby);
    setShowEditBaby(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="h-full flex flex-col gap-4">
       <div className="flex">
       <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-pink-100 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
              <Baby className="h-8 w-8 text-pink-500" />
              <CardTitle className="text-2xl font-bold text-gray-700">
                Baby Records
              </CardTitle>
            </div>
       </div>

        <Card className="flex-1 border-2 border-pink-200 shadow-lg flex flex-col overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-blue-200 border-b-2 border-pink-200">
            
             {/* Mother Info Card */}
          <div className="flex justify-between gap-4 items-center ">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-pink-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 ">
                        Mother's Name
                      </p>
                      <p className="text-lg font-semibold text-gray-800 uppercase">
                        {motherData?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-blue-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">UHID</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {motherData?.registrationNumber}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowBabyReg(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white inline-flex items-center gap-1"
                    >
                      <Baby className="h-4 w-4" />
                      Register Birth
                    </Button>
                  </div>
                </div>
          </CardHeader>

         

          <ScrollArea className="flex-1">
            <CardContent className="p-6">
              {status === "loading" ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : currentPatientBabies.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No baby records found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentPatientBabies.map((baby) => (
                    <Card
                      key={baby._id}
                      className="border-2 border-pink-100 hover:border-pink-200 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Baby className="h-5 w-5 text-pink-500" />
                              <h3 className="font-semibold text-lg">
                                {baby.gender}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                className="border-pink-200 hover:border-pink-300 hover:bg-pink-50"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditBaby(baby)}
                              >
                                <FilePenLine className="h-4 w-4 text-pink-300 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintCertificate(baby)}
                                className="border-pink-200 hover:border-pink-300 hover:bg-pink-50"
                              >
                                <Printer className="h-4 w-4 mr-2 text-pink-500" />
                                Print Certificate
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(baby._id)}
                                className="border-pink-200 hover:border-pink-300 hover:bg-pink-50"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <NotebookTabs className="h-4 w-4 text-purple-500" />
                              <div>
                                <p className="text-gray-500">Certificate Number</p>
                                <p className="font-medium">
                                  {baby.birthCounter}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-gray-500">Birth Date</p>
                                <p className="font-medium">
                                  {format(
                                    new Date(baby.dateOfBirth),
                                    "dd/MM/yyyy"
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-green-500" />
                              <div>
                                <p className="text-gray-500">Birth Time</p>
                                <p className="font-medium">
                                  {baby.timeOfBirth}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Scale className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="text-gray-500">Weight</p>
                                <p className="font-medium">{baby.weight}g</p>
                              </div>
                            </div>

                            
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      {/* Birth Certificate Modal */}
      {selectedBaby && (
        <BirthCertificate
          open={showCertificate}
          onOpenChange={setShowCertificate}
          hospitalInfo={hospitalInfo}
          motherData={selectedBaby.mother}
          babyData={selectedBaby}
          certificateNumber={selectedBaby.birthCounter}
        />
      )}

    {showBabyReg && (
      <BabyRegDialog 
        open={showBabyReg}
        onOpenChange={setShowBabyReg}
        motherData={{...motherData, bookingDate: motherDetails?.bookingDate? motherDetails?.bookingDate : motherData?.bookingDate, bookingTime: motherDetails?.bookingTime? motherDetails?.bookingTime : motherData?.bookingTime}}
        admissionId={ipdAdmissionId}
      />
    )}

      {selectedBabyForEdit && (
        <EditBabyDetailsDlg
          open={showEditBaby}
          onOpenChange={setShowEditBaby}
          babyData={selectedBabyForEdit}
          motherData={motherData}
        />
      )}
    </div>
  );
}
