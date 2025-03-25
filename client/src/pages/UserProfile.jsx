import React, { useState, useEffect } from "react";
import {
  User,
  Edit,
  LogOut,
  Trash2,
  Calendar,
  MessageCircle,
  Scissors,
  Palette,
  Droplet,
  Flower,
  Brush,
  Smile,
  Loader,
  ArrowLeft,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import client from "../api/axiosClient";
import { updateUser, logout } from "../features/auth/authslices";
import Navbar from "../components/Navbar";
import CreateFeedback from "./feedback/CreateFeedback";
import { useNavigate } from "react-router-dom"; // Add this import

// Background Icons Component
const BackgroundIcons = () => {
  const [backgroundIcons, setBackgroundIcons] = useState([]);

  useEffect(() => {
    const icons = [Scissors, Palette, Droplet, Flower, Brush, Smile];
    const generateBackgroundIcons = () => {
      const newBackgroundIcons = Array(15)
        .fill()
        .map(() => ({
          Icon: icons[Math.floor(Math.random() * icons.length)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 5,
          duration: Math.random() * 5 + 3,
          size: Math.random() * 30 + 20,
        }));
      setBackgroundIcons(newBackgroundIcons);
    };

    generateBackgroundIcons();
  }, []);

  return (
    <>
      {backgroundIcons.map((item, index) => (
        <div
          key={index}
          className="absolute opacity-30 animate-float"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
          }}
        >
          <item.Icon size={item.size} className="text-[#52b788]" />
        </div>
      ))}
    </>
  );
};

