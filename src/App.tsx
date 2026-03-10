import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/Home/HomePage';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workspace } from './pages/Workspace/Workspace';
import { IntegrityCheck } from './pages/Verification/IntegrityCheck';
import { ActivityLog } from './pages/Logs/ActivityLog';
import { TeamManagement } from './pages/Settings/TeamManagement';
import { ApiConfig } from './pages/Settings/ApiConfig';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './components/layout/AuthGuards';
import { Billing } from './pages/Settings/Billing';
import { WorkspaceSettings } from './pages/Settings/WorkspaceSettings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Route>
        
        {/* PROTECTED APP ROUTES */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workspace" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="workspace/:id" element={<Workspace />} />
            <Route path="verify" element={<IntegrityCheck />} />
            <Route path="logs" element={<ActivityLog />} />
            <Route path="settings" element={<WorkspaceSettings />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="developer" element={<ApiConfig />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
