// In your routes file
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoutes";
import LoginPage from "../pages/auth/Login";
import SignupPage from "../pages/auth/SignUp";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import CreateAppontment from "../pages/appointment/CreateAppontment";
import CreateFeedback from "../pages/feedback/CreateFeedback";
import Editfeedback from "../pages/feedback/EditFeedback";
import Home from "../pages/Home";
import ProfilePage from "../pages/UserProfile";
import EditAppointment from "../pages/appointment/EditAppointment";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/manager/*" element={<DashboardLayout />} />
      <Route path="/appointment/CreateAppontment" element={<CreateAppontment />} />
      <Route path="/appointment/edit/:id" element={<EditAppointment />} />
      <Route path="/feedback/Createfeedback" element={<CreateFeedback />} />
      <Route path="/feedback/edit/:id" element={<Editfeedback />} />
      <Route
        path="/customer/*"
        element={
          <ProtectedRoute allowedRoles={["customer"]}>
            <Routes>
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Routes>
              {/* <Route path="/*" element={<DashboardLayout />} /> */}
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
