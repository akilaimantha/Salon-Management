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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'p_name',
      'description',
      'services',
      'base_price',
      'discount_rate',
      'start_date',
      'end_date',
      'package_type',
      'category'
    ];
    const missingFields = requiredFields.filter(field => {
      if (field === 'services') return formData.services.length === 0;
      return !formData[field];
    });

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
        navigate('/manager/packages'); // Assuming manage packages route
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
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., Summer Special"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., Spa, Wedding"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Package Type</label>
              <input
                type="text"
                name="package_type"
                value={formData.package_type}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., Standard, Premium"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Base Price</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., 100"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount Rate (%)</label>
              <input
                type="number"
                name="discount_rate"
                value={formData.discount_rate}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., 10"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                required
              />
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
              className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white h-32"
              required
            >
              {servicesList.map(service => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category} - {service.subCategory})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Hold Ctrl (or Cmd) to select multiple services</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
              placeholder="Describe the package..."
              required
            />
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