import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
  FaTimes,
  FaSpinner,
  FaMobile,
} from "react-icons/fa";
import client from "../../api/axiosClient";

const AddUserPopup = ({ closePopup, refreshUsers }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    mobile: "",
    password: "",
    position: "admin",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile validation
    const mobileRegex = /^0\d{9}$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits starting with 0";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Position validation
    if (!formData.position) {
      newErrors.position = "Position is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await client.post("/api/v1/user/", {
        ...formData,
        role: "admin",
      });
      setLoading(false);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User has been added successfully.",
        confirmButtonColor: "#52b788",
      });
      refreshUsers();
      closePopup();
    } catch (error) {
      setLoading(false);
      console.error("Error adding user:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "There was an error adding the user.",
        confirmButtonColor: "#52b788",
      });
    }
  };

  const inputFields = [
    { name: "fullname", label: "Full Name", icon: FaUser },
    { name: "email", label: "Email", type: "email", icon: FaEnvelope },
    { name: "mobile", label: "Mobile Number", type: "tel", icon: FaMobile },
    { name: "password", label: "Password", type: "password", icon: FaLock },
  ];

  const colorTheme = {
    PrimaryColor: "#d8f3dc",
    SecondaryColor: "#95d5b2",
    DarkColor: "#52b788",
    ExtraDarkColor: "#1b4332",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
          style={{ backgroundColor: colorTheme.PrimaryColor }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl font-bold"
              style={{ color: colorTheme.ExtraDarkColor }}
            >
              Add New User
            </h2>
            <button
              onClick={closePopup}
              className="hover:text-opacity-70 transition duration-300"
              style={{ color: colorTheme.ExtraDarkColor }}
            >
              <FaTimes size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {inputFields.map((field) => (
              <div key={field.name} className="relative">
                <field.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.label}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition duration-300 ${
                    errors[field.name]
                      ? "border-red-500 focus:ring-red-300"
                      : "border-gray-300 focus:ring-[#52b788]"
                  }`}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                />
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
            <div className="relative">
              <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="position"
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 transition duration-300 appearance-none ${
                  errors.position
                    ? "border-red-500 focus:ring-red-300"
                    : "border-gray-300 focus:ring-[#52b788]"
                }`}
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="admin">Admin</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="package_manager">Package Manager</option>
                <option value="service_manager">Service Manager</option>
                <option value="appointment_manager">Appointment Manager</option>
              </select>
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
            </div>
            <motion.button
              type="submit"
              className="w-full text-white py-2 rounded-md transition duration-300 flex items-center justify-center"
              style={{
                backgroundColor: colorTheme.DarkColor,
                ":hover": { backgroundColor: colorTheme.ExtraDarkColor },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaUser className="mr-2" />
              )}
              {loading ? "Adding User..." : "Add User"}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddUserPopup;
