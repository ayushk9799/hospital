import React, { useRef } from "react";
import { useReactToPrint } from 'react-to-print';
import { Button } from "../components/ui/button";

const usePrintFunction = () => {
  const printFunction = useReactToPrint({
    // This function will be called when it's time to print
    onBeforeGetContent: () => {
      // You can do any pre-print preparations here
    },
    // This function determines what to print
    content: (ref) => ref.current,
  });

  return printFunction;
};

const Analytics = () => {
  const contentRef = useRef(null);
  const printFunction = usePrintFunction();

  const handlePrint = () => {
    if (contentRef.current) {
      printFunction(contentRef);
    }
  };

  return (
    <div>
      <div ref={contentRef}>
        {/* Your printable content goes here */}
        <h1>Bill Details</h1>
        <p>This is where your bill content would go</p>
      </div>
      <Button onClick={handlePrint}>Print Bill</Button>
    </div>
  );
};

export default Analytics;

