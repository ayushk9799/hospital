import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-lg text-gray-600 mb-6">You do not have the required permissions to view this page.</p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Link to="/">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 