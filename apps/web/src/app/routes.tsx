import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../features/landing/LandingPage';
import { CallbackPage } from '../features/auth/CallbackPage';
import { WorkspacePage } from '../features/workspace/WorkspacePage';
import { ProtectedRoute } from '../lib/auth/ProtectedRoute';

export const AppRouter = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LandingPage />} />
    <Route path="/callback" element={<CallbackPage />} />
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <WorkspacePage />
        </ProtectedRoute>
      }
    />
  </Routes>
);
