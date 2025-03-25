import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const CATEGORIES = ['Hair', 'Nails', 'Makeup', 'Skin'];
const SUBCATEGORIES = {
  Hair: ['Haircut', 'Coloring', 'Styling'],
  Nails: ['Manicure', 'Pedicure'],
  Makeup: ['Basic', 'Bridal', 'Special Effects'],
  Skin: ['Facial', 'Peeling']
};
const AVAILABILITY = ['Yes', 'No'];

const CreateService = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    description: '',
    duration: '',
    price: '',
    available: '',
    image: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Update fieldErrors state to include price
  const [fieldErrors, setFieldErrors] = useState({
    duration: '',
    price: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'category' ? { subCategory: '' } : {}) // Reset subcategory when category changes
    }));
    
    // Validate fields in real-time as user types
    if (name === 'duration') {
      if (value) {
        const durationValidation = validateDuration(value);
        setFieldErrors(prev => ({
          ...prev,
          duration: durationValidation.isValid ? '' : durationValidation.message
        }));
      } else {
        // Clear error if field is empty
        setFieldErrors(prev => ({
          ...prev,
          duration: ''
        }));
      }
    } else if (name === 'price') {
      if (value) {
        const priceValidation = validatePrice(value);
        setFieldErrors(prev => ({
          ...prev,
          price: priceValidation.isValid ? '' : priceValidation.message
        }));
      } else {
        // Clear error if field is empty
        setFieldErrors(prev => ({
          ...prev,
          price: ''
        }));
      }
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Add duration validation function
  const validateDuration = (duration) => {
    // Regular expression to match formats like "1h", "30m", "1h 30m", "2h 15m", etc.
    const durationRegex = /^((\d+)h\s*)?((\d+)m\s*)?$/;
    
    if (!durationRegex.test(duration)) {
      return {
        isValid: false,
        message: 'Duration must be in format "Xh Ym" (e.g., "1h 30m", "2h", "45m")'
      };
    }
    
    // Extract hours and minutes from the duration string
    const matches = duration.match(durationRegex);
    const hours = matches[2] ? parseInt(matches[2]) : 0;
    const minutes = matches[4] ? parseInt(matches[4]) : 0;
    
    // Check if both hours and minutes are provided
    if (hours === 0 && minutes === 0) {
      return {
        isValid: false,
        message: 'Duration must specify either hours, minutes, or both'
      };
    }
    
    // Check for negative values (shouldn't be possible with regex, but checking anyway)
    if (hours < 0 || minutes < 0) {
      return {
        isValid: false,
        message: 'Duration cannot contain negative values'
      };
    }
    
    return { isValid: true };
  };

  // Add price validation function
  const validatePrice = (price) => {
    // Convert to number for validation
    const numPrice = Number(price);
    
    // Check if it's a valid number
    if (isNaN(numPrice)) {
      return {
        isValid: false,
        message: 'Price must be a valid number'
      };
    }
    
    // Check if price is negative or zero
    if (numPrice <= 0) {
      return {
        isValid: false,
        message: 'Price must be greater than zero'
      };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['category', 'subCategory', 'description', 'duration', 'price', 'available'];
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

    // Validate duration format
    const durationValidation = validateDuration(formData.duration);
    if (!durationValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Duration Format',
        text: durationValidation.message,
        confirmButtonColor: '#89198f',
      });
      return;
    }

    // Also validate price on submit as a backup
    const priceValidation = validatePrice(formData.price);
    if (!priceValidation.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Price',
        text: priceValidation.message,
        confirmButtonColor: '#89198f',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare FormData for multipart/form-data request
      const serviceData = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          serviceData.append(key, formData[key]);
        }
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`; // Using service endpoint

      const response = await fetch(url, {
        method: 'POST',
        body: serviceData, // No need to set Content-Type with FormData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create service');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Service created successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/manager/');
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
            Create New Service
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                required
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {formData.category && SUBCATEGORIES[formData.category]?.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  fieldErrors.duration ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 1h 30m"
                required
              />
              {fieldErrors.duration && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.duration}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  fieldErrors.price ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 50"
                min="0"
                step="0.01"
                required
              />
              {fieldErrors.price && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Available</label>
              <select
                name="available"
                value={formData.available}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                required
              >
                <option value="">Select Availability</option>
                {AVAILABILITY.map((avail) => (
                  <option key={avail} value={avail}>{avail}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Image</label>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                accept="image/*"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
              placeholder="Describe the service..."
              required
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
                'Create Service'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateService;