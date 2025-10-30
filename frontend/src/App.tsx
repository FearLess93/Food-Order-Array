import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { Voting } from './pages/Voting';
import { Menu } from './pages/Menu';
import { GroupOrder } from './pages/GroupOrder';
import { AdminDashboard } from './pages/AdminDashboard';
import { Layout } from './components/Layout';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<VerifyEmail />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/voting" replace />} />
            <Route path="voting" element={<Voting />} />
            <Route path="menu/:restaurantId" element={<Menu />} />
            <Route path="group-order" element={<GroupOrder />} />
            {user?.role === 'admin' && (
              <Route path="admin" element={<AdminDashboard />} />
            )}
            <Route path="*" element={<Navigate to="/voting" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