// Appointments Component
const AppointmentsSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  // Remove editingAppointment and editedAppointment state as we'll navigate to another page

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Use the correct endpoint as defined in apiConfig
        const response = await client.get(`/api/v1/appoiment/user/${user._id}`);
        setAppointments(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again later.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchAppointments();
    }
  }, [user]);

  const handleEditClick = (appointment) => {
    // Navigate to EditAppointment page with the appointment ID
    navigate(`/appointment/edit/${appointment._id}`);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await client.delete(`/api/v1/appoiment/${id}`);
      
      // Remove the deleted appointment from the list
      setAppointments(appointments.filter(app => app._id !== id));
      
      toast.success("Appointment deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete appointment", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center justify-center min-h-[200px]">
        <Loader className="animate-spin text-[#52b788] mb-4" size={32} />
        <p className="text-[#1b4332]">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 z-20">
        <div className="flex items-center mb-4">
          <Calendar className="mr-3 text-[#52b788]" />
          <h2 className="text-2xl font-bold text-[#1b4332]">My Appointments</h2>
        </div>
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 z-20">
      <div className="flex items-center mb-4">
        <Calendar className="mr-3 text-[#52b788]" />
        <h2 className="text-2xl font-bold text-[#1b4332]">My Appointments</h2>
      </div>
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="bg-[#d8f3dc] p-4 rounded-lg text-center">
            <p className="text-[#1b4332]">You don't have any appointments yet.</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-[#d8f3dc] p-4 rounded-lg hover:bg-[#95d5b2] transition-colors"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#1b4332]">
                    {appointment.services || appointment.service || "Service"}
                  </p>
                  <p className="text-sm text-[#52b788]">
                    {appointment.appoi_date || appointment.date} at {appointment.appoi_time || appointment.time}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm 
                      ${
                        appointment.status === "Confirmed"
                          ? "bg-green-100 text-green-800"
                          : appointment.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    `}
                  >
                    {appointment.status || "Processing"}
                  </span>
                  <button
                    onClick={() => handleEditClick(appointment)}
                    className="p-1 text-[#1b4332] hover:text-[#52b788] transition-colors"
                    title="Edit appointment"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(appointment._id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete appointment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {/* Delete confirmation dialog */}
              {showDeleteConfirm === appointment._id && (
                <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-2">Are you sure you want to delete this appointment?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelDelete}
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(appointment._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Feedback Component
const FeedbackSection = () => {
  const { user } = useSelector((state) => state.auth);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  // Remove editingFeedback and editedFeedback state as we'll navigate to another page

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        // Use the correct endpoint as defined in apiConfig
        const response = await client.get(`/api/v1/feedback/user/${user._id}`);
        setFeedbacks(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load feedback. Please try again later.");
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };

    if (user && user._id) {
      fetchFeedbacks();
    }
  }, [user]);

  const handleEditClick = (feedback) => {
    // Navigate to EditFeedback page with the feedback ID
    navigate(`/feedback/edit/${feedback._id}`);
  };

  const handleDeleteClick = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await client.delete(`/api/v1/feedback/${id}`);
      
      // Remove the deleted feedback from the list
      setFeedbacks(feedbacks.filter(fb => fb._id !== id));
      
      toast.success("Feedback deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setShowDeleteConfirm(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete feedback", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill()
      .map((_, index) => (
        <span
          key={index}
          className={`text-xl ${
            index < rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 z-20 flex flex-col items-center justify-center min-h-[200px]">
        <Loader className="animate-spin text-[#52b788] mb-4" size={32} />
        <p className="text-[#1b4332]">Loading your feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 z-20">
        <div className="flex items-center mb-4">
          <MessageCircle className="mr-3 text-[#52b788]" />
          <h2 className="text-2xl font-bold text-[#1b4332]">My Feedback</h2>
        </div>
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 z-20">
      <div className="flex items-center mb-4">
        <MessageCircle className="mr-3 text-[#52b788]" />
        <h2 className="text-2xl font-bold text-[#1b4332]">My Feedback</h2>
      </div>
      <div className="space-y-4">
        {feedbacks.length === 0 ? (
          <div className="bg-[#d8f3dc] p-4 rounded-lg text-center">
            <p className="text-[#1b4332]">You haven't submitted any feedback yet.</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              className="bg-[#d8f3dc] p-4 rounded-lg hover:bg-[#95d5b2] transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-[#1b4332]">
                  {feedback.service || feedback.serviceID || "Service"}
                </h3>
                <div className="flex items-center">
                  <p className="text-sm text-[#52b788] mr-2">
                    {feedback.date_of_service || feedback.date || new Date(feedback.createdAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => handleEditClick(feedback)}
                    className="p-1 text-[#1b4332] hover:text-[#52b788] transition-colors"
                    title="Edit feedback"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(feedback._id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Delete feedback"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mb-2">{renderStars(feedback.star_rating || feedback.rating || 0)}</div>
              <p className="text-[#1b4332] opacity-80">{feedback.message || feedback.comment}</p>
              
              {/* Delete confirmation dialog */}
              {showDeleteConfirm === feedback._id && (
                <div className="mt-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 mb-2">Are you sure you want to delete this feedback?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleCancelDelete}
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleConfirmDelete(feedback._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Profile Page Component
const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedProfile({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await client.put(
        `/api/v1/user/${user._id}`,
        editedProfile
      );

      dispatch(updateUser(response.data));

      toast.success("Profile updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("token");
      dispatch(logout());
      toast.success("Signed out successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to sign out", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleGiveFeedback = () => {
    navigate("/feedback/Createfeedback"); // Navigate to the desired page
  };

  const confirmDelete = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await client.delete(`/api/v1/user/${user._id}`);
      localStorage.removeItem("token");
      dispatch(logout());
      toast.success("Account deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete account", {
        position: "top-right",
        autoClose: 3000,
      });
    }
    setShowConfirmation(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      < bar />
      <div className="relative min-h-screen bg-[#d8f3dc] flex items-center justify-center p-4 overflow-hidden">
        <ToastContainer />
        <BackgroundIcons />

        {/* Back Button */}
        <button 
          onClick={handleGoBack}
          className="absolute top-4 left-4 z-30 bg-white p-2 rounded-full shadow-md hover:bg-[#95d5b2] transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-[#1b4332]" />
        </button>

        <div className="container mx-auto grid grid-cols-3 gap-6">
          {/* Profile Card - 1/3 Width */}
          <div className="col-span-1 z-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-[#52b788] p-6 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-[#1b4332] text-white rounded-full flex items-center justify-center">
                  <User size={48} />
                </div>
                <h2 className="text-2xl font-bold text-[#1b4332]">
                  {user?.name}
                </h2>
                <p className="text-[#1b4332] opacity-80">{user?.role}</p>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#52b788]"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          email: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#52b788]"
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          phone: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-[#52b788]"
                      placeholder="Phone Number"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 text-[#1b4332]">
                    <div>
                      <label className="block text-sm font-medium opacity-70">
                        Email
                      </label>
                      <p className="text-lg">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium opacity-70">
                        Phone
                      </label>
                      <p className="text-lg">{user?.phone}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center justify-center p-3 bg-[#95d5b2] text-[#1b4332] rounded-lg hover:bg-[#52b788] transition-colors"
                  >
                    <Edit size={20} className="mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </button>

                  {isEditing ? (
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center justify-center p-3 bg-[#52b788] text-white rounded-lg hover:bg-[#1b4332] transition-colors"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={handleSignOut}
                      className="flex items-center justify-center p-3 bg-[#95d5b2] text-[#1b4332] rounded-lg hover:bg-[#52b788] transition-colors"
                    >
                      <LogOut size={20} className="mr-2" />
                      Sign Out
                    </button>
                  )}

                  <button
                    onClick={confirmDelete}
                    className="flex items-center justify-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={20} className="mr-2" />
                    Delete
                  </button>
                </div>

                {/* Give Feedback Button */}
                <div className="mt-4">
                  <button
                    onClick={handleGiveFeedback}
                    className="w-full flex items-center justify-center p-3 bg-[#52b788] text-white rounded-lg hover:bg-[#1b4332] transition-colors"
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Give Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - 2/3 Width */}
          <div className="col-span-2 space-y-6 z-10">
            <AppointmentsSection />
            <FeedbackSection />
          </div>
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-red-100 rounded-full p-4">
                    <Trash2 size={48} className="text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Delete Account
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you absolutely sure you want to delete your account? This
                  action is permanent and cannot be undone. All your data,
                  appointments, and personal information will be permanently
                  erased.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleCancelDelete}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
