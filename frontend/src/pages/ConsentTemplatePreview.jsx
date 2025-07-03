import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { useDispatch } from "react-redux";
import { Input } from "../components/ui/input";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { cn } from "../lib/utils";
import { consentFormTemplateStringDefault } from "../components/custom/print/ConsentFormPrint";
// import { consentFormTemplateStringExperimentation , consentFormTemplateStringAnesthesia} from "../templatesExperiments/consentFromExperimentation";
import ConsentDynamicForm from "../components/custom/print/ConsentDynamicForm";

// const consentFormTemplateStringDefault = `(patient, hospitalInfo, ref) => {
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return \`\${date.getDate().toString().padStart(2, '0')}-\${months[date.getMonth()]}-\${date.getFullYear()}\`;
//   };

//   return React.createElement("div", { ref: ref, className: "print-content", style : {marginTop : "20px"} },
//     React.createElement("div",null,
//       React.createElement(HospitalHeader, { hospitalInfo: hospitalInfo })
//     ),
//     React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: "12px", marginTop : "10px" } },
//       React.createElement("span", { style: { textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "4px", fontSize: "20px" } }, "Admission Form")
//     ),
//     React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr" } },
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Patient Name:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.name || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Guardian Name:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.guardianName || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "UHID Number:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.registrationNumber || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "IPD Number:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.ipdNumber || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Room No:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.assignedRoom?.roomNumber || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Age:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.age ? \`\${patient?.patient?.age} Years\` : "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Gender:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.gender || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Address:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.address || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Mobile No:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.contactNumber || "")
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Admission Date:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } },
//           \`\${formatDate(patient?.bookingDate)} \${patient?.bookingTime || ""}\`
//         )
//       ),
//       React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
//         React.createElement("span", null, "Consultant:"),
//         React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.doctor?.name || "")
//       )
//     ),
//     React.createElement("div", { style: { margin: "8px 0", backgroundColor: "black", height: "1px" } }),
//     React.createElement("div", { style: { textDecoration: "underline", fontWeight: "600", margin: "0 16px", textUnderlineOffset: "2px" } }, "Person to notify in case of Emergency"),
//     React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "16px", margin: "0 16px" } },
//       React.createElement("div", { style: { textTransform: "capitalize" } }, \`Name: \${patient?.guardianName || ""}\`),
//       React.createElement("div", null, \`Mobile No: \${patient?.patient?.contactNumber || ""}\`),
//       React.createElement("div", { style: { textTransform: "capitalize" } }, \`Relation with Patient : \${patient?.relation || ""}\`)
//     ),
//     React.createElement("div", { style: { display : "flex", flexDirection : "column", gap : "12px", marginTop: "16px", textAlign: "justify", padding: "0 16px" } },
//       React.createElement("p", { style: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" } }, "सामान्य सहमति"),
//       React.createElement("p", null,
//         "मैं, __________________________________________ (रोगी/रिश्तेदार) सचेत मन की स्थिति में अस्पताल के सलाहकारों और पैरामेडिकल कर्मियों को चिकित्सा परीक्षण, पैथोलॉजिकल और रेडियोलॉजिकल और मेडिकल/सर्जिकल उपचार या किसी भी प्रकार की प्रक्रिया करने के लिए सहमति देता हूं और अधिकृत करता हूं।"
//       ),
//       React.createElement("p", null,
//         "ओपीडी/आईपीडी में रोगी देखभाल के दौरान प्रशासनिक/बीमा उद्देश्य के लिए कागजात के दस्तावेजीकरण और नैदानिक अनुसंधान और गोपनीयता के लिए जानकारी के प्रकटीकरण के साथ सलाह दी जाती है। हम पूरी तरह संतुष्ट हैं और अपनी इच्छा से इलाज/सर्जरी कराना चाहते हैं।"
//       ),
//       React.createElement("p", null,
//         "हम अस्पताल के बिल के समय पर भुगतान के लिए जिम्मेदार होंगे। उपचार/सर्जरी के दौरान और उसके दौरान किसी भी जटिलता के लिए मैं स्वयं जिम्मेदार रहूंगा। सर्जरी/उपचार से होने वाली किसी भी जटिलता और खतरे के लिए अस्पताल, अस्पताल कर्मचारी, डॉक्टर जिम्मेदार नहीं होंगे।"
//       ),
//       React.createElement("p", null,
//         "अस्पताल और अस्पताल के कर्मचारी किसी भी चोरी हुए सामान के लिए जिम्मेदार नहीं होंगे, मैं अपने सामान की सुरक्षा के लिए जिम्मेदार हूं।"
//       ),
//       React.createElement("p", null,
//         "मैंने ऊपर लिखी सभी बातें पढ़ी हैं और मुझे समझाया भी गया है।"
//       ),
//       React.createElement("p", null,
//         "ऊपर दी गई सभी जानकारियों को समझने के बाद मैं अपनी अनुमति देता हूं।"
//       )
//     ),
//     React.createElement("div", { style: { marginTop: "50px", display: "flex", justifyContent: "space-between", padding: "0 16px" } },
//       React.createElement("div", { style: { textAlign: "center" } },
//         React.createElement("p", { style: { borderTop: "1px solid black" } }, "Signature of Patient"),
//         React.createElement("p", { style: { textTransform: "uppercase", fontSize: "12px" } }, \`(\${patient?.patient?.name || ""})\`)
//       ),
//       React.createElement("div", { style: { textAlign: "center" } },
//         React.createElement("p", { style: { borderTop: "1px solid black" } }, "Signature of Guardian"),
//         React.createElement("p", { style: { fontSize: "12px", textTransform: "uppercase" } }, patient?.guardianName ? \`(\${patient?.guardianName})\` : "")
//       )
//     )
//   );
// }`;

