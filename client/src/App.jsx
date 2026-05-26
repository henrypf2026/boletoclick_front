import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/protected-route/protected-route';
import Landing from './pages/landing/landing';
import Login from './pages/login/login';
import Register from './pages/register/register';
import EventDetail from './pages/event-detail/event-detail';
import MyTickets from './pages/my-tickets/my-tickets';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/evento/:id" element={<EventDetail />} />
          <Route
            path="/mis-entradas"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
