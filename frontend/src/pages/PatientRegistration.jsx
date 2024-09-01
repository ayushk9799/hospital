
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"

export default function Component() {
  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" type="date" />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender">
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" placeholder="123 Main St, Anytown USA" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="(123) 456-7890" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john..example.com" />
              </div>
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input id="emergencyContact" placeholder="Jane Doe, (987) 654-3210" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Medical Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input id="bloodType" placeholder="O-positive" />
              </div>
              <div>
                <Label htmlFor="heightWeight">Height/Weight</Label>
                <div className="flex items-center gap-2">
                  <Input id="height" type="number" placeholder="Height (cm)" />
                  <Input id="weight" type="number" placeholder="Weight (kg)" />
                </div>
              </div>
              <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" placeholder="Pollen, Penicillin, Latex" />
              </div>
              <div>
                <Label htmlFor="conditions">Chronic Conditions</Label>
                <Textarea id="conditions" placeholder="Diabetes, Hypertension, Asthma" />
              </div>
              <div>
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea id="medications" placeholder="Metformin, Lisinopril, Albuterol" />
              </div>
              <div>
                <Label htmlFor="vaccinations">Vaccination History</Label>
                <Textarea id="vaccinations" placeholder="COVID-19, Influenza, Pneumococcal" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Insurance Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input id="insuranceProvider" placeholder="Blue Cross Blue Shield" />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input id="policyNumber" placeholder="ABC12345" />
              </div>
              <div>
                <Label htmlFor="coverageDetails">Coverage Details</Label>
                <Textarea id="coverageDetails" placeholder="80/20 plan, $500 deductible, $25 copay" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Medical History</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pastSurgeries">Past Surgeries</Label>
                <Textarea id="pastSurgeries" placeholder="Appendectomy, Knee Replacement" />
              </div>
              <div>
                <Label htmlFor="pastHospitalizations">Previous Hospitalizations</Label>
                <Textarea id="pastHospitalizations" placeholder="Pneumonia, Broken Arm" />
              </div>
              <div>
                <Label htmlFor="familyHistory">Family Medical History</Label>
                <Textarea id="familyHistory" placeholder="Diabetes, Heart Disease, Cancer" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Visit Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="admissionDate">Admission Date</Label>
                <Input id="admissionDate" type="date" />
              </div>
              <div>
                <Label htmlFor="reasonForVisit">Reason for Visit</Label>
                <Input id="reasonForVisit" placeholder="Chest pain, Fever, Broken Arm" />
              </div>
              <div>
                <Label htmlFor="assignedDoctors">Assigned Doctor(s)</Label>
                <Input id="assignedDoctors" placeholder="Dr. Jane Smith, Dr. John Doe" />
              </div>
              <div>
                <Label htmlFor="roomBed">Room/Bed Number</Label>
                <Input id="roomBed" placeholder="Room 123, Bed 4" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Vital Signs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input id="bloodPressure" placeholder="120/80 mmHg" />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate</Label>
                <Input id="heartRate" placeholder="72 bpm" />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature</Label>
                <Input id="temperature" placeholder="98.6 °F" />
              </div>
              <div>
                <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                <Input id="respiratoryRate" placeholder="16 breaths/min" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Lab Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testResults">Recent Test Results</Label>
                <Textarea id="testResults" placeholder="CBC, Metabolic Panel, Lipid Panel" />
              </div>
              <div>
                <Label htmlFor="imagingStudies">Imaging Studies</Label>
                <Textarea id="imagingStudies" placeholder="Chest X-ray, MRI of Knee" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Treatment Plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="diagnosis">Current Diagnosis</Label>
                <Input id="diagnosis" placeholder="Pneumonia, Osteoarthritis" />
              </div>
              <div>
                <Label htmlFor="medications">Prescribed Medications</Label>
                <Textarea id="medications" placeholder="Amoxicillin, Ibuprofen, Metformin" />
              </div>
              <div>
                <Label htmlFor="therapy">Therapy Schedules</Label>
                <Textarea id="therapy" placeholder="Physical Therapy, Occupational Therapy" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Billing Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input id="paymentMethod" placeholder="Visa, Mastercard, Cash" />
              </div>
              <div>
                <Label htmlFor="billingHistory">Billing History</Label>
                <Textarea id="billingHistory" placeholder="Deductible, Copays, Outstanding Balance" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="upcomingAppointments">Upcoming Appointments</Label>
                <Textarea id="upcomingAppointments" placeholder="Follow-up, Physical Therapy" />
              </div>
              <div>
                <Label htmlFor="pastAppointments">Past Appointment History</Label>
                <Textarea id="pastAppointments" placeholder="Checkup, Procedure, Consultation" />
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctorNotes">Doctor's Notes</Label>
                <Textarea id="doctorNotes" placeholder="Detailed notes about the patient's condition and treatment" />
              </div>
              <div>
                <Label htmlFor="nurseNotes">Nurse's Notes</Label>
                <Textarea id="nurseNotes" placeholder="Detailed notes about the patient's care and observations" />
              </div>
              <div>
                <Label htmlFor="specialInstructions">Special Care Instructions</Label>
                <Textarea id="specialInstructions" placeholder="Specific instructions for the patient's care" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}