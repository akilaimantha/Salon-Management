import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import { useSelector } from 'react-redux'; // Add this import

const EditFeedback = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth); // Get user from Redux state

  const [formData, setFormData] = useState({
    user_id: user?._id || '', // Replace Username with user_id
    serviceID: '',
    message: '',
    star_rating: '',
    date_of_service: '',
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Format today's date as YYYY-MM-DD for date input
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch feedback data');
        const data = await response.json();
        setFormData({
          user_id: user?._id || '', // Use current user ID, not the one from data
          serviceID: data.serviceID,
          message: data.message,
          star_rating: data.star_rating,
          date_of_service: today, // Force date to be today regardless of original value
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#89198f',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [id, today, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, star_rating: rating }));
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = ['user_id', 'serviceID', 'message', 'star_rating', 'date_of_service'];
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
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}/${id}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update feedback');

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Feedback updated successfully!',
        confirmButtonColor: '#89198f',
      }).then(() => {
        navigate('/customer/profile');
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
            Edit Feedback
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Feedback Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Remove the Username input field since we're using user_id from state */}
            <div>
              <label className="block text-sm font-semibold text-gray-700">Service ID</label>
              <input
                type="text"
                name="serviceID"
                value={formData.serviceID}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="e.g., 12345"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Date of Service<span className="text-red-500">*</span></label>
              <input
                type="date"
                name="date_of_service"
                value={formData.date_of_service}
                onChange={handleInputChange}
                min={today}
                max={today}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                required
              />
              <small className="text-gray-500 mt-1 block">You can only provide feedback for today's service.</small>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="mt-1 w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
                placeholder="Enter your feedback message"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Star Rating</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-3xl focus:outline-none"
                  >
                    {star <= (hoverRating || formData.star_rating) ? (
                      <span className="text-yellow-500">★</span>
                    ) : (
                      <span className="text-gray-300">☆</span>
                    )}
                  </motion.button>
                ))}
                {formData.star_rating && (
                  <span className="ml-2 text-gray-600 font-medium">
                    ({formData.star_rating} {formData.star_rating === 1 ? 'star' : 'stars'})
                  </span>
                )}
              </div>
              <input
                type="hidden"
                name="star_rating"
                value={formData.star_rating}
                required
              />
            </div>
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
                'Update Feedback'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditFeedback;