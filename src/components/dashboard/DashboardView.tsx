import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { DirectorDashboard } from './DirectorDashboard';
import { AccountantDashboard } from './AccountantDashboard';

export const DashboardView: React.FC = () => {
  const { currentUser } = useCRM();

  // If role is BUXGALTER, show accountant-specific dashboard; else show executive director/admin view
  if (currentUser.role === 'BUXGALTER') {
    return <AccountantDashboard />;
  }

  return <DirectorDashboard />;
};
