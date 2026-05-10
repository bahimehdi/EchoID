import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './routes/Login';
import Professor from './routes/Professor';
import Admin from './routes/Admin';
import { session } from './lib/api';

function RequireRole({ allowed, children }: { allowed: Array<'PROFESSOR' | 'ADMIN'>; children: JSX.Element }) {
  const u = session.user();
  if (!u) return <Navigate to="/login" replace />;
  if (!allowed.includes(u.role as 'PROFESSOR' | 'ADMIN')) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/professor/*"
        element={
          <RequireRole allowed={['PROFESSOR', 'ADMIN']}>
            <Professor />
          </RequireRole>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireRole allowed={['ADMIN']}>
            <Admin />
          </RequireRole>
        }
      />
      <Route
        path="*"
        element={<Navigate to={session.user()?.role === 'ADMIN' ? '/admin' : '/professor'} replace />}
      />
    </Routes>
  );
}