export default function ConsentTemplatePreview() {
  const hospital = useSelector((state) => state.hospital.hospitalInfo);
  const consentFormTemplates = useSelector(
    (state) => state.templates.consentFormTemplateArray
  );
  const dispatch = useDispatch();

  // Sample data for preview
  const patient = {
    patient: {
      name: "John Doe",
      age: "45-4",
      gender: "Male",
      address: "123 Main St",
      contactNumber: "1234567890",
    },
    guardianName: "Jane Doe",
    registrationNumber: "REG001",
    ipdNumber: "IPD001",
    assignedRoom: { roomNumber: "101" },
    bookingDate: new Date().toISOString(),
    bookingTime: "10:00 AM",
    doctor: { name: "Dr. Smith" },
    relation: "Spouse",
  };

  // Define available templates
  const [availableTemplates, setAvailableTemplates] = useState([
    { name: "System Default", value: consentFormTemplateStringDefault },
    // {
    //   name: "Experimentation",
    //   value: consentFormTemplateStringExperimentation,
    // },
    ...(consentFormTemplates || []),
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(
    availableTemplates[0] || { name: "", value: "" }
  );

  const [editingTemplateId, setEditingTemplateId] = useState(null);

  const handleNameEdit = (template, newName) => {
    const templateIndex = availableTemplates.findIndex((t) => t === template);
    if (templateIndex === -1) return;

    const updatedTemplates = availableTemplates.map((t, index) =>
      index === templateIndex ? { ...t, name: newName } : t
    );

    setAvailableTemplates(updatedTemplates);

    if (selectedTemplate === template) {
      setSelectedTemplate(updatedTemplates[templateIndex]);
    }
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      dispatch(
        updateTemplate({
          consentFormTemplate: {
            name: selectedTemplate.name,
            value: selectedTemplate.value,
          },
        })
      );
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">
            Consent Form Template Preview
          </h1>
          {/* <Button onClick={handleSaveTemplate}>Save Template</Button> */}
        </div>

        <div className="flex flex-wrap gap-3">
          {availableTemplates.map((template, index) => (
            <div key={index} className="relative">
              {editingTemplateId === index ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={template.name}
                    onChange={(e) => handleNameEdit(template, e.target.value)}
                    onBlur={() => setEditingTemplateId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setEditingTemplateId(null);
                      }
                    }}
                    className="w-[150px]"
                    autoFocus
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  className={cn(
                    "relative min-w-[150px]",
                    selectedTemplate === template &&
                      "border-2 border-primary bg-primary/10"
                  )}
                  onClick={() => setSelectedTemplate(template)}
                  onDoubleClick={() => setEditingTemplateId(index)}
                >
                  {template.name || "Unnamed Template"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center bg-gray-100 p-4 min-h-[calc(100vh-200px)] overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            minHeight: "297mm",
            margin: "0 auto",
            breakAfter: "always",
            breakInside: "avoid",
          }}
        >
          <style>
            {`
              @media print {
                .print-content {
                  page-break-inside: avoid;
                  page-break-after: always;
                }
                
                h1, h2, h3, table, tr, img {
                  page-break-inside: avoid;
                }
                
                .page-break-before {
                  page-break-before: always;
                }
                
                .page-header {
                  position: running(header);
                }
                
                @page {
                  size: A4;
                  margin: 8mm;
                  @top-center {
                    content: element(header);
                  }
                }
              }
            `}
          </style>
          <ConsentDynamicForm
            patient={patient}
            templateString={selectedTemplate?.value}
          />
        </div>
      </div>
    </div>
  );
}
