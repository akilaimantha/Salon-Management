import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const EditPackage = () => {
  const navigate = useNavigate();
  const { packageId } = useParams(); // Get packageId from URL
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
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    p_name: '',
    description: '',
    services: '',
    base_price: '',
    discount_rate: '',
    start_date: '',
    end_date: '',
    package_type: '',
    category: ''
  });

  // Validation functions
  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'p_name':
        if (!value.trim()) {
          errorMessage = 'Package name is required';
        } else if (value.length < 3) {
          errorMessage = 'Package name must be at least 3 characters';
        } else if (value.length > 50) {
          errorMessage = 'Package name must be less than 50 characters';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errorMessage = 'Description is required';
        } else if (value.length < 10) {
          errorMessage = 'Description must be at least 10 characters';
        }
        break;
        
      case 'services':
        if (!value || value.length === 0) {
          errorMessage = 'At least one service must be selected';
        }
        break;
        
      case 'base_price':
        if (!value) {
          errorMessage = 'Base price is required';
        } else if (isNaN(value) || Number(value) < 0) {
          errorMessage = 'Base price must be a positive number';
        }
        break;
        
      case 'discount_rate':
        if (!value) {
          errorMessage = 'Discount rate is required';
        } else if (isNaN(value) || Number(value) < 0 || Number(value) > 100) {
          errorMessage = 'Discount rate must be between 0 and 100';
        }
        break;
        
      case 'start_date':
        if (!value) {
          errorMessage = 'Start date is required';
        } else if (new Date(value) < new Date().setHours(0, 0, 0, 0)) {
          errorMessage = 'Start date cannot be in the past';
        }
        break;
        
      case 'end_date':
        if (!value) {
          errorMessage = 'End date is required';
        } else if (formData.start_date && new Date(value) <= new Date(formData.start_date)) {
          errorMessage = 'End date must be after start date';
        }
        break;
        
      case 'package_type':
        if (!value) {
          errorMessage = 'Package type is required';
        }
        break;
        
      case 'category':
        if (!value.trim()) {
          errorMessage = 'Category is required';
        }
        break;
        
      default:
        break;
    }
    
    return errorMessage;
  };

  // Validate all fields
  const validateForm = () => {
    let valid = true;
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'conditions') { // conditions is optional
        const error = validateField(key, formData[key]);
        newErrors[key] = error;
        if (error) valid = false;
      }
    });
    
    setErrors(newErrors);
    return valid;
  };

  // Fetch package and services data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch package data
        const packageResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}/${packageId}`);
        if (!packageResponse.ok) throw new Error('Failed to fetch package');

        const packageData = await packageResponse.json();

        // Fetch services data
        const servicesResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`);
        if (!servicesResponse.ok) throw new Error('Failed to fetch services');

        const servicesData = await servicesResponse.json();

        // Pre-fill form data
        setFormData({
          ...packageData,
          services: packageData.services.map(service => service._id), // Extract service IDs
          start_date: packageData.start_date.split('T')[0], // Format date
          end_date: packageData.end_date.split('T')[0] // Format date
        });
        setServicesList(servicesData);
        setIsLoading(false);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#89198f',
        });
        navigate('/manager/packages'); // Redirect to packages page on error
      }
    };

    fetchData();
  }, [packageId, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue;
    
    if (name === 'services') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      newValue = selectedOptions;
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      newValue = value;
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Validate field on change
    const error = validateField(name, newValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
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

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}/${packageId}`; // Update endpoint

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update package');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Package updated successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/manager/Service-management', { state: { activeTab: 'managePackage' } });
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-PrimaryColor to-SecondaryColor flex items-center justify-center">
        <div className="text-white text-2xl">Loading package data...</div>
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
            Edit Package
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
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.p_name ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., Summer Special"
                required
              />
              {errors.p_name && <p className="text-red-500 text-sm mt-1">{errors.p_name}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.category ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., Spa, Wedding"
                required
              />
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Package Type</label>
              <select
                name="package_type"
                value={formData.package_type}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.package_type ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              >
                <option value="" disabled>Select a package type</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
              </select>
              {errors.package_type && <p className="text-red-500 text-sm mt-1">{errors.package_type}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Base Price</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.base_price ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 100"
                min="0"
                step="0.01"
                required
              />
              {errors.base_price && <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount Rate (%)</label>
              <input
                type="number"
                name="discount_rate"
                value={formData.discount_rate}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.discount_rate ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 10"
                min="0"
                max="100"
                step="0.01"
                required
              />
              {errors.discount_rate && <p className="text-red-500 text-sm mt-1">{errors.discount_rate}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.start_date ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              />
              {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.end_date ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                required
              />
              {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
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
              className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.services ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white h-32`}
              required
            >
              {servicesList.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category} - {service.subCategory})
                </option>
              ))}
            </select>
            {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple services</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`mt-1 w-full p-3 rounded-lg border-2 ${errors.description ? 'border-red-500' : 'border-gray-200'} focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
              placeholder="Describe the package..."
              required
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Conditions</label>
            <textarea
              name="conditions"
              value={formData.conditions}
              onChange={handleInputChange}
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
                  Updating...
                </span>
              ) : (
                'Update Package'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditPackage;