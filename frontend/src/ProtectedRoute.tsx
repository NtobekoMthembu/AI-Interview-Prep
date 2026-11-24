import { Navigate } from 'react-router-dom';
import type { User } from './services/api';

interface Props {
  user: User | null;
  checking: boolean;
  children: React.ReactNode;
}

export default function ProtectedRoute({ user, checking, children }: Props) {
  if (checking) {
    return (
      <div className="min-h-screen bg-[#101826] flex items-center justify-center text-[#8891A6]">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}