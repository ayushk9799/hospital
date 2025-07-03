export const opdBillTokenTemplateDefault = `(patientData, hospitalInfo, ref) => {
  const format = (date, formatStr) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return \`\${day}/\${month}/\${year}\`;
  };



let city = hospitalInfo?.address?.split(",").at(-1).trim();
  const hardcodedTerms = [
    "This receipt is valid only once.",
    "Receipt is not Refundable.",
    "Valid only for patient mentioned above.",
    "Slot once booked cannot be changed.",
    \`Subjected to \${city?.charAt(0)?.toUpperCase() + city?.slice(1)} Jurisdiction Only.\`
  ];

  const BillCopy = ({ title, patient, bill, payment, admissionRecord, visit, hospitalInfo }) => 
    React.createElement("div", { 
      className: "w-full lg:w-1/2 p-1 lg:p-2 border-b lg:border-b-0 lg:border-r border-dashed" 
    },
      React.createElement("div", { className: "mb-0.5 sm:mb-1" },
        React.createElement("div", { className: "text-center space-y-1 print:m-0 print:p-0 " },
          React.createElement("h1", { className: "text-[20px] print:text-[14px] font-bold m-0 p-0  print:leading-tight" },
            hospitalInfo.name
          ),
          React.createElement("p", { className: "text-sm m-0 p-0 print:text-[10px] print:leading-tight" },
            hospitalInfo.doctorName
          ),
          React.createElement("p", { className: "text-sm m-0 p-0 print:text-[10px] print:leading-tight" },
            hospitalInfo.contactNumber
          )
        ),
        React.createElement("div", { className: "flex justify-between items-center mt-2 font text-[14px]" },
          React.createElement("h2", { className: "font-bold" }, title),
          React.createElement("div", { className: "text-[12px]" },
            React.createElement("span", { className: "font-semibold" }, "Invoice No: "),
            React.createElement("span", null, bill?.invoiceNumber || "N/A")
          )
        )
      ),
      React.createElement("div", { className: "grid gap-1 print:gap-0.5" },
        React.createElement("div", { className: "print:text-[10px] text-[14px] border rounded-md bg-gray-50" },
          React.createElement("div", { className: "grid grid-cols-3 p-2 border-b" },
            React.createElement("div", { className: "flex gap-1" },
              React.createElement("span", { className: "font-semibold" }, "Name:"),
              React.createElement("span", { className: "font-semibold" }, patient.name)
            ),
            React.createElement("div", { className: "flex gap-1 justify-end" },
              React.createElement("span", { className: "font-semibold" }, "Age/Sex:"),
              React.createElement("span", { className: "font-semibold" }, \`\${patient.age}/\${patient.gender}\`)
            ),
            React.createElement("div", { className: "flex gap-1 justify-end" },
              React.createElement("span", { className: "font-semibold" }, "UHID No:"),
              React.createElement("span", { className: "font-semibold" }, patient.registrationNumber)
            )
          ),
          React.createElement("div", { className: "grid grid-cols-3 gap-2 p-2" },
            React.createElement("div", { className: "flex whitespace-nowrap overflow-hidden gap-1" },
              React.createElement("span", { className: "font-semibold flex-shrink-0" }, "Address:"),
              React.createElement("span", { 
                className: "truncate font-semibold",
                title: patient.address
              }, patient.address)
            ),
            React.createElement("div", { className: "flex gap-1 justify-end" },
              React.createElement("span", { className: "font-semibold" }, "Contact:"),
              React.createElement("span", { className: "font-semibold" }, patient.contactNumber)
            ),
            React.createElement("div", { className: "flex gap-1 justify-end" },
              React.createElement("span", { className: "font-semibold" }, "Date:"),
              React.createElement("span", { className: "font-semibold" }, format(bill.createdAt))
            )
          )
        ),
        React.createElement("div", null,
          React.createElement("span", { className: "font-bold text-[16px] print:text-[12px]" }, "Slot No :"),
          React.createElement("span", { className: "font-bold text-[16px] print:text-[12px]" }, 
            admissionRecord?.bookingNumber || visit?.bookingNumber
          )
        ),
        React.createElement("div", null,
          React.createElement("div", { className: "vitals-section" },
            React.createElement("h2", { className: "font-bold print:text-[12px]" }, "Vitals"),
            React.createElement("div", { className: "grid grid-cols-3 gap-0 print:text-[12px]" },
              React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "BP:"),
                React.createElement("span", null, 
                  admissionRecord?.vitals?.bloodPressure ? \`\${admissionRecord.vitals.bloodPressure} mmHg\` : ""
                )
              ),
              React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "Weight:"),
                React.createElement("span", null,
                  admissionRecord?.vitals?.weight ? \`\${admissionRecord.vitals.weight} kg\` : ""
                )
              ),
              admissionRecord?.vitals?.heartRate && React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "Heart Rate:"),
                React.createElement("span", null, \`\${admissionRecord.vitals.heartRate} bpm\`)
              ),
              admissionRecord?.vitals?.temperature && React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "Temp:"),
                React.createElement("span", null, \`\${admissionRecord.vitals.temperature} °C\`)
              ),
              admissionRecord?.vitals?.oxygenSaturation && React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "O"),
                React.createElement("span", { style: { verticalAlign: "sub" } }, "₂"),
                React.createElement("span", { className: "font-semibold" }, " Saturation:"),
                React.createElement("span", null, \`\${admissionRecord.vitals.oxygenSaturation}%\`)
              ),
              admissionRecord?.vitals?.respiratoryRate && React.createElement("div", { className: "flex gap-2" },
                React.createElement("span", { className: "font-semibold" }, "Respiration:"),
                React.createElement("span", null, \`\${admissionRecord.vitals.respiratoryRate} br/min\`)
              )
            )
          )
        ),
        React.createElement("div", { className: "overflow-x-auto" },
          React.createElement("table", { className: "border-2 border-gray-200 mt-1 w-full text-[17px] print:text-[17px]" },
            React.createElement("thead", { className: "bg-gray-100 print:text-[12px]" },
              React.createElement("tr", null,
                React.createElement("th", { className: "w-[40px] print:p-0 text-left print:text-left" }, "No"),
                React.createElement("th", { className: "print:p-0 " }, "Service"),
                React.createElement("th", { className: "text-right w-[50px] print:p-0" }, "Qty"),
                React.createElement("th", { className: "text-right w-[70px] print:p-0" }, "Rate"),
                React.createElement("th", { className: "text-right w-[70px] print:p-0" }, "Amt")
              )
            ),
            React.createElement("tbody", { className: "print:text-[12px]" },
              bill.services.map((service, index) =>
                React.createElement("tr", { key: index },
                  React.createElement("td", { className: "py-1 text-left" }, index + 1),
                  React.createElement("td", { className: "py-0.5" },
                    React.createElement("div", { className: "text-center" }, service.name)
                  ),
                  React.createElement("td", { className: "text-right py-0.5" }, service.quantity),
                  React.createElement("td", { className: "text-right py-0.5" }, \`₹\${service.rate}\`),
                  React.createElement("td", { className: "text-right py-0.5" }, \`₹\${service.quantity * service.rate}\`)
                )
              )
            )
          )
        ),
        React.createElement("div", { className: "flex flex-col items-end mt-1 text-[17px] print:text-[12px]" },
          React.createElement("div", { className: "summary-section flex justify-between w-full sm:w-48 px-2 sm:px-0" },
            React.createElement("span", null, "Sub Total:"),
            React.createElement("span", null, \`₹\${bill.subtotal}\`)
          ),
          bill.additionalDiscount > 0 && React.createElement("div", { 
            className: "summary-section flex justify-between w-full sm:w-48 text-red-600" 
          },
            React.createElement("span", null, "Discount:"),
            React.createElement("span", null, \`- ₹\${bill.additionalDiscount}\`)
          ),
          React.createElement("div", { 
            className: "summary-section flex justify-between w-full sm:w-48 font-bold border-gray-200" 
          },
            React.createElement("span", null, "Total Amount:"),
            React.createElement("span", null, \`₹\${bill.totalAmount}\`)
          ),
          React.createElement("div", { className: "summary-section w-full sm:w-48 border-t border-gray-200" },
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", null, "Amount Paid:"),
              React.createElement("span", { className: "text-green-600 font-bold" }, \`₹\${bill.amountPaid}\`)
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", null, "Due Amount:"),
              React.createElement("span", { className: "text-red-600" }, 
                \`₹\${Math.max(0, bill.totalAmount - bill.amountPaid)}\`
              )
            ),
            React.createElement("div", { className: "flex justify-between pt-0.5" },
              React.createElement("span", null, "Payment Method:"),
              React.createElement("span", null, payment.map(p => p.paymentMethod).join(","))
            ),
            React.createElement("div", { className: "flex justify-between font-medium pt-0.5" },
              React.createElement("span", null, "Status:"),
              React.createElement("span", { 
                className: \`\${bill.totalAmount === bill.amountPaid ? "text-green-600" : "text-red-600"} font-bold\`
              }, bill.totalAmount === bill.amountPaid ? "PAID" : "DUE")
            )
          )
        ),
        React.createElement("div", null,
          React.createElement("ul", { className: "text-[8px] font-bold hidden print:block" },
            hardcodedTerms.map((term, index) =>
              React.createElement("li", { 
                key: index,
                className: "flex items-start text-gray-700" 
              },
                React.createElement("span", { className: "mr-2 text-red-500 font-bold" }, "•"),
                React.createElement("span", { className: "flex-1" }, term)
              )
            )
          )
        ),
        React.createElement("div", { 
          className: "flex-col text-[11px] items-end font-bold hidden print:flex print:items-end" 
        }, hospitalInfo.name),
        React.createElement("div", { 
          className: "flex-col text-[12px] items-center justify-center hidden print:flex print:items-center print:justify-center pt-3" 
        }, "Get Well Soon")
      )
    );

  return React.createElement("div", { 
    className: "flex flex-row lg:flex-row w-full print:w-[210mm] print:h-[148mm] print:py-5 print:pl-3 print:pr-4",
    ref: ref 
  },
    React.createElement(BillCopy, {
      title: "Hospital Copy",
      patient: patientData.patient,
      bill: patientData.bill,
      payment: patientData.payment,
      admissionRecord: patientData.admissionRecord,
      visit: patientData.visit,
      hospitalInfo: hospitalInfo
    }),
    React.createElement("div", { 
      className: "w-0 h-full border-l-2 border-dashed border-gray-500" 
    }, null),
    React.createElement(BillCopy, {
      title: "Patient Copy",
      patient: patientData.patient,
      bill: patientData.bill,
      payment: patientData.payment,
      admissionRecord: patientData.admissionRecord,
      visit: patientData.visit,
      hospitalInfo: hospitalInfo
    })
  );
}`;


