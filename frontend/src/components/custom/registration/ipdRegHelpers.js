
export const validateForm = (formData, setErrors) => {
  const newErrors = {};
  if (!formData.name.trim()) newErrors.name = "Full name is required";
  if (!formData.dateOfBirth && !formData.age)
    newErrors.age = "Date of birth or age is required";
  if (!formData.gender) newErrors.gender = "Gender is required";
  if (!formData.contactNumber)
    newErrors.contactNumber = "Phone number is required";
  if (!formData.admission.bookingDate)
    newErrors["admission.bookingDate"] = "Booking date is required";
  if (!formData.admission.assignedDoctor)
    newErrors["admission.assignedDoctor"] = "Doctor is required";
  if (!formData.admission.department)
    newErrors["admission.department"] = "Department is required";
  if(formData.admission.assignedRoom && !formData.admission.assignedBed)
     newErrors["admission.assignedBed"]="Bed is required";
  // if(!formData.admission.operationName)
  // {
  //   newErrors["admission.operationName"]="Operation name is required";
  // }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};

export const formatSubmissionData = (formData) => ({
  ...formData,
  age: Number(formData.age),
  patientType: "IPD",
  lastVisit:formData.admission.bookingDate,
  lastVisitType:"IPD",
  admission: {
    ...formData.admission,
    assignedRoom: formData.admission.assignedRoom || null,
    assignedBed: formData.admission.assignedBed || null,
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
