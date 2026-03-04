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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        
        {/* We redirect root /app to dashboard */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Nested Children Routes */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* If they click the Workspaces tab directly, send them to Dashboard to pick a file */}
          <Route path="workspace" element={<Navigate to="/app/dashboard" replace />} />
          {/* The actual detailed timeline route that needs an ID */}
          <Route path="workspace/:id" element={<Workspace />} />
          
          <Route path="verify" element={<IntegrityCheck />} />
          <Route path="logs" element={<ActivityLog />} />
          <Route path="team" element={<TeamManagement />} />
          <Route path="developer" element={<ApiConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
