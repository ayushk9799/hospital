import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import ConsentDynamicForm from "./ConsentDynamicForm";
import { Printer } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";

const consentFormTemplateStringDefault = `(patient, hospitalInfo, ref) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return \`\${date.getDate().toString().padStart(2, '0')}-\${months[date.getMonth()]}-\${date.getFullYear()}\`;
  };


  return React.createElement("div", { ref: ref, className: "print-content", style : {marginTop : "20px"} },
    React.createElement("div",null,
      React.createElement(HospitalHeader, { hospitalInfo: hospitalInfo })
    ),
    React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: "12px", marginTop : "10px" } },
      React.createElement("span", { style: { textDecoration: "underline", textDecorationThickness: "2px", textUnderlineOffset: "4px", fontSize: "20px" } }, "Admission Form")
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr" } },
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Patient Name:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.name || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Guardian Name:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.guardianName || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "UHID Number:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.registrationNumber || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "IPD Number:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.ipdNumber || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Room No:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.assignedRoom?.roomNumber || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Age:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.age ? \`\${patient?.patient?.age} Years\` : "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Gender:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.gender || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Address:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.address || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Mobile No:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.patient?.contactNumber || "")
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Admission Date:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } },
          \`\${formatDate(patient?.bookingDate)} \${patient?.bookingTime || ""}\`
        )
      ),
      React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)" } },
        React.createElement("span", null, "Consultant:"),
        React.createElement("span", { style: { fontWeight: "600", textTransform: "capitalize", gridColumn: "span 2" } }, patient?.doctor?.name || "")
      )
    ),
    React.createElement("div", { style: { margin: "8px 0", backgroundColor: "black", height: "1px" } }),
    React.createElement("div", { style: { textDecoration: "underline", fontWeight: "600", margin: "0 16px", textUnderlineOffset: "2px" } }, "Person to notify in case of Emergency"),
    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "16px", margin: "0 16px" } },
      React.createElement("div", { style: { textTransform: "capitalize" } }, \`Name: \${patient?.guardianName || ""}\`),
      React.createElement("div", null, \`Mobile No: \${patient?.patient?.contactNumber || ""}\`),
      React.createElement("div", { style: { textTransform: "capitalize" } }, \`Relation with Patient : \${patient?.relation || ""}\`)
    ),
    React.createElement("div", { style: { display : "flex", flexDirection : "column", gap : "12px", marginTop: "16px", textAlign: "justify", padding: "0 16px" } },
      React.createElement("p", { style: { fontSize: "18px", fontWeight: "600", marginBottom: "8px" } }, "सामान्य सहमति"),
      React.createElement("p", null,
        "मैं, __________________________________________ (रोगी/रिश्तेदार) सचेत मन की स्थिति में अस्पताल के सलाहकारों और पैरामेडिकल कर्मियों को चिकित्सा परीक्षण, पैथोलॉजिकल और रेडियोलॉजिकल और मेडिकल/सर्जिकल उपचार या किसी भी प्रकार की प्रक्रिया करने के लिए सहमति देता हूं और अधिकृत करता हूं।"
      ),
      React.createElement("p", null,
        "ओपीडी/आईपीडी में रोगी देखभाल के दौरान प्रशासनिक/बीमा उद्देश्य के लिए कागजात के दस्तावेजीकरण और नैदानिक अनुसंधान और गोपनीयता के लिए जानकारी के प्रकटीकरण के साथ सलाह दी जाती है। हम पूरी तरह संतुष्ट हैं और अपनी इच्छा से इलाज/सर्जरी कराना चाहते हैं।"
      ),
      React.createElement("p", null,
        "हम अस्पताल के बिल के समय पर भुगतान के लिए जिम्मेदार होंगे। उपचार/सर्जरी के दौरान और उसके दौरान किसी भी जटिलता के लिए मैं स्वयं जिम्मेदार रहूंगा। सर्जरी/उपचार से होने वाली किसी भी जटिलता और खतरे के लिए अस्पताल, अस्पताल कर्मचारी, डॉक्टर जिम्मेदार नहीं होंगे।"
      ),
      React.createElement("p", null,
        "अस्पताल और अस्पताल के कर्मचारी किसी भी चोरी हुए सामान के लिए जिम्मेदार नहीं होंगे, मैं अपने सामान की सुरक्षा के लिए जिम्मेदार हूं।"
      ),
      React.createElement("p", null,
        "मैंने ऊपर लिखी सभी बातें पढ़ी हैं और मुझे समझाया भी गया है।"
      ),
      React.createElement("p", null,
        "ऊपर दी गई सभी जानकारियों को समझने के बाद मैं अपनी अनुमति देता हूं।"
      )
    ),
    React.createElement("div", { style: { marginTop: "50px", display: "flex", justifyContent: "space-between", padding: "0 16px" } },
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("p", { style: { borderTop: "1px solid black" } }, "Signature of Patient"),
        React.createElement("p", { style: { textTransform: "uppercase", fontSize: "12px" } }, \`(\${patient?.patient?.name || ""})\`)
      ),
      React.createElement("div", { style: { textAlign: "center" } },
        React.createElement("p", { style: { borderTop: "1px solid black" } }, "Signature of Guardian"),
        React.createElement("p", { style: { fontSize: "12px", textTransform: "uppercase" } }, patient?.guardianName ? \`(\${patient?.guardianName})\` : "")
      )
    )
  );
}`;

const ConsentFormPrint = ({ patient }) => {
  const consentFormTemplates = useSelector(
    (state) => state.templates.consentFormTemplateArray

  );
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .print-only {
          display: block !important;
        }
        .no-print {
          display: none !important;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
          padding: 20px;
        }
      }
    `,
  });

  const handleTemplatePrint = (template) => {
    setSelectedTemplate(template);
    setTimeout(handlePrint, 100);
  };

  if (consentFormTemplates?.length <= 1) {
    return (
      <>
        <DropdownMenuItem onClick={() => handleTemplatePrint(consentFormTemplates[0])}>
          Consent Form
        </DropdownMenuItem>

        <div style={{ display: "none" }}>
          <ConsentDynamicForm
            ref={componentRef}
            patient={patient}
            templateString={selectedTemplate?.value || consentFormTemplateStringDefault}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="cursor-pointer">
          <Printer className="h-4 w-4 mr-2" />
          Consent Form
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent sideOffset={2} alignOffset={-5}>
          {consentFormTemplates?.map((template) => (
            <DropdownMenuItem
              key={template.name}
              onSelect={(e) => {
                e.preventDefault();
                handleTemplatePrint(template);
              }}
            >
              {template.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <div style={{ display: "none" }}>
        <ConsentDynamicForm
          ref={componentRef}
          patient={patient}
          templateString={selectedTemplate?.value || consentFormTemplates?.[0]?.value}
        />
      </div>
    </>
  );
};

export default ConsentFormPrint;
