import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import Header from './components/Header';
import ProtectedRoute from './routes/ProtectedRoute';
import CompanySelection from './components/CompanySelection';
import DashboardPage from './pages/dashboard';
import SubProject from './pages/subproject';
import AssetDetails from './components/AssetDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/select-company"
          element={
            <ProtectedRoute>
              <CompanySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subproject/:id"
          element={
            <ProtectedRoute>
              <SubProject />
            </ProtectedRoute>
          }
        />
        <Route
          path="/asset/:assetId"
          element={
            <ProtectedRoute>
              <AssetDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
