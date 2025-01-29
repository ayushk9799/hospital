export const testingTemplateString = `(patient, hospital, ref) => {
    return React.createElement("div", { className: "print-content" },
        // Patient Details Section - Left Column
        React.createElement("div", { 
            style: {
                position: 'absolute',
                top: '60mm',
                left: '15mm',
                width: '100mm',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight : 1.3
            }
        },
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Patient Name :"),
                patient?.patient?.name || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Guardian Name :"),
                patient?.guardianName || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Consultant Dr. :"),
                patient?.doctor?.name || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Department :"),
                patient?.department || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Address :"),
                patient?.patient?.address || ''
            )
        ),

        // Patient Details Section - Right Column
        React.createElement("div", { 
            style: {
                position: 'absolute',
                top: '60mm',
                left: '110mm',
                width: '85mm',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                paddingLeft:'10mm',
                lineHeight : 1.3
            }
        },
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "UHID/Reg No :"),
                patient?.registrationNumber || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Reg. Date :"),
                format(new Date(patient?.createdAt).toLocaleString(), 'dd-MMM-yyyy HH:mm') || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Valid For :"),
                format(addDays(new Date(patient?.createdAt).toLocaleString(), 13), 'dd-MMM-yyyy') || ''
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Age/Sex :"),
                \`\${patient?.patient?.age || ''} Years / \${patient?.patient?.gender || ''}\`
            ),
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold', display: 'inline-block', width: '35mm' } }, "Mobile No :"),
                patient?.patient?.contactNumber || ''
            )
        ),

        // BP and Weight Section - Below both columns
        React.createElement("div", { 
            style: {
                position: 'absolute',
                top: '85mm',
                left: '15mm',
                width: '180mm',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                textAlign: 'right',
                paddingRight: '20mm'
            }
        },
           
            React.createElement("div", null,
                React.createElement("span", { style: { fontWeight: 'bold' } }, "Weight(kgs) : "),
                patient?.vitals?.weight || ''
            ),
             React.createElement("div", { style: { marginBottom: '2mm' } },
                React.createElement("span", { style: { fontWeight: 'bold' } }, "BP : "),
                patient?.vitals?.bloodPressure || ''
            ),
        )
    );
}`;
