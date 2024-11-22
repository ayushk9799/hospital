import React from 'react';
import { useSelector } from 'react-redux';

const SimplePrintHeader = () => {
  const { hospitalInfo } = useSelector((state) => state.hospital);

  if (!hospitalInfo) return null;

  return (
    <div className="text-center space-y-1 print:m-0 print:p-0 print-header">
      <h1 className="text-xl font-bold m-0 p-0 print:text-base print:leading-tight">
        {hospitalInfo.name}
      </h1>
      <p className="text-sm m-0 p-0 print:text-sm print:leading-tight">
        Dr. {hospitalInfo.doctorName}
      </p>
    </div>
  );
};

export default SimplePrintHeader; 