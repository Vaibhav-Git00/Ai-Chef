import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ToastProvider from "./contexts/ToastContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import MealPlanner from "./pages/MealPlanner";
import History from "./pages/History";
import Upload from "./pages/Upload";
import Recipes from "./pages/Recipes";
import Nutrition from "./pages/Nutrition";
import Settings from "./pages/Settings";
import Recipe from "./pages/Recipe";
import authService from "./services/authService";

// Protected Route Component
function ProtectedRoute({ element }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? element : <Navigate to="/" replace />;
}

// Auth Route Component (redirect to dashboard if already logged in)
function AuthRoute({ element }) {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthRoute element={<Auth />} />} />
          <Route path="/" element={<AuthRoute element={<Auth />} />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/preferences" element={<ProtectedRoute element={<Preferences />} />} />
          <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
          <Route path="/history" element={<ProtectedRoute element={<History />} />} />

          {/* Protected Feature Routes */}
          <Route path="/upload" element={<ProtectedRoute element={<Upload />} />} />
          <Route path="/recipes" element={<ProtectedRoute element={<Recipes />} />} />
          <Route path="/nutrition" element={<ProtectedRoute element={<Nutrition />} />} />
          <Route path="/meal-planner" element={<ProtectedRoute element={<MealPlanner />} />} />

          {/* Legacy Routes (for backward compatibility) */}
          <Route path="/mealplan" element={<ProtectedRoute element={<MealPlanner />} />} />
          <Route path="/recipe" element={<ProtectedRoute element={<Recipe />} />} />

          {/* Catch all - redirect to dashboard if authenticated, else to auth */}
          <Route
            path="*"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
