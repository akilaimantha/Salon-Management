import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const CATEGORIES = ['Hair Products', 'Makeup', 'Nail Care', 'Skincare', 'Tools & Accessories'];

const CreateInventory = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ItemName: '',
    Category: '',
    Quantity: '',
    Price: '',
    SupplierName: '',
    SupplierEmail: '',
  });

  const [errors, setErrors] = useState({
    Quantity: '',
    Price: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'Quantity':
        if (value === '') return '';
        if (!/^\d+$/.test(value)) return 'Quantity must be a whole number';
        if (parseInt(value) <= 0) return 'Quantity must be greater than 0';
        if (parseInt(value) > 10000) return 'Quantity cannot exceed 10,000';
        return '';
      case 'Price':
        if (value === '') return '';
        if (!/^\d+(\.\d{0,2})?$/.test(value)) return 'Price must be a number with up to 2 decimal places';
        if (parseFloat(value) <= 0) return 'Price must be greater than 0';
        if (parseFloat(value) > 100000) return 'Price cannot exceed 100,000';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate fields that have validation rules
    if (['Quantity', 'Price'].includes(name)) {
      const errorMessage = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for validation errors
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting',
        confirmButtonColor: '#89198f',
      });
      return;
    }

    const requiredFields = ['ItemName', 'Category', 'Quantity', 'Price', 'SupplierName', 'SupplierEmail'];
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

      // Use API_CONFIG to construct the URL
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`;

      // Send the request to the backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to create inventory item');

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Inventory item created successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/manager/inventory-management'); // Redirect to inventory page
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
            Create New Inventory Item
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Item Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Item Name</label>
              <input
                type="text"
                name="ItemName"
                value={formData.ItemName}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., Shampoo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <select
                name="Category"
                value={formData.Category}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor bg-white"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Quantity</label>
              <input
                type="text"
                name="Quantity"
                value={formData.Quantity}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  errors.Quantity ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 50"
                required
              />
              {errors.Quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.Quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Price</label>
              <input
                type="text"
                name="Price"
                value={formData.Price}
                onChange={handleInputChange}
                className={`mt-1 w-full p-3 rounded-lg border-2 ${
                  errors.Price ? 'border-red-500' : 'border-gray-200'
                } focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor`}
                placeholder="e.g., 25.99"
                required
              />
              {errors.Price && (
                <p className="mt-1 text-sm text-red-600">{errors.Price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Supplier Name</label>
              <input
                type="text"
                name="SupplierName"
                value={formData.SupplierName}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., Supplier Inc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Supplier Email</label>
              <input
                type="email"
                name="SupplierEmail"
                value={formData.SupplierEmail}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., supplier@example.com"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <motion.button
              type="submit"
              disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
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
                'Create Inventory Item'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateInventory;