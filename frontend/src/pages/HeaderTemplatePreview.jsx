import React from "react";
import { Button } from "../components/ui/button";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { updateTemplate } from "../redux/slices/templatesSlice";
import { headerTemplateString } from "../templates/headertemplate";
import {headerTemplateString2 as headerTemplateStringExperimental} from "../templatesExperiments/HospitalHeaderTemplate";
import { createDynamicComponentFromString } from "../utils/print/HospitalHeader";

export default function HeaderTemplatePreview() {
  const { hospitalInfo } = useSelector((state) => state.hospital);
  const dispatch = useDispatch();
  const headerTemplates = useSelector(
    (state) => state.templates.headerTemplate
  );
  const HospitalHeader = createDynamicComponentFromString(
    headerTemplates
  );
  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Hospital Header Preview
        </h1>
        {/* <Button onClick={()=>{
          dispatch(updateTemplate({headerTemplate:headerTemplateStringExperimental}));
        }}>Save Template</Button> */}
      </div>

      <div className="flex justify-center bg-gray-100 p-4 min-h-[calc(100vh-200px)] overflow-auto">
        <div
          className="bg-white shadow-lg"
          style={{
            width: "210mm",
            height: "297mm",
            padding: "8mm",
            margin: "0 auto",
          }}
        >
          <HospitalHeader hospitalInfo={hospitalInfo} />
        </div>
      </div>
    </div>
  );
}
