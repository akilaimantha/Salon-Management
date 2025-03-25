import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const CreatePackage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    p_name: '',
    description: '',
    services: [],
    base_price: '',
    discount_rate: '',
    start_date: '',
    end_date: '',
    conditions: '',
    package_type: '',
    category: ''
  });
  const [servicesList, setServicesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Get today's date in YYYY-MM-DD format for date inputs
  const today = new Date().toISOString().split('T')[0];

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`);
        if (!response.ok) throw new Error('Failed to fetch services');
        const data = await response.json();
        setServicesList(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch services',
          confirmButtonColor: '#89198f',
        });
      }
    };
    fetchServices();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'services') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on change
    validateField(name, name === 'services' ? 
      Array.from(e.target.selectedOptions, option => option.value) : 
      value);
  };

  // Field blur handler
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  // Validate a single field
  const validateField = (fieldName, value) => {
    let newErrors = { ...errors };
    
    switch (fieldName) {
      case 'p_name':
        if (!value) newErrors.p_name = 'Package name is required';
        else if (value.length < 3) newErrors.p_name = 'Package name must be at least 3 characters';
        else if (value.length > 50) newErrors.p_name = 'Package name must be less than 50 characters';
        else delete newErrors.p_name;
        break;
      
      case 'description':
        if (!value) newErrors.description = 'Description is required';
        else if (value.length < 10) newErrors.description = 'Description must be at least 10 characters';
        else if (value.length > 500) newErrors.description = 'Description must be less than 500 characters';
        else delete newErrors.description;
        break;
      
      case 'services':
        if (!value || value.length === 0) newErrors.services = 'At least one service must be selected';
        else delete newErrors.services;
        break;
      
      case 'base_price':
        if (!value) newErrors.base_price = 'Base price is required';
        else if (isNaN(value) || parseFloat(value) < 0) newErrors.base_price = 'Base price must be a positive number';
        else delete newErrors.base_price;
        break;
      
      case 'discount_rate':
        if (!value) newErrors.discount_rate = 'Discount rate is required';
        else if (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 100) 
          newErrors.discount_rate = 'Discount rate must be between 0 and 100';
        else delete newErrors.discount_rate;
        break;
      
      case 'start_date':
        if (!value) newErrors.start_date = 'Start date is required';
        else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const startDate = new Date(value);
          if (startDate < today) newErrors.start_date = 'Start date cannot be in the past';
          else delete newErrors.start_date;
          
          // Also validate end_date in relation to start_date
          if (formData.end_date) {
            const endDate = new Date(formData.end_date);
            if (endDate < startDate) newErrors.end_date = 'End date must be after start date';
            else delete newErrors.end_date;
          }
        }
        break;
      
      case 'end_date':
        if (!value) newErrors.end_date = 'End date is required';
        else {
          const endDate = new Date(value);
          
          if (formData.start_date) {
            const startDate = new Date(formData.start_date);
            if (endDate < startDate) newErrors.end_date = 'End date must be after start date';
            else delete newErrors.end_date;
          }
        }
        break;
      
      case 'package_type':
        if (!value) newErrors.package_type = 'Package type is required';
        else delete newErrors.package_type;
        break;
      
      case 'category':
        if (!value) newErrors.category = 'Category is required';
        else if (value.length < 2) newErrors.category = 'Category must be at least 2 characters';
        else if (value.length > 30) newErrors.category = 'Category must be less than 30 characters';
        else delete newErrors.category;
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    let newErrors = {};
    let allTouched = {};
    
    // Mark all fields as touched
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
      if (!validateField(key, formData[key])) {
        isValid = false;
      }
    });
    
    setTouched(allTouched);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form',
        confirmButtonColor: '#89198f',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}`; // Assuming endpoint based on route

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create package');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Package created successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/manager/'); // Assuming manage packages route
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
            Create New Package
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Package Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Package Name</label>
              <input
                type="text"
                name="p_name"
                value={formData.p_name}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.p_name && errors.p_name ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., Summer Special"
                required
              />
              {touched.p_name && errors.p_name && (
                <p className="mt-1 text-sm text-red-500">{errors.p_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.category && errors.category ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., Spa, Wedding"
                required
              />
              {touched.category && errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Package Type</label>
              <select
                name="package_type"
                value={formData.package_type}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.package_type && errors.package_type ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              >
                <option value="" disabled>Select a package type</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
              </select>
              {touched.package_type && errors.package_type && (
                <p className="mt-1 text-sm text-red-500">{errors.package_type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Base Price</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.base_price && errors.base_price ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 100"
                min="0"
                step="0.01"
                required
              />
              {touched.base_price && errors.base_price && (
                <p className="mt-1 text-sm text-red-500">{errors.base_price}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount Rate (%)</label>
              <input
                type="number"
                name="discount_rate"
                value={formData.discount_rate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.discount_rate && errors.discount_rate ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 10"
                min="0"
                max="100"
                step="0.01"
                required
              />
              {touched.discount_rate && errors.discount_rate && (
                <p className="mt-1 text-sm text-red-500">{errors.discount_rate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={today}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.start_date && errors.start_date ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              />
              {touched.start_date && errors.start_date && (
                <p className="mt-1 text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                onBlur={handleBlur}
                min={today}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  touched.end_date && errors.end_date ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              />
              {touched.end_date && errors.end_date && (
                <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Services Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Services</label>
            <select
              multiple
              name="services"
              value={formData.services}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1 w-full p-3 rounded-lg border-2 ${
                touched.services && errors.services ? 'border-red-500' : 'border-gray-200'
              } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white h-32`}
              required
            >
              {servicesList.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category} - {service.subCategory})
                </option>
              ))}
            </select>
            {touched.services && errors.services && (
              <p className="text-sm text-red-500">{errors.services}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple services</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`mt-1 w-full p-3 rounded-lg border-2 ${
                touched.description && errors.description ? 'border-red-500' : 'border-gray-200'
              } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
              placeholder="Describe the package..."
              required
            />
            {touched.description && errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Conditions</label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
              placeholder="Any conditions or terms..."
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
                'Create Package'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreatePackage;