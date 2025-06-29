(reportData, patientData, hospital, ref) => {
  const reportEntries = Object.entries(reportData?.report||{});
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getValueColor = (value, normalRange, gender) => {
    if (!value || !normalRange) return { color: "inherit", symbol: "" };
  
    // Handle gender-specific ranges
    if (normalRange.toLowerCase().includes("male") && normalRange.toLowerCase().includes("female")) {
      const ranges = normalRange.split(/[,;]/).map(r => r.trim());
      const genderRange = ranges.find(r => 
        r.toLowerCase().includes(gender.toLowerCase()) || 
        r.toLowerCase().startsWith(gender.toLowerCase().charAt(0))
      );
      
      if (genderRange) {
        normalRange = genderRange
          .replace(/\s*(male|female|m|f)?:?\s*/gi, "") // Remove gender prefixes
          .replace(/[()]/g, "") // Remove all parentheses
          .trim();
      }
    }
  
    // Extract numeric values from the range
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return { color: "inherit", symbol: "" };
  
    // Handle different range patterns
    if (normalRange.includes("-")) {
      // Range pattern: "x-y"
      const [min, max] = normalRange.split("-").map(v => parseFloat(v));
      if (!isNaN(min) && !isNaN(max)) {
        if (numericValue < min) return { color: "#000000", symbol: "↓" }; // Red with down arrow for low
        if (numericValue > max) return { color: "#000000", symbol: "↑" }; // Red with up arrow for high
        return { color: "#000000", symbol: "" }; // Black for normal
      }
    } else if (normalRange.startsWith("<")) {
      // Range pattern: "<x"
      const max = parseFloat(normalRange.substring(1));
      if (!isNaN(max)) {
        return numericValue > max ? { color: "#000000", symbol: "↑" } : { color: "#000000", symbol: "" };
      }
    } else if (normalRange.startsWith(">")) {
      // Range pattern: ">x"
      const min = parseFloat(normalRange.substring(1));
      if (!isNaN(min)) {
        return numericValue < min ? { color: "#000000", symbol: "↓" } : { color: "#000000", symbol: "" };
      }
    }
  
    return { color: "inherit", symbol: "" };
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
          .replace(/[()]/g, "") // Remove all parentheses
          .trim();
      }
    }
    return normalRange;
  };

  const shoulduseTextarea = (unit, normalRange) => {
    return !(["",undefined,null,"N/A"].includes(unit) && ["",undefined,null,"N/A"].includes(normalRange))
  }
  
  // Calculate footer height for proper content area sizing
  const footerHeight = 50; // height in mm
  
  return React.createElement("div", { 
    ref: ref, 
    className: "relative font-[Tinos] bg-white w-[210mm] min-h-[297mm] mx-auto box-border p-[10mm] print:absolute print:left-0 print:top-0 print:w-full print:[&_*]:visible print:visible print:[&_.no-print]:hidden"
  },
    // Watermark
    hospital?.morelogos?.[0] && React.createElement("img", {
      src: hospital.moreLogosBlobs[1],
      className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100mm] h-[100mm] object-contain opacity-10 pointer-events-none",
      alt: "Watermark"
    }),

    // Header (with page-break-inside: avoid to keep header together)
    React.createElement("div", { className: "flex flex-col mb-4 mt-5" },
      // Top section with logo and contact info
      React.createElement("div", { className: "flex justify-between items-center" },
        // Logo and name section
        React.createElement("div", { className: "flex items-center gap-4" },
          hospital?.logo && React.createElement("img", {
            src: hospital.moreLogosBlobs[1],
            alt: "Hospital Logo",
            className: "w-[80px] h-[90px] object-contain"
          }),
          React.createElement("div", { className: "flex flex-col" },
            React.createElement("h1", { className: "font-bold text-right leading-none w-full", style : {fontSize : '34px', color : '#ff0ade'}},
              React.createElement("span", { className: " font-semibold tracking-wide w-full text-justify font-bold" }, "AGASTYA DIAGNOSTICS CENTER ")
            ),
            React.createElement('div', {className : 'flex w-full items-center justify-between'}, 
              React.createElement('div', { className: 'flex-1 ' },
                React.createElement('svg',{
                    className: 'w-full h-3 text-red-500',
                    viewBox: '0 0 500 20',
                    xmlns: 'http://www.w3.org/2000/svg'
                  },
                  React.createElement('polyline', {
                    fill: 'none',
                    stroke: '#fa57c6',
                    strokeWidth: '1',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    points: '0,12 30,12 35,2 40,22 45,12 55,12 60,7 65,17 70,12 280,12,'
                  })
                )
              ),
              React.createElement("div", { className: "text-md font-semibold tracking-wide italic" }, "Where Science Meets Services")
            ),
            // Address line
            React.createElement("div", { className: "text-center text-gray-700 font-semibold mt-2 leading-none" },
              "A unit of Aadya Neurosciences, Opposite Jail Gate, Rampur, Gaya - 823001"
            ),
          )
        ),
      ),
      


      // Patient Details Section
      React.createElement("div", { className: "grid grid-cols-3 gap-6 text-sm pt-2 border-gray-300 border-t mt-1" },
        // Left section
        React.createElement("div", { className: "text-start border-r border-gray-300" },
            React.createElement("div", { className: "font-semibold" },
             "Dr. Nibha",  React.createElement("span", { className: "text-xs normal" }, " (Reg. No. 37738)")),
            React.createElement("div", { className: "text-xs" }, "MBBS, MD (Biochemistry)"),
            React.createElement("div", { className: "text-xs" }, "Assistant Professor NMCH, Sasaram"),
            React.createElement("div", { className: "text-xs" }, "Sadar Hospital, Aurangabad"),
            React.createElement("div", { className: "text-xs" }, "Ex Resident ANMMCH, Gaya"),
          ),
        React.createElement("div", { className: " border-r border-gray-300" },
          React.createElement("div", { className: "font-bold capitalize" }, "Patient Name: " + ( patientData?.patientName) ),
          React.createElement("div", null, "Age: " + (patientData?.patient?.age || patientData.age) + " Years"),
          React.createElement("div", null, "Gender: " + (patientData?.patient?.gender || patientData.gender)),
          React.createElement("div", null, "PID: " + (patientData?.registrationNumber || patientData?.labNumber))
        ),
        // Middle section
        React.createElement("div", { className: "space-y-1 " },
          React.createElement("div", { className: "font-bold" }, "Address:"),
          React.createElement("div", null, patientData?.patient?.address),
          React.createElement("div", null,
            React.createElement("span", { className: "font-bold" }, "Mob: "),
            patientData?.patient?.contactNumber || patientData.contactNumber
          ),
          
          React.createElement("div", null,
            React.createElement("span", { className: "font-bold" }, "Report Date: "),
            formatDate(reportData?.date)
          ),
          
        ),
       
      )
    ),

    React.createElement("div", { className: "font-bold uppercase border-gray-300 border-b border-t" },
      React.createElement("span", { className: "font-bold uppercase" }, "Ref. By : "),
     patientData?.referredByName
    ),

    // Report Title
    React.createElement("div", { className: " mb-2", style: { pageBreakAfter: "avoid" } },
      React.createElement("h2", { className: "text-[16px] font-bold underline text-center tracking-wider" },
        reportData?.completeType || reportData?.name
      )
    ),

    // Report Content (with padding-bottom to prevent overlap with footer)
    React.createElement("div", { className: "" }, // Add enough padding to avoid overlap with footer
      reportEntries.filter(([_, value]) => shoulduseTextarea(value.unit, value.normalRange)).length > 0 &&
      React.createElement("div", { 
        className: "grid grid-cols-12 gap-4 border-t border-gray-300 border-b py-1 font-bold text-[14px]",
        style: { pageBreakAfter: "avoid" } // Prevent breaking after header row
      },
        React.createElement("div", { className: "col-span-5 font-bold pr-[2mm]" }, "Test Name"),
        React.createElement("div", { className: "col-span-2 font-bold" }, "Result"),
        React.createElement("div", { className: "col-span-2 font-bold text-center" }, "Unit"),
        React.createElement("div", { className: "col-span-3 font-bold text-right" }, "Normal Range")
      ),

      reportEntries
        .filter(([_, value]) => value.value)
        .map(([key, value], index) =>
          React.createElement("div", { 
            className: `${!shoulduseTextarea(value.unit, value.normalRange) ? "" : "grid grid-cols-12  pt-1  items-center "}`, 
            key: key,
           
          },
            shoulduseTextarea(value.unit, value.normalRange) ?
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "text-[15px] col-span-5 " }, key),
                React.createElement("div", { 
                  className: "text-[15px] pl-1 col-span-2 font-bold",
                  style: { 
                    color: getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender).color
                  } 
                }, [
                  value.value,
                  getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender).symbol
                ].join(" ")),
                React.createElement("div", { className: "text-[15px] text-center col-span-2" }, value.unit),
                React.createElement("div", { className: "text-[15px] text-right col-span-3" }, 
                  getGenderSpecificRange(value.normalRange, patientData?.patient?.gender || patientData.gender)
                )
              ) :
              React.createElement("div", { 
                className: "grid grid-cols-12 gap-5 items-baseline"
              },
                React.createElement("div", { className: "text-[15px] col-span-2 font-bold" }, key),
                React.createElement("div", { 
                  className: "text-[14px] flex col-span-10 whitespace-pre-wrap break-all w-full",
                  style: { 
                    color: getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender).color,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    lineHeight: '1.2'
                  } 
                }, [
                  value.value,
                  getValueColor(value.value, value.normalRange, patientData?.patient?.gender || patientData.gender).symbol
                ].join(" "))
              )
          )
        )
    ),

    // Modified notes section
    React.createElement("div", {
      className: "mt-[10px] text-sm"
    },
    reportData.remarksArray && reportData.remarksArray.map((noteItem, index) => {
      if (noteItem.type === "paragraph") {
        return React.createElement("p", {
          key: index,
          className: "whitespace-pre-wrap mb-2"
        }, noteItem.content);
      } else if (noteItem.type === "header") {
        return React.createElement("h3", {
          key: index,
          className: "text-md font-bold mt-4 mb-2"
        }, noteItem.content);
      } else if (noteItem.type === "table") {
        return React.createElement("table", {
            key: index,
            className: "w-full table-fixed border-collapse border border-gray-300 my-4"
          },
          React.createElement("thead", null,
            React.createElement("tr", {
                className: "bg-gray-100"
              },
              noteItem.header.map((heading, hIndex) =>
                React.createElement("th", {
                  key: hIndex,
                  className: "border border-gray-300 p-2 text-left"
                }, heading)
              )
            )
          ),
          React.createElement("tbody", null,
            noteItem.rows.map((row, rIndex) =>
              React.createElement("tr", {
                  key: rIndex
                },
                row.map((cell, cIndex) =>
                  React.createElement("td", {
                    key: cIndex,
                    className: "border border-gray-300 p-2"
                  }, cell)
                )
              )
            )
          )
        );
      } else if (noteItem.type === "list") {
        return React.createElement("ul", {
          key: index,
          className: "list-disc list-inside ml-4 my-2"
        },
          noteItem.items.map((item, itemIndex) =>
            React.createElement("li", {
              key: itemIndex
            }, item)
          )
        );
      }
      // Add more types as needed (e.g., "image", "heading")
      return null;
    })
  ),

  React.createElement("div", { className: "text-center mt-[5px] mb-[5px]" }, "....End Of Report...."),

    // Footer (fixed at bottom with print-only positioning)
    React.createElement("div", { 
      className: "print:fixed print:bottom-[7mm] print:left-[10mm] print:right-[10mm] print:bg-white",
      style: {
        position: "absolute", 
        bottom: "7mm", 
        left: "10mm", 
        right: "10mm",
      }
    },
      // Signatures row
      React.createElement("div", { style: { 
        display: 'grid', 
        gridTemplateColumns: '1fr', 
        marginBottom: '1.5rem',
      } },
        // Doctor Signature
        React.createElement("div", { style: { textAlign: 'center' } },
          React.createElement("div", { style: { 
            borderTop: '1px solid #000', 
            marginLeft: 'auto',
            width: '200px',
            fontSize: '10pt',
          } }, 
           React.createElement("div", { className: "font-semibold" }, "DR NIBHA (MD Biochemistry)"),
          ), 
        )
      ),

      // Note line
      React.createElement("div", { style: { 
        borderTop: '1px solid #ddd', 
        fontSize: '9pt',
        color: '#444'
      } },
        React.createElement("div", { style: { marginBottom: '1px' } },
          "N.B.: This Report is only Doctor's not MEDICO LEGAL Purpose"
        ),
        React.createElement("div", { style: { marginBottom: '1px' } },
          "Clinical Correlation is necessary before coming to a final diagnosis."
        ),
        React.createElement("div", null,
          "(In case of any discrepancy due to machine error or typing,please get it rectified immediately.)"
        )
      )
    )
  );
}