export const initialFormData = {
  name: "",
  registrationNumber: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  contactNumber: "",
  email: "",
  address: "",
  bloodType: "",
  patientType: "IPD",
  admission: {
    department: "",
    assignedDoctor: "",
    assignedRoom: "",
    assignedBed: "",
    diagnosis: "",
    vitals: {
      admission: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
      discharge: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        oxygenSaturation: "",
        respiratoryRate: "",
      },
    },
    bookingDate: new Date()
      .toLocaleDateString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-"),
    timeSlot: {
      start: "",
      end: "",
    },
    insuranceDetails: {
      provider: "",
      policyNumber: "",
    },
  },
};

export const validateForm = (formData, setErrors) => {
  const newErrors = {};
  if (!formData.name.trim()) newErrors.name = "Full name is required";
  if (!formData.dateOfBirth && !formData.age)
    newErrors.age = "Date of birth or age is required";
  if (!formData.gender) newErrors.gender = "Gender is required";
  if (!formData.contactNumber)
    newErrors.contactNumber = "Phone number is required";
  if (!formData.admission.assignedRoom)
    newErrors["admission.assignedRoom"] = "Room is required";
  if (!formData.admission.assignedBed)
    newErrors["admission.assignedBed"] = "Bed is required";
  if (!formData.admission.bookingDate)
    newErrors["admission.bookingDate"] = "Booking date is required";
  if (!formData.admission.assignedDoctor)
    newErrors["admission.assignedDoctor"] = "Doctor is required";
  if (!formData.admission.department)
    newErrors["admission.department"] = "Department is required";

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

export const formatSubmissionData = (formData) => ({
  ...formData,
  age: parseInt(formData.age, 10),
  patientType: "IPD",
  admission: {
    ...formData.admission,
    bookingDate: formData.admission.bookingDate,
    vitals: {
      admission: Object.fromEntries(
        Object.entries(formData.admission.vitals.admission || {}).map(
          ([key, value]) =>
            key === "bloodPressure"
              ? [key, value]
              : [key, parseFloat(value) || null]
        )
      ),
      discharge: Object.fromEntries(
        Object.entries(formData.admission.vitals.discharge || {}).map(
          ([key, value]) =>
            key === "bloodPressure"
              ? [key, value]
              : [key, parseFloat(value) || null]
        )
      ),
    },
  },
});
