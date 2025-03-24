import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiArrowLeft, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const ManageService = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to fetch services');
      setServices(data);
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

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#89198f',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SERVICES}/${id}`;
          const response = await fetch(url, {
            method: 'DELETE',
          });
          
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to delete service');

          setServices(services.filter(service => service._id !== id));
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Service has been deleted.',
            confirmButtonColor: '#89198f',
          });
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
            confirmButtonColor: '#89198f',
          });
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`manager/edit-service/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-PrimaryColor to-SecondaryColor p-8"
    >
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-PrimaryColor text-DarkColor rounded-full hover:bg-SecondaryColor transition-all"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Manage Services</h1>
          {/* Uncomment if you want to add a "Create New" button */}
          {/* <motion.button
            onClick={() => navigate('manage/services/create')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-DarkColor text-white py-2 px-4 rounded-lg shadow-lg hover:bg-ExtraDarkColor transition-all"
          >
            <FiPlus size={20} className="mr-2" />
            Add New Service
          </motion.button> */}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-10 w-10 text-DarkColor" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
            </svg>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center text-red-600 py-8">
            <p>{error}</p>
            <button
              onClick={fetchServices}
              className="mt-4 bg-DarkColor text-white py-2 px-4 rounded-lg hover:bg-ExtraDarkColor"
            >
              Retry
            </button>
          </div>
        )}

        {/* Services List */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-ExtraDarkColor">
                  <th className="p-4 font-semibold">Service ID</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Subcategory</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Duration</th>
                  <th className="p-4 font-semibold">Available</th>
                  <th className="p-4 font-semibold">Image</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {services.map((service) => (
                    <motion.tr
                      key={service._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-4">{service.service_ID}</td>
                      <td className="p-4">{service.category}</td>
                      <td className="p-4">{service.subCategory}</td>
                      <td className="p-4">${service.price}</td>
                      <td className="p-4">{service.duration}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          service.available === 'Yes' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.available}
                        </span>
                      </td>
                      <td className="p-4">
                        {service.image ? (
                          <img 
                            src={`${API_CONFIG.BASE_URL}${service.image}`} 
                            alt={service.category} 
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </td>
                      <td className="p-4 flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(service._id)}
                          className="p-2 bg-DarkColor text-white rounded-full hover:bg-ExtraDarkColor"
                        >
                          <FiEdit size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(service._id)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <FiTrash2 size={16} />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            {services.length === 0 && (
              <p className="text-center text-gray-500 py-8">No services found.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageService;