import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Calendar,
  Clock,
  Scale,
  Star,
  Heart,
  User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

export default function BabyDetails() {
  const navigate = useNavigate();
  const { babyId } = useParams();
  const baby = useSelector((state) =>
    state.babies.currentPatientBabies.find((b) => b._id === babyId)
  );

  if (!baby) {
    return (
      <div className="h-[calc(100vh-2rem)] p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">Baby record not found</div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mt-4"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4 bg-gradient-to-b from-pink-50 to-blue-50">
      <div className="h-full flex flex-col gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 hover:bg-pink-100 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="flex-1 border-2 border-pink-200 shadow-lg flex flex-col overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-200 to-blue-200 border-b-2 border-pink-200">
            <div className="flex items-center gap-3">
              <Baby className="h-8 w-8 text-pink-500" />
              <CardTitle className="text-2xl font-bold text-gray-700">
                Baby Details
              </CardTitle>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1">
            <CardContent className="p-6 space-y-6">
              {/* Mother Info */}
              <Card className="border-2 border-pink-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <h3 className="font-semibold text-lg">
                      Mother's Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium uppercase">{baby.mother.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">UHID</p>
                      <p className="font-medium">
                        {baby.mother.registrationNumber}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Baby Info */}
              <Card className="border-2 border-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">Baby Information</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-medium">{baby.gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Weight</p>
                      <p className="font-medium">{baby.weight}g</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birth Date</p>
                      <p className="font-medium">
                        {format(new Date(baby.dateOfBirth), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Birth Time</p>
                      <p className="font-medium">{baby.timeOfBirth}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Admission Date</p>
                      <p className="font-medium">
                        {format(new Date(baby.admissionDate), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Admission Time</p>
                      <p className="font-medium">{baby.timeOfAdmission}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* APGAR Scores and Handover Information in same line */}
              <div className="grid grid-cols-2 gap-4">
                {/* APGAR Scores */}
                <Card className="border-2 border-yellow-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold text-lg">APGAR Scores</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-500">1 Minute</p>
                        <p className="font-medium">{baby.apgarScore.oneMinute}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">5 Minutes</p>
                        <p className="font-medium">
                          {baby.apgarScore.fiveMinutes}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">10 Minutes</p>
                        <p className="font-medium">
                          {baby.apgarScore.tenMinutes}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Baby Handover Information */}
                <Card className="border-2 border-green-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold text-lg">Handover Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500">Handed Over To</p>
                        <p className="font-medium">{baby.babyHandOverName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Relation</p>
                        <p className="font-medium">{baby.babyHandOverRelation || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
