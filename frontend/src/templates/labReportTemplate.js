export const labReportTemplateStringDefault = `(reportData, patientData, hospital, ref) => {
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

  const shouldUseTextarea = (unit, normalRange) => {
    return !(["",undefined,null,"N/A"].includes(unit) && ["",undefined,null,"N/A"].includes(normalRange))
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
    className: "relative font-[Tinos] bg-white w-[210mm] min-h-[297mm] mx-auto box-border p-[5mm] print:absolute print:left-0 print:top-0 print:w-full print:[&_*]:visible print:visible print:p-5 print:[&_.no-print]:hidden"
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
        React.createElement("div", { className: "flex items-start min-h-[24px]" },
          React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm] mt-[2px]" }, "Address:"),
          React.createElement("span", { 
            className: "text-[#2c3e50] flex-1 break-words overflow-hidden",
            style: {
              lineHeight: '1.2',
              maxHeight: '2.4em',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }, patientData?.address)
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

    // Report Title
    React.createElement("div", { className: "text-center my-1" },
      React.createElement("h2", { className: "text-[16px] font-bold underline tracking-wider" },
       reportData?.name
      )
    ),

    // Notes if present
    reportData.notes && React.createElement("div", { 
      className: "mb-4 p-2 bg-[#f8f9fa] rounded border border-[#e2e8f0]"
    },
      React.createElement("strong", {}, "Notes: "),
      React.createElement("span", {}, reportData.notes)
    ),

    // Report Content
    React.createElement("div", { className: "border-t-2 border-b-2 border-[#ecf0f1] pb-[60mm]" },
      // Only show table header if there are table-format fields
      reportData.order && reportData.order.some(item => 
        item.type === 'field' && shouldUseTextarea(item.unit, item.normalRange)
      ) && React.createElement("div", { 
        className: "grid grid-cols-12 gap-4 bg-[#f8f9fa] py-1 font-bold text-[14px] mb-2",
        style: { pageBreakAfter: "avoid" }
      },
        React.createElement("div", { className: "col-span-5 font-bold pr-[2mm]" }, "Test Name"),
        React.createElement("div", { className: "col-span-2 font-bold text-center" }, "Result"),
        React.createElement("div", { className: "col-span-2 font-bold text-center" }, "Unit"),
        React.createElement("div", { className: "col-span-3 font-bold text-right" }, "Normal Range")
      ),

      // Ordered Items (Fields and Sections)
      reportData.order && reportData.order.map((item, index) => {
        if (item.type === 'section') {
          return React.createElement("div", {
            key: \`section-\${index}\`,
            className: "col-span-12  p-1 font-bold text-[14px] text-[#2c3e50]"
          }, item.name);
        } else {
          // Check if field should use textarea format
          const useTableFormat = shouldUseTextarea(item.unit, item.normalRange);
          
          return item.value ? React.createElement("div", {
            key: \`field-\${index}\`,
            className: useTableFormat ? 
              "grid grid-cols-12 gap-4 py-[2px] items-center text-[13px]" :
              "grid grid-cols-12 gap-5 py-[2px] items-baseline"
          },
            useTableFormat ? 
              // Table format
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "col-span-5 text-[#2c3e50] pr-[2mm] pl-4 " }, 
                  item.label
                ),
                React.createElement("div", {
                  className: "col-span-2 text-center font-bold",
                  style: { 
                    color: getValueColor(
                      item.value, 
                      item.normalRange, 
                      patientData?.gender || patientData?.patient?.gender
                    )
                  }
                }, item.value || '-'),
                React.createElement("div", { className: "col-span-2 text-center" }, 
                  item.unit || '-'
                ),
                React.createElement("div", { className: "col-span-3 text-right" },
                  getGenderSpecificRange(
                    item.normalRange, 
                    patientData?.gender || patientData?.patient?.gender
                  ) || '-'
                )
              ) :
              // Textarea format
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "text-[15px] col-span-2 font-bold" }, 
                  item.label
                ),
                React.createElement("div", {
                  className: "text-[14px] flex col-span-10 whitespace-pre-wrap break-all w-full",
                  style: {
                    color: getValueColor(
                      item.value, 
                      item.normalRange, 
                      patientData?.gender || patientData?.patient?.gender
                    ),
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.2'
                  }
                }, item.value || '')
              )
          ):React.createElement("div",null);
        }
      })
    ),

    // Footer
    React.createElement("div", { className: "absolute bottom-[7mm] left-[10mm] right-[10mm] pt-[5mm]" },
      React.createElement("div", { className: "text-right pr-[20mm] border-t border-black pt-[4mm]" },
        React.createElement("div", { className: "text-[10pt] font-bold" }, "Doctor's Signature")
      ),
      React.createElement("div", { className: "text-[8pt] text-[#666] mb-[2mm] text-center" },
        "This is a computer-generated report and does not require a physical signature."
      )
    )
  );
}`;

