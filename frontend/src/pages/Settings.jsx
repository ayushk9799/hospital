import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Settings() {
  const navigate = useNavigate();

  const handleAddStaff = () => {
    navigate('/addstaff');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <Button onClick={handleAddStaff}>Add Staff</Button>
      {/* Other settings content */}
    </div>
  );
}
