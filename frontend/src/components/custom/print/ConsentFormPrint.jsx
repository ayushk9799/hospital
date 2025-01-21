import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Button } from "../../ui/button";
import { Printer } from "lucide-react";
import { createDynamicComponentFromString } from "../../../utils/print/HospitalHeader";
import { headerTemplateString } from "../../../templates/headertemplate";
import { format } from "date-fns";
import { Separator } from "../../ui/separator";

const ConsentFormPrint = ({ patient }) => {

  const { hospitalInfo } = useSelector((state) => state.hospital);
  const headerTemplateStrings = useSelector(
    (state) => state.templates.headerTemplate
  );
  const componentRef = useRef();

  const HospitalHeader = createDynamicComponentFromString(
    headerTemplateStrings || headerTemplateString
  );

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

  return (
    <>
      <Button variant="ghost" className="font-normal text-start p-0 w-full" onClick={handlePrint}>
        <div className=" w-full pl-2">Consent Form</div>
      </Button>

      <div style={{ display: "none" }}>
        <div ref={componentRef} className="print-content">
          <div className="hidden print:block mb-2">
            <HospitalHeader hospitalInfo={hospitalInfo} />
          </div>
          <div className="flex justify-center mb-2">
            <span className="underline decoration-2 underline-offset-4 text-xl">Admission Form</span>
          </div>
          <div className="grid grid-cols-2">
            <div className="grid grid-cols-3">
              <span>Patient Name:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.name || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Guardian Name:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.guardianName || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>UHID Number:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.registrationNumber || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>IPD Number:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.ipdNumber || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Room No:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.assignedRoom?.roomNumber || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Age:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.age ? `${patient?.patient?.age} Years` : 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Gender:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.gender || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Address:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.address || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Mobile No:</span>
              <span className="font-semibold capitalize col-span-2">{patient?.patient?.contactNumber || 'N/A'}</span>
            </div>
            <div className="grid grid-cols-3">
              <span>Admission Date:</span>
              <span className="font-semibold capitalize col-span-2">
                {patient?.createdAt ? format(new Date(patient.createdAt), 'dd-MMM-yyyy h:mm a') : 'N/A'}
              </span>
            </div>
            <div className="grid grid-cols-3">
              <span>Consultant:</span>
              <span className="font-semibold capitalize col-span-2">DR. {patient?.doctor?.name || 'N/A'}</span>
            </div>
          </div>
          <Separator className="my-2 bg-black" />
          <div className="underline font-semibold mx-4 underline-offset-2">Person to notify in case of Emergency</div>
          <div className="flex justify-between mb-4 mx-4">
            <div>Name: {patient?.patient?.guardianName || 'N/A'}</div> 
            <div>Mobile No: {patient?.patient?.contactNumber || 'N/A'}</div>
            <div>Relation with Patient : {patient?.patient?.relation || 'N/A'}</div>
          </div>
          <div className="space-y-4 text-justify px-4">
            <p className="text-lg font-semibold mb-2">सामान्य सहमति</p>
            <p>
              मैं, __________________________________________ (रोगी/रिश्तेदार) सचेत मन की स्थिति में अस्पताल के सलाहकारों और पैरामेडिकल कर्मियों को चिकित्सा परीक्षण, पैथोलॉजिकल और रेडियोलॉजिकल और मेडिकल/सर्जिकल उपचार या किसी भी प्रकार की प्रक्रिया करने के लिए सहमति देता हूं और अधिकृत करता हूं।
            </p>
            <p>
              ओपीडी/आईपीडी में रोगी देखभाल के दौरान प्रशासनिक/बीमा उद्देश्य के लिए कागजात के दस्तावेजीकरण और नैदानिक अनुसंधान और गोपनीयता के लिए जानकारी के प्रकटीकरण के साथ सलाह दी जाती है। हम पूरी तरह संतुष्ट हैं और अपनी इच्छा से इलाज/सर्जरी कराना चाहते हैं।
            </p>
            <p>
              हम अस्पताल के बिल के समय पर भुगतान के लिए जिम्मेदार होंगे। उपचार/सर्जरी के दौरान और उसके दौरान किसी भी जटिलता के लिए मैं स्वयं जिम्मेदार रहूंगा। सर्जरी/उपचार से होने वाली किसी भी जटिलता और खतरे के लिए अस्पताल, अस्पताल कर्मचारी, डॉक्टर जिम्मेदार नहीं होंगे।
            </p>
            <p>
              अस्पताल और अस्पताल के कर्मचारी किसी भी चोरी हुए सामान के लिए जिम्मेदार नहीं होंगे, मैं अपने सामान की सुरक्षा के लिए जिम्मेदार हूं।
            </p>
            <p>
              मैंने ऊपर लिखी सभी बातें पढ़ी हैं और मुझे समझाया भी गया है।
            </p>
            <p>
              ऊपर दी गई सभी जानकारियों को समझने के बाद मैं अपनी अनुमति देता हूं।
            </p>
          </div>
          <div className="mt-[50px] flex justify-between px-4">
            <div className="text-center">
                <p className="border-t-[1px] border-black">Signature of Patient</p>
                <p className="uppercase text-xs">({patient?.patient?.name || 'N/A'})</p>
            </div>
            <div className="text-center">
                <p className="border-t-[1px] border-black">Signature of Guardian</p>
                <p className="text-xs uppercase">({patient?.patient?.guardianName || 'N/A'})</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConsentFormPrint;