export const mergedLabReportTemplateStringDefault = `(reportsData, patientData, hospital, ref) => {
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getValueColor = (value, normalRange, gender) => {
    if (!value || !normalRange) return "inherit";
  
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

  const shouldUseTextarea = (unit, normalRange) => {
    return !(["",undefined,null,"N/A"].includes(unit) && ["",undefined,null,"N/A"].includes(normalRange))
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

  // Group reports by table/non-table format
  const groupedReports = reportsData.reduce((acc, report) => {
    // Process report fields and sections into ordered items
    const orderedItems = report.sections
      ? (() => {
          const items = [];
          let currentPosition = 0;

          // Sort sections by position
          const sortedSections = [...(report.sections || [])].sort(
            (a, b) => a.position - b.position
          );

          // Get all fields as array
          const fields = Object.entries(report.report || {}).map(([key, value]) => ({
            id: key,
            ...value
          }));

          // Process each section and its fields
          sortedSections.forEach((section, idx) => {
            // Add fields before this section
            const fieldsBeforeSection = fields.slice(
              currentPosition,
              section.position
            );
            items.push(
              ...fieldsBeforeSection.map((field, index) => ({
                type: "field",
                ...field,
                position: currentPosition + index,
              }))
            );

            // Add the section
            items.push({
              type: "section",
              id: section._id,
              name: section.name,
              position: section.position,
            });

            currentPosition = section.position;

            // If it's the last section, add remaining fields
            if (idx === sortedSections.length - 1) {
              const remainingFields = fields.slice(currentPosition);
              items.push(
                ...remainingFields.map((field, index) => ({
                  type: "field",
                  ...field,
                  position: currentPosition + index,
                }))
              );
            }
          });

          // If no sections, just add all fields
          if (sortedSections.length === 0) {
            items.push(
              ...fields.map((field, index) => ({
                type: "field",
                ...field,
                position: index,
              }))
            );
          }

          return items;
        })()
      : Object.entries(report.report || {}).map(([key, value], index) => ({
          type: "field",
          id: key,
          ...value,
          position: index,
        }));

    // Check if report has any table format entries
    const hasTableEntries = orderedItems.some(
      item => item.type === "field" && shouldUseTextarea(item.unit, item.normalRange)
    );

    if (hasTableEntries) {
      acc.tableReports.push({...report, orderedItems});
    } else {
      acc.nonTableReports.push({...report, orderedItems});
    }
    return acc;
  }, { tableReports: [], nonTableReports: [] });

  // Calculate footer height for proper content area sizing
  const footerHeight = 50; // height in mm

  return React.createElement("div", { 
    ref: ref, 
    className: "relative font-[Tinos] bg-white w-[210mm] min-h-[297mm] mx-auto box-border p-[10mm] print:absolute print:left-0 print:top-0 print:w-full print:[&_*]:visible print:visible print:p-5 print:[&_.no-print]:hidden"
  },
   

    React.createElement(HospitalHeader, { hospitalInfo: hospital }),

    React.createElement("div", { 
      className: "mt-[5px] p-2 bg-[#f8f9fa] rounded-[2mm] border border-[#e2e8f0] grid grid-cols-3 gap-2"
    },
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Name:"),
        React.createElement("span", { className: "text-[#2c3e50]" }, patientData?.patientName)
      ),
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Age/Gender:"),
        React.createElement("span", { className: "text-[#2c3e50]" }, 
          \`\${patientData?.patient?.age || patientData?.age} YEARS/\${patientData?.patient?.gender || patientData?.gender}\`
        )
      ),
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Reg No/Lab No:"),
        React.createElement("span", { className: "text-[#2c3e50]" }, 
          \`\${patientData?.registrationNumber ? patientData.registrationNumber : "--"}/\${patientData?.labNumber ? patientData.labNumber : "--"}\`
        )
      ),
      React.createElement("div", { className: "flex items-start min-h-[24px]" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm] mt-[2px]" }, "Address:"),
        React.createElement("span", { 
          className: "text-[#2c3e50] flex-1 break-words overflow-hidden",
          style: {
            lineHeight: '1.2',
            maxHeight: '2.4em',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, patientData?.address)
      ),
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Contact:"),
        React.createElement("span", { className: "text-[#2c3e50]" }, patientData?.contactNumber)
      ),
      React.createElement("div", { className: "flex items-center" },
        React.createElement("span", { className: "font-bold text-[#34495e] mr-[2mm] min-w-[20mm]" }, "Date:"),
        React.createElement("span", { className: "text-[#2c3e50]" }, formatDate(reportsData[0]?.date))
      )
    ),

    // Report Title (with page-break-after: avoid to keep with content)
    React.createElement("div", { className: "text-center my-2" },
      React.createElement("h2", { className: "text-lg font-bold underline tracking-wider" },
        reportsData.map(report => report.name).join(", ")
      )
    ),

    // Report Content (with padding to avoid footer overlap)
    React.createElement("div", { className: "border-t-2 border-b-2 border-[#ecf0f1] pb-[10mm]" },
      // Table format reports
      groupedReports.tableReports.length > 0 && React.createElement(React.Fragment, null,
        React.createElement("div", { 
          className: "grid grid-cols-12 gap-4 bg-[#f8f9fa] pt-1 tracking-wide font-bold text-[16px] mb-2",
        },
          React.createElement("div", { className: "col-span-5 font-bold pr-[2mm]" }, "Test Name"),
          React.createElement("div", { className: "col-span-2 font-bold text-center" }, "Result"),
          React.createElement("div", { className: "col-span-2 font-bold text-center" }, "Unit"),
          React.createElement("div", { className: "col-span-3 font-bold text-right" }, "Normal Range")
        ),

        groupedReports.tableReports.map((reportData, reportIndex) => 
          React.createElement("div", { 
            key: reportIndex, 
            className: "mb-1",
          },
            React.createElement("h3", { 
              className: "text-base mb-1 tracking-wider font-bold",
            }, 
              React.createElement("span",{},reportData.name),
              React.createElement("span",{className:"text-xs pl-3"},formatDate(reportData.date))
            ),
            reportData.orderedItems.map((item, index) => 
              item.type === "section" 
                ? React.createElement("div", {
                    key: \`section-\${index}\`,
                    className: "col-span-12  pr-[2mm] pl-4 font-bold text-[16px] text-[#2c3e50]"
                  }, item.name)
                : item.value ? React.createElement("div", { 
                    key: \`table-\${reportIndex}-\${index}\`,
                    className: "grid grid-cols-12 gap-4 items-center text-[14px]",
                  },
                    React.createElement("div", { className: "col-span-5 text-[#2c3e50] pr-[2mm] pl-4" }, item.label),
                    React.createElement("div", { 
                      className: "col-span-2 text-[10pt] text-center font-bold",
                      style: { color: getValueColor(item.value, item.normalRange, patientData?.patient?.gender || patientData.gender) }
                    }, item.value),
                    React.createElement("div", { className: "col-span-2 text-center" }, item.unit),
                    React.createElement("div", { className: "col-span-3 text-right" }, 
                      getGenderSpecificRange(item.normalRange, patientData?.patient?.gender || patientData.gender)
                    )
                  ) : React.createElement("div",null)
            )
          )
        )
      ),

      // Non-table format reports
      groupedReports.nonTableReports.length > 0 && React.createElement(React.Fragment, null,
        groupedReports.nonTableReports.map((reportData, reportIndex) => 
          React.createElement("div", { 
            key: reportIndex, 
            className: "",
          },
            React.createElement("h3", { 
              className: "text-base font-bold tracking-wider",
            }, 
              React.createElement("span",{},reportData.name),
              React.createElement("span",{className:"text-xs pl-3"},formatDate(reportData.date))
            ),
            reportData.orderedItems.map((item, index) => 
              item.type === "section"
                ? React.createElement("div", {
                    key: \`section-\${index}\`,
                    className: "text-base mb-1 pl-4 text-[#2c3e50]"
                  }, item.name)
                : item.value ? React.createElement("div", { 
                    key: \`non-table-\${reportIndex}-\${index}\`,
                    className: "grid grid-cols-12 gap-5 py-1 items-baseline"
                  },
                    React.createElement("div", { className: "text-[12pt] pl-4 col-span-2 font-bold" }, item.label),
                    React.createElement("div", { 
                      className: "text-[11pt] flex col-span-10 whitespace-pre-wrap break-all w-full",
                      style: {
                        color: getValueColor(item.value, item.normalRange, patientData?.patient?.gender || patientData.gender),
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        lineHeight: "1"
                      }
                    }, item.value)
                  ) : React.createElement("div",null)
            )
          )
        )
      )
    )
    
  
  );
}`;
