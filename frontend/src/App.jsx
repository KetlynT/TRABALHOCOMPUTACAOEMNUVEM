import { Routes, Route } from 'react-router-dom';
import ProtectedLayout from './components/ProtectedLayout';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import ActivityLogPage from './pages/ActivityLogPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="project/:projectId" element={<ProjectPage />} />
        <Route path="project/:projectId/activity" element={<ActivityLogPage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;