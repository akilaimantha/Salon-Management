import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiArrowLeft, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const SERVICES = ['Haircut', 'Coloring', 'Styling', 'Manicure', 'Pedicure', 'Makeup'];
const PACKAGES = ['Basic', 'Premium', 'Deluxe'];
const STYLISTS = ['Alice', 'Bob', 'Charlie', 'Diana'];

const EditAppointment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Add current date for validation
  const today = new Date().toISOString().split('T')[0];

  // Fetch existing appointment data
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch appointment');
        const data = await response.json();
        
        // Convert services string to array
        const servicesArray = data.services.split(', ').filter(s => s);
        
        setFormData({
          ...data,
          services: servicesArray,
          appoi_date: data.appoi_date.split('T')[0] // Format date for input
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#89198f',
        }).then(() => navigate('/customer/profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

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
      'client_name', 'client_email', 'client_phone',
      'stylist', 'appoi_date', 'appoi_time', 'services'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        text: `Please fill in: ${missingFields.join(', ')}`,
        confirmButtonColor: '#89198f',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare data for backend
      const updateData = {
        ...formData,
        services: formData.services.join(', '),
        appoi_date: new Date(formData.appoi_date).toISOString()
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update appointment');

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Appointment updated successfully',
        confirmButtonColor: '#89198f',
      }).then(() => navigate('/customer/profile'));
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-PrimaryColor to-SecondaryColor flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
      </div>
    );
  }

  return (
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
              <FiSave size={24} />
            </span>
            Edit Appointment
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
                  <option key={stylist} value={stylist}>{stylist}</option>
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
                {SERVICES.map((service) => (
                  <motion.button
                    key={service}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleServiceToggle(service)}
                    className={`w-24 h-12 rounded-lg flex items-center justify-center text-sm font-medium transition-all shadow-sm
                      ${formData.services.includes(service)
                        ? 'bg-DarkColor text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {service}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Package</label>
              <select
                name="packages"
                value={formData.packages}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
              >
                <option value="">Select Package</option>
                {PACKAGES.map((pkg) => (
                  <option key={pkg} value={pkg}>{pkg}</option>
                ))}
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
                  Updating...
                </span>
              ) : (
                'Update Appointment'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditAppointment;