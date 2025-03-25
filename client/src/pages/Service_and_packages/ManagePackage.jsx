import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const ManagePackage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}`);
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch packages',
          confirmButtonColor: '#89198f',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete package');
        setPackages(prev => prev.filter(pkg => pkg._id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Package has been deleted.',
          confirmButtonColor: '#89198f',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message,
          confirmButtonColor: '#89198f',
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/manager/edit-package/${id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-PrimaryColor to-SecondaryColor">
        <p className="text-white text-xl">Loading...</p>
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
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-extrabold text-ExtraDarkColor mb-8">Manage Packages</h1>
        <div className="mb-8">
          <button
            onClick={() => navigate('/manager/create-package')}
            className="bg-DarkColor text-white py-2 px-4 rounded-lg flex items-center hover:bg-ExtraDarkColor transition-all"
          >
            <FiPlus className="mr-2" /> Create New Package
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Base Price</th>
                <th className="px-4 py-2 text-left">Discount (%)</th>
                <th className="px-4 py-2 text-left">Final Price</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{pkg.ID}</td>
                  <td className="px-4 py-2">{pkg.p_name}</td>
                  <td className="px-4 py-2">{pkg.category}</td>
                  <td className="px-4 py-2">{pkg.package_type}</td>
                  <td className="px-4 py-2">${pkg.base_price.toFixed(2)}</td>
                  <td className="px-4 py-2">{pkg.discount_rate}%</td>
                  <td className="px-4 py-2">${pkg.final_price.toFixed(2)}</td>
                  <td className="px-4 py-2">{new Date(pkg.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(pkg.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{pkg.status}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleEdit(pkg._id)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit package"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete package"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default ManagePackage;