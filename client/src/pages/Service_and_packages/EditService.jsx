import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
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

const EditService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState({
    category: '',
    subCategory: '',
    description: '',
    duration: '',
    price: '',
    available: '',
    image: null
  });
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // Add validation state
  const [validationErrors, setValidationErrors] = useState({
    category: '',
    subCategory: '',
    description: '',
    duration: '',
    price: '',
    available: '',
    image: ''
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Fetch service data when the component mounts
  useEffect(() => {
    const fetchService = async () => {
      try {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}/${id}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch service');
        setService(data);
        setImagePreview(data.image ? `${API_CONFIG.BASE_URL}${data.image}` : null);
      } catch (err) {
        setError(err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message,
          confirmButtonColor: '#89198f',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  // Validate the entire form
  useEffect(() => {
    const validateForm = () => {
      const errors = { ...validationErrors };
      
      // Validate required fields
      if (!service.category) errors.category = 'Category is required';
      else errors.category = '';
      
      if (!service.subCategory) errors.subCategory = 'Subcategory is required';
      else errors.subCategory = '';
      
      if (!service.description) errors.description = 'Description is required';
      else if (service.description.length < 10) errors.description = 'Description must be at least 10 characters';
      else errors.description = '';
      
      if (!service.duration) errors.duration = 'Duration is required';
      else if (!/^(\d+h)?\s*(\d+m)?$/.test(service.duration.trim())) 
        errors.duration = 'Duration format should be like "1h 30m" or "45m"';
      else errors.duration = '';
      
      if (!service.price) errors.price = 'Price is required';
      else if (isNaN(service.price) || parseFloat(service.price) <= 0) 
        errors.price = 'Price must be a positive number';
      else errors.price = '';
      
      if (!service.available) errors.available = 'Availability status is required';
      else errors.available = '';
      
      setValidationErrors(errors);
      
      // Form is valid if there are no error messages
      const valid = Object.values(errors).every(error => error === '');
      setIsFormValid(valid);
    };
    
    validateForm();
  }, [service]);

  // Handle changes to text inputs and select fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({ 
      ...prev, 
      [name]: value,
      ...(name === 'category' ? { subCategory: '' } : {}) // Reset subcategory when category changes
    }));
  };

  // Handle image file selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Validate image
    if (file) {
      // Check file type
      if (!file.type.match('image.*')) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Please select an image file (jpg, png, etc)'
        }));
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }
      
      setValidationErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
    
    setNewImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if form is invalid
    if (!isFormValid) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting',
        confirmButtonColor: '#89198f',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      for (const key in service) {
        if (service[key] !== null) {
          formData.append(key, service[key]);
        }
      }
      if (newImage) {
        formData.append('image', newImage);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update service');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Service updated successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/manager/Service-management');
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
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
          <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Edit Service</h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-DarkColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Category</label>
                <select
                  name="category"
                  value={service.category}
                  onChange={handleChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.category ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white`}
                  required
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                <select
                  name="subCategory"
                  value={service.subCategory}
                  onChange={handleChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.subCategory ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white`}
                  required
                  disabled={!service.category}
                >
                  <option value="">Select Subcategory</option>
                  {service.category && SUBCATEGORIES[service.category]?.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                {validationErrors.subCategory && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.subCategory}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={service.duration}
                  onChange={handleChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.duration ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                  placeholder="e.g., 1h 30m"
                  required
                />
                {validationErrors.duration && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  value={service.price}
                  onChange={handleChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.price ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                  placeholder="e.g., 50"
                  min="0"
                  step="0.01"
                  required
                />
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Available</label>
                <select
                  name="available"
                  value={service.available}
                  onChange={handleChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.available ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white`}
                  required
                >
                  <option value="">Select Availability</option>
                  {AVAILABILITY.map((avail) => (
                    <option key={avail} value={avail}>{avail}</option>
                  ))}
                </select>
                {validationErrors.available && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.available}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                  className={`mt-1 w-full p-3 rounded-lg border-2 ${
                    validationErrors.image ? 'border-red-500' : 'border-gray-200'
                  } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                  accept="image/*"
                />
                {validationErrors.image && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.image}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                value={service.description}
                onChange={handleChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  validationErrors.description ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="Describe the service..."
                required
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <label className="block text-sm font-semibold text-gray-700">Image Preview</label>
                <img
                  src={imagePreview}
                  alt="Service Preview"
                  className="mt-2 w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <motion.button
                type="submit"
                disabled={isSubmitting || !isFormValid}
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
                  'Update Service'
                )}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default EditService;