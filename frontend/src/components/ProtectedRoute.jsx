import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasPermission } from '../lib/permissions';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, permission }) => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const userHasPermission = hasPermission(permission);

  useEffect(() => {
    // We wait for userData to be populated before checking permissions
    if (userData && !userHasPermission) {
      navigate('/unauthorized', { replace: true });
    }
  }, [userData, userHasPermission, navigate]);

  // Render nothing while we wait for user data or if permission is denied
  if (!userData || !userHasPermission) {
    return null;
  }

  return children;
};

export default ProtectedRoute; 