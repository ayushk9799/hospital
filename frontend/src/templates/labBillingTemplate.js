export const labBillingTemplateStringDefault = `
(hospital, labData,ref) => {
  const formatDate = (date) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').join('-');
  };
  
  return React.createElement("div", { ref:ref,
    className: "relative font-[Tinos] bg-white w-[210mm] min-h-[148mm] mx-auto box-border p-[5mm] print:absolute print:left-0 print:top-0 print:w-full print:[&_*]:visible print:visible print:[&_.no-print]:hidden"
  },
    React.createElement("div", { className: "border-[1px] border-black mt-5" },
      // Header Section
      React.createElement("div", { className: "print:block border-b-[1px] border-black p-4" },
        React.createElement(HospitalHeader, { hospitalInfo: hospital })
      ),

    

      // Patient Details Section
      React.createElement("div", { className: "grid grid-cols-2 py-2 px-4 border-black border-b-[1px]" },
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "Patient Name:"),
          React.createElement("p", { className: "col-span-2 capitalize" }, labData?.patientName || "N/A")
        ),
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "UHID No:"),
          React.createElement("p", { className: "col-span-2" }, labData?.registrationNumber || "N/A")
        ),
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "Age/Gender:"),
          React.createElement("p", { className: "col-span-2 capitalize" }, 
            \`\${labData?.age ? \`\${labData.age} Years\` : 'N/A'} / \${labData?.gender || 'N/A'}\`
          )
        ),
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "Bill Date:"),
          React.createElement("p", { className: "col-span-2" }, 
            formatDate(labData?.bookingDate)
          )
        ),
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "Lab No:"),
          React.createElement("p", { className: "col-span-2" }, labData?.labNumber || "N/A")
        ),
        React.createElement("div", { className: "grid grid-cols-3" },
          React.createElement("p", { className: "font-semibold" }, "Invoice No:"),
          React.createElement("p", { className: "col-span-2" }, 
            labData?.billDetails?.invoiceNumber || labData?.invoiceNumber || "N/A"
          )
        )
      ),

      // Tests Table Header
      React.createElement("div", { className: "grid grid-cols-12 pb-2 px-4 font-semibold border-black border-b-[1px]" },
        React.createElement("div", { className: "col-span-2" }, "S.No."),
        React.createElement("div", { className: "col-span-8" }, "Test Description"),
        React.createElement("div", { className: "col-span-2 text-right" }, "Amount (₹)")
      ),

      // Tests Table Body
      React.createElement("div", { className: "border-black border-b-[1px]" },
        (labData?.labTests || []).map((test, index) =>
          React.createElement("div", { 
            key: index,
            className: "grid grid-cols-12 pb-2 px-4" + (index < (labData?.labTests?.length || 0) - 1 ? " border-b border-gray-200" : "")
          },
            React.createElement("div", { className: "col-span-2" }, index + 1),
            React.createElement("div", { className: "col-span-8" }, test.name),
            React.createElement("div", { className: "col-span-2 text-right" },
              test.price?.toLocaleString('en-IN') || "0.00"
            )
          )
        )
      ),

      // Amount in Words
      React.createElement("div", { className: "border-black border-b-[1px] px-4 py-2 text-right flex flex-col font-bold" },
        React.createElement("span", null, 
          "Sub Total: ", 
          labData?.paymentInfo?.totalAmount?.toLocaleString('en-IN') || "0.00"
        ),
        React.createElement("span", null, 
          "Discount: ", 
          labData?.paymentInfo?.additionalDiscount?.toLocaleString('en-IN') || "0.00"
        ),
        React.createElement("span", { className: "font-medium" }, 
          "Net Amount: ",
          ((labData?.paymentInfo?.totalAmount || 0) - (labData?.paymentInfo?.additionalDiscount || 0))?.toLocaleString('en-IN') || "0.00"
        ),
        React.createElement("span", { className: "text-gray-600" }, 
          "Amount Paid: ",
          labData?.paymentInfo?.amountPaid?.toLocaleString('en-IN') || "0.00"
        ),
        React.createElement("span", { className: "font-semibold" }, 
          "Balance Due: ",
          React.createElement("span", { 
            className: "font-bold " + ((labData?.paymentInfo?.balanceDue || 0) > 0 ? 'text-red-600' : 'text-green-600')
          }, 
            "₹", labData?.paymentInfo?.balanceDue?.toLocaleString('en-IN') || "0.00"
          )
        )
      ),
       

      // Payment Details
     

      // Signature Section
      React.createElement("div", { className: "grid grid-cols-3 h-[40px]" },
        React.createElement("div", { 
          className: "col-span-2 pl-4 flex items-center text-2xl justify-center",
          style: { fontFamily: 'cursive' }
        }, "Thank you"),
        React.createElement("div", { 
          className: "border-black border-l-[1px] pl-4 flex items-end pb-2 justify-center"
        }, "Signatory Authority")
      )
    )
  );
}`;
