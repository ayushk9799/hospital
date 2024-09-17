import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Settings() {
  const navigate = useNavigate();

  const handleAddStaff = () => {
    navigate('/addstaff');
  };

  const handleCreateRoom = () => {
    navigate('/create-room');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-x-4">
        <Button onClick={handleAddStaff}>Add Staff</Button>
        <Button onClick={handleCreateRoom}>Create Room</Button>
      </div>
      {/* Other settings content */}
    </div>
  );
}
