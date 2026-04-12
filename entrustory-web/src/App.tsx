import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { HomePage } from './pages/Home/HomePage';
import { Login } from './pages/Auth/Login';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Workspace } from './pages/Workspace/Workspace';
import { IntegrityCheck } from './pages/Verification/IntegrityCheck';
import { ActivityLog } from './pages/Logs/ActivityLog';
import { TeamManagement } from './pages/Settings/TeamManagement';
import { WorkspaceSettings } from './pages/Settings/WorkspaceSettings';
import { ApiConfig } from './pages/Settings/ApiConfig';
import { Billing } from './pages/Settings/Billing';
import { Documentation } from './pages/Docs/Documentation';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, PublicRoute } from './components/layout/AuthGuards';
import { ExportCenter } from './pages/Export/ExportCenter';
import { PublicVerify } from './pages/Verification/PublicVerify';
import { StatusPage } from './pages/Status/StatusPage';
import { CommandPalette } from './components/CommandPalette';

function App() {
  return (
    <BrowserRouter>
      {/* Global Command Palette — Cmd+K */}
      <CommandPalette />
      <SpeedInsights />

      <Routes>
        
        {/* PUBLIC ROUTES */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Route>
        
        {/* STANDALONE PUBLIC ROUTES */}
        <Route path="/docs/*" element={<Documentation />} />
        <Route path="/verify" element={<PublicVerify />} />
        <Route path="/verify/:hash" element={<PublicVerify />} />
        <Route path="/status" element={<StatusPage />} />

        {/* PROTECTED APP ROUTES */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="workspace" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="workspace/:id" element={<Workspace />} />
            <Route path="verify" element={<IntegrityCheck />} />
            <Route path="logs" element={<ActivityLog />} />
            <Route path="export" element={<ExportCenter />} />
            <Route path="team" element={<TeamManagement />} />
            <Route path="settings" element={<WorkspaceSettings />} />
            <Route path="developer" element={<ApiConfig />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
