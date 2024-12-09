import React, { useRef } from 'react';
import { Button } from '../../ui/button';
import { Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

const OPDPrescriptionPrint = ({ patient }) => {
  const componentRef = useRef();
  const formattedDate = format(new Date(patient.bookingDate), 'dd/MM/yyyy');

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @media print {
        @page {
          size: A4;
          margin: 0;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .print-content {
          position: relative;
          min-height: 100vh;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  return (
    <>
      <Button variant="ghost" className="flex items-center w-full justify-start" onClick={handlePrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print OPD (Rx)
      </Button>
      
      <div style={{ display: 'none' }}>
        <div ref={componentRef} className="print-content">
          <div style={{
            width: '210mm',
            height: '297mm',
            position: 'relative',
            backgroundColor: 'white',
          }}>
           

            <div 
              style={{
                position: 'absolute',
                left: '25mm',
                top: '54mm',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {patient.patient.name}
            </div>

            <div 
              style={{
                position: 'absolute',
                left: '160mm',
                top: '54mm',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {formattedDate}
            </div>
            <div 
              style={{
                position: 'absolute',
                left: '160mm',
                top: '64mm',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {patient.patient.address}
            </div>

            <div 
              style={{
                position: 'absolute',
                left: '30mm',
                top: '64mm',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              {patient.patient.age} / {patient.patient.gender}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OPDPrescriptionPrint; 