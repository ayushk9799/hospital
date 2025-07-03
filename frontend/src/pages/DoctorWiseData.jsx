import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllDoctorData } from "../redux/slices/doctorDataSlice";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function DoctorWiseData() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allDoctorData, status, error } = useSelector(
    (state) => state.doctorData
  );

  useEffect(() => {
    dispatch(fetchAllDoctorData());
  }, [dispatch]);

  const handleBack = () => {
    navigate("/settings");
  };

  const handleCardClick = (doctorId) => {
    navigate(`/settings/doctor-wise-data/${doctorId}`);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl sm:text-2xl font-bold">Doctor Wise Data</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allDoctorData && allDoctorData.length > 0 ? (
          allDoctorData.map((data) => (
            <Card
              key={data.doctor._id}
              onClick={() => handleCardClick(data.doctor._id)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle>{data.doctor.name}</CardTitle>
                <CardDescription>
                  Click to view and edit details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {data.medicines?.length || 0}
                  </span>{" "}
                  Medicines
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {data.diagnosis?.length || 0}
                  </span>{" "}
                  Diagnoses
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">
                    {data.comorbidities?.length || 0}
                  </span>{" "}
                  Comorbidities
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No doctor-specific data has been configured yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
