import { store } from '../redux/store';

export const hasPermission = (permission) => {
  if (!permission) return true; // If no permission is required, allow access

  const state = store.getState();
  const userData = state.user.userData;

  // A super admin has all permissions implicitly
  if (userData?.isSuperAdmin) return true;
  
  return userData?.permissions?.includes(permission) || false;
}; 