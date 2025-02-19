export const labReportTemplateStringDefault = `(reportData, patientData, hospital, ref) => {
  const reportEntries = Object.entries(reportData.report);
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Add color calculation functions
  const getValueColor = (value, normalRange, gender) => {
    if (!value || !normalRange) return "inherit";
  
    // Handle gender-specific ranges
    if (normalRange.toLowerCase().includes("male") && normalRange.toLowerCase().includes("female")) {
      const ranges = normalRange.split(/[,;]/).map(r => r.trim());
      const genderRange = ranges.find(r => 
        r.toLowerCase().includes(gender.toLowerCase()) || 
        r.toLowerCase().startsWith(gender.toLowerCase().charAt(0))
      );
      
      if (genderRange) {
        normalRange = genderRange
          .replace(/\s*(male|female|m|f)?:?\s*/gi, "")
          .replace(/[()]/g, "")
          .trim();
      }
    }
  
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return "inherit";
  
    if (normalRange.includes("-")) {
      const [min, max] = normalRange.split("-").map(v => parseFloat(v));
      if (!isNaN(min) && !isNaN(max)) {
        if (numericValue < min) return "#FF4444";
        if (numericValue > max) return "#FF4444";
        return "#2ECC71";
      }
    } else if (normalRange.startsWith("<")) {
      const max = parseFloat(normalRange.substring(1));
      if (!isNaN(max)) return numericValue > max ? "#FF4444" : "#2ECC71";
    } else if (normalRange.startsWith(">")) {
      const min = parseFloat(normalRange.substring(1));
      if (!isNaN(min)) return numericValue < min ? "#FF4444" : "#2ECC71";
    }
  
    return "inherit";
  };

  const getGenderSpecificRange = (normalRange, gender) => {
    if (!normalRange || !gender) return normalRange;

    if (normalRange.toLowerCase().includes("male") && normalRange.toLowerCase().includes("female")) {
      const ranges = normalRange.split(/[,;]/).map(r => r.trim());
      const genderRange = ranges.find(r => 
        r.toLowerCase().includes(gender.toLowerCase()) || 
        r.toLowerCase().startsWith(gender.toLowerCase().charAt(0))
      );
      
      if (genderRange) {
        return genderRange
          .replace(/\s*(male|female|m|f)?:?\s*/gi, "")
          .replace(/[()]/g, "")
          .trim();
      }
    }
    return normalRange;
  };

  return React.createElement("div", { 
    ref: ref, 
    className: "relative font-[Tinos] bg-white w-[210mm] min-h-[297mm] mx-auto box-border p-[20mm] print:absolute print:left-0 print:top-0 print:w-full print:[&_*]:visible print:visible print:p-5 print:[&_.no-print]:hidden"
  },
    React.createElement(HospitalHeader, { hospitalInfo: hospital }),

    React.createElement("div", { 
      className: "mt-[5px] p-2 bg-[#f8f9fa] rounded-[2mm] border border-[#e2e8f0] grid grid-cols-3 gap-2"
    },
     
        React.createElement("div", { className: "flex items-center" },
          React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Name:"),
          React.createElement("span", { className: " text-[#2c3e50]" }, patientData?.patientName)
        ),
        React.createElement("div", { className: "flex items-center" },
          React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Age/Gender:"),
          React.createElement("span", { className: " text-[#2c3e50]" }, \`\${patientData?.patient?.age || patientData.age} YEARS/\${patientData?.patient?.gender || patientData.gender}\`)
        ),
      
     
        React.createElement("div", { className: "flex items-center" },
          React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Reg No/Lab No:"),
          React.createElement("span", { className: " text-[#2c3e50]" }, \`\${patientData?.registrationNumber ? patientData.registrationNumber : "--"}/\${patientData?.labNumber ? patientData.labNumber : "--"}\`)
        ),
      
     
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Address:"),
        React.createElement("span", { className: " text-[#2c3e50]" }, patientData?.address)
         ),
     
        React.createElement("div", { className: "flex items-center" },
          React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Contact:"),
          React.createElement("span", { className: " text-[#2c3e50]" }, patientData?.contactNumber)
        ),
        React.createElement("div", { className: "flex items-center" },
          React.createElement("span", { className: " font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Date:"),
          React.createElement("span", { className: " text-[#2c3e50]" }, formatDate(reportData?.date))
        )
      
    ),

    React.createElement("div", { className: "text-center my-2" },
      React.createElement("h2", { className: "text-lg font-bold underline" }, reportData?.completeType || reportData?.name)
    ),

    React.createElement("div", { className: " border-t-2 border-b-2 border-[#ecf0f1] " },
      reportEntries.some(([_, value]) => value.unit || value.normalRange) &&
      React.createElement("div", { className: "grid grid-cols-12 gap-4 bg-[#f8f9fa] py-2 font-bold text-[16px]" },
        React.createElement("div", { className: "col-span-5  font-bold pr-[2mm]" }, "Test Name"),
        React.createElement("div", { className: "col-span-2  font-bold text-center" }, "Result"),
        React.createElement("div", { className: "col-span-2  font-bold text-center" }, "Unit"),
        React.createElement("div", { className: "col-span-3  font-bold text-right" }, "Normal Range")
      ),

      reportEntries
        .filter(([_, value]) => value.value)
        .map(([key, value]) =>
          React.createElement("div", { 
            className: "grid grid-cols-12 gap-4 py-1 border-b border-[#ecf0f1] items-center font-bold", 
            key: key 
          },
            value.unit || value.normalRange ?
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "col-span-5 text-[#2c3e50]  pr-[2mm]" }, key),
                React.createElement("div", { 
                  className: "col-span-2 text-[10pt] text-center",
                  style: { color: getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender) }
                }, value.value),
                React.createElement("div", { className: "col-span-2  text-center" }, value.unit),
                React.createElement("div", { className: "col-span-3  text-right" }, 
                  getGenderSpecificRange(value.normalRange, patientData?.patient?.gender || patientData.gender)
                )
              ) :
             React.createElement(React.Fragment, null,
              React.createElement("div",{ className: "text-[10pt]  col-span-5" }, key),
              React.createElement("div", { 
                className: "text-[10pt]  text-center col-span-2 font-bold",
                style: { 
                  color: getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender)
                } 
              }, value.value)
            )
          )
        )
    )
  );
}`;