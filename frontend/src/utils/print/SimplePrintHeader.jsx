import React from 'react';
import { useSelector } from 'react-redux';

const SimplePrintHeader = () => {
  const { hospitalInfo } = useSelector((state) => state.hospital);

  if (!hospitalInfo) return null;

  return (
    <div className="text-center space-y-1">
      <h1 className="text-xl font-bold">{hospitalInfo.name}</h1>
      <p className="text-sm">Dr. {hospitalInfo.doctorName}</p>
    </div>
  );
};

export default SimplePrintHeader; 