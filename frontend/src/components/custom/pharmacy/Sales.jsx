import React, { useCallback, useState } from "react";
import SalesHeader from "./Sales/SalesHeader";
import SalesMain from "./Sales/SalesMain";
import { useDispatch } from 'react-redux';
import { setSelectedPatient } from '../../../redux/slices/patientSlice';

const Sales = () => {
  const [clearTrigger, setClearTrigger] = useState(false);
  const [shouldOpenMedicineSuggDialog, setShouldOpenMedicineSuggDialog] = useState(false);
  const dispatch = useDispatch();

  const handleClearScreen = useCallback(() => {
    setClearTrigger(prev => !prev);
    dispatch(setSelectedPatient(null))
    setShouldOpenMedicineSuggDialog(false);
  }, []);

  const handlePatientSelect = useCallback(() => {
    setShouldOpenMedicineSuggDialog(true);
  }, []);

  return (
    <div className="h-full">
      <SalesHeader 
        onClearScreen={handleClearScreen} 
        onPatientSelect={handlePatientSelect}
      />
      <SalesMain 
        clearTrigger={clearTrigger} 
        shouldOpenMedicineSuggDialog={shouldOpenMedicineSuggDialog}
        setShouldOpenMedicineSuggDialog={setShouldOpenMedicineSuggDialog}
      />
    </div>
  );
};

export default Sales;
