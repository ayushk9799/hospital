import { stylesFont } from "../../components/custom/reports/LabReportPDF";
import { useSelector } from "react-redux";

const HospitalHeader = () => {
  const { hospitalInfo } = useSelector((state) => state.hospital);
  return (
    <div className="border-b border-[#000000] pb-2 print:pb-1">
      <div className="text-center">
        <h1 className="text-4xl tracking-wide text-[#1a5f7a] uppercase print:text-lg print:mb-1"
          style={stylesFont.fontFamilyName}>
          {hospitalInfo?.name}
        </h1>
      </div>
      <div className="flex items-center justify-center print:mt-1">
        <div className="print:w-[40px] print:h-[40px] flex-shrink-0">
          <img
            src={require("../../components/custom/reports/Capture2.png")}
            alt="Clinic Logo"
            className="w-[100px] h-[100px] print:w-[40px] print:h-[40px]"
          />
        </div>
        <div className="ml-8 print:ml-4 flex flex-col items-center">
          <p className="text-center text-[#333333] print:text-[9px] print:leading-tight">
            {hospitalInfo?.address}
          </p>
          <h2 className="text-center text-[#1a5f7a] text-xl print:text-xs print:font-bold print:my-0.5">
            {hospitalInfo?.doctorName}
          </h2>
          <p className="text-center text-[#333333] print:text-[9px] print:leading-tight">
            {hospitalInfo?.doctorInfo}
          </p>
          <p className="text-center text-[#333333] print:text-[9px] print:leading-tight">
            Mob : {hospitalInfo?.contactNumber}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HospitalHeader;
