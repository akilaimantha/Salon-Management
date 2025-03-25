import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import Navbar from '../../components/Navbar';
import { logout } from '../../features/auth/authslices';

const STYLISTS = ['Alice', 'Bob', 'Charlie', 'Diana'];

const CreateAppointment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState({
    services: true,
    packages: true
  });
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    stylist: '',
    customize_package: '',
    appoi_date: '',
    appoi_time: '',
    services: [],
    packages: '',
    user_id: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Add current date for validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch services and packages when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`);
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        // Check data structure and extract services properly
        if (data && (data.services || data.data || Array.isArray(data))) {
          // Handle different possible response formats
          const servicesList = data.services || data.data || data;
          setServices(Array.isArray(servicesList) ? servicesList : []);
          console.log("Services fetched:", servicesList);
        } else {
          console.error('Unexpected service data format:', data);
          setServices(['Haircut', 'Coloring', 'Styling', 'Manicure', 'Pedicure', 'Makeup']);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to default services if API fails
        setServices(['Haircut', 'Coloring', 'Styling', 'Manicure', 'Pedicure', 'Makeup']);
      } finally {
        setLoading(prev => ({ ...prev, services: false }));
      }
    };

    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}`);
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        // Check data structure and extract packages properly
        if (data && (data.packages || data.data || Array.isArray(data))) {
          // Handle different possible response formats
          const packagesList = data.packages || data.data || data;
          setPackages(Array.isArray(packagesList) ? packagesList : []);
          console.log("Packages fetched:", packagesList);
        } else {
          console.error('Unexpected package data format:', data);
          setPackages(['Basic', 'Premium', 'Deluxe']);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        // Fallback to default packages if API fails
        setPackages(['Basic', 'Premium', 'Deluxe']);
      } finally {
        setLoading(prev => ({ ...prev, packages: false }));
      }
    };

    fetchServices();
    fetchPackages();
  }, []);

  // Handle logout function
  const handleLogout = () => {
    dispatch(logout());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validation for client name - prevent numbers
    if (name === 'client_name') {
      // Only allow letters, spaces and some special characters
      const nameValue = value.replace(/[0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: nameValue }));
      return;
    }
    
    // Validation for phone - only numbers, max 10 digits
    if (name === 'client_phone') {
      // Only allow numbers and restrict to 10 digits
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: phoneValue }));
      return;
    }
    
    // Time validation if date is today
    if (name === 'appoi_time' && formData.appoi_date === today) {
      const now = new Date();
      const selectedTime = new Date(`${formData.appoi_date}T${value}`);
      
      // If selected time is in the past, don't update
      if (selectedTime < now) {
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate time whenever date changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    // Clear time if date is today and current time is already past
    if (value === today && formData.appoi_time) {
      const now = new Date();
      const [hours, minutes] = formData.appoi_time.split(':');
      const selectedTime = new Date();
      selectedTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      
      if (selectedTime < now) {
        setFormData((prev) => ({ ...prev, appoi_time: '', [name]: value }));
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'client_name',
      'client_email',
      'client_phone',
      'stylist',
      'appoi_date',
      'appoi_time',
      'services',
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Required Fields Missing',
        text: `Please fill in: ${missingFields.join(', ')}`,
        confirmButtonColor: '#89198f',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the data to send
      const appointmentData = {
        ...formData,
        user_id: user._id, // Use the user's ID from the Redux store
        services: formData.services.join(', '), // Convert array to string
      };

      // Use API_CONFIG to construct the URL
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}`;

      // Send the request to the backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create appointment');

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Appointment created successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/'); // Redirect to appointments page
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-PrimaryColor to-SecondaryColor p-8"
      >
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-PrimaryColor text-DarkColor rounded-full hover:bg-SecondaryColor transition-all"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-extrabold text-ExtraDarkColor flex items-center">
              <span className="mr-3 bg-DarkColor text-white p-2 rounded-full">
                <FiPlus size={24} />
              </span>
              Create New Appointment
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Client Name</label>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                  placeholder="e.g., John Doe"
                  required
                  pattern="^[A-Za-z\s.'-]+$"
                  title="Name cannot contain numbers"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Client Email</label>
                <input
                  type="email"
                  name="client_email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                  placeholder="e.g., john.doe@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Client Phone</label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                  placeholder="10-digit number only"
                  required
                  pattern="[0-9]{10}"
                  title="Phone number must be exactly 10 digits"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Stylist</label>
                <select
                  name="stylist"
                  value={formData.stylist}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                  required
                >
                  <option value="">Select Stylist</option>
                  {STYLISTS.map((stylist) => (
                    <option key={stylist} value={stylist}>
                      {stylist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Appointment Date</label>
                <input
                  type="date"
                  name="appoi_date"
                  value={formData.appoi_date}
                  onChange={handleDateChange}
                  min={today}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Appointment Time</label>
                <input
                  type="time"
                  name="appoi_time"
                  value={formData.appoi_time}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                  required
                />
                {formData.appoi_date === today && (
                  <p className="text-xs text-red-500 mt-1">
                    Selected time must be in the future
                  </p>
                )}
              </div>
            </div>

            {/* Services and Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Services</label>
                <div className="flex flex-wrap gap-3">
                  {loading.services ? (
                    <div className="w-full text-center py-4">
                      <span className="text-PrimaryColor">Loading services...</span>
                    </div>
                  ) : services.length === 0 ? (
                    <div className="w-full text-center py-4">
                      <span className="text-red-500">No services available</span>
                    </div>
                  ) : (
                    services.map((service) => {
                      // Handle different service data formats
                      const serviceId = typeof service === 'object' ? (service._id || service.id || service.name) : service;
                      const serviceName = typeof service === 'object' ? (service.category || service.price || service.service || serviceId) : service;
                      
                      return (
                        <motion.button
                          key={serviceId}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleServiceToggle(serviceName)}
                          className={`w-auto min-w-24 px-3 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all shadow-sm
                            ${
                              formData.services.includes(serviceName)
                                ? 'bg-DarkColor text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                          {serviceName}
                        </motion.button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Package</label>
                <select
                  name="packages"
                  value={formData.packages}
                  onChange={handleInputChange}
                  className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                  disabled={loading.packages}
                >
                  <option value="">Select Package</option>
                  {loading.packages ? (
                    <option disabled>Loading packages...</option>
                  ) : packages.length === 0 ? (
                    <option disabled>No packages available</option>
                  ) : (
                    packages.map((pkg) => {
                      // Handle different package data formats
                      const pkgId = typeof pkg === 'object' ? (pkg._id || pkg.id || pkg.name) : pkg;
                      const pkgName = typeof pkg === 'object' ? (pkg.category || pkg.title || pkg.package || pkgId) : pkg;
                      
                      return (
                        <option key={pkgId} value={pkgName}>
                          {pkgName}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>
            </div>

            {/* Customize Package */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Customize Package</label>
              <textarea
                name="customize_package"
                value={formData.customize_package}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="Describe your custom package..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-DarkColor to-ExtraDarkColor text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:from-ExtraDarkColor hover:to-DarkColor transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Appointment'
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
};

export default CreateAppointment;

