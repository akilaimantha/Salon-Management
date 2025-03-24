import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiArrowLeft, FiSearch } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const ManageAppointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all appointments from the backend
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        setAppointments(data);
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

    fetchAppointments();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/searchappointment?search=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to search appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
    }
  };

  // Handle delete appointment
  const handleDelete = async (appoi_ID) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this appointment!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#89198f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${appoi_ID}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete appointment');

        // Remove the deleted appointment from the state
        setAppointments((prev) => prev.filter((appointment) => appointment._id !== appoi_ID));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The appointment has been deleted.',
          confirmButtonColor: '#89198f',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
    }
  };

  // Handle edit appointment
  const handleEdit = (appoi_ID) => {
    navigate(`/manager/edit-appointment/${appoi_ID}`);
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
          <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Manage Appointments</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
          />
          <button
            onClick={handleSearch}
            className="p-3 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-all"
          >
            <FiSearch size={20} />
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
          </div>
        ) : (
          /* Appointments Table */
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-DarkColor text-white">
                  <th className="p-3 text-left">ID</th>
                  <th className="p-3 text-left">Client Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Stylist</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Services</th>
                  <th className="p-3 text-left">Package</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{appointment.appoi_ID}</td>
                    <td className="p-3">{appointment.client_name}</td>
                    <td className="p-3">{appointment.client_email}</td>
                    <td className="p-3">{appointment.client_phone}</td>
                    <td className="p-3">{appointment.stylist}</td>
                    <td className="p-3">{new Date(appointment.appoi_date).toLocaleDateString()}</td>
                    <td className="p-3">{appointment.appoi_time}</td>
                    <td className="p-3">{appointment.services}</td>
                    <td className="p-3">{appointment.packages}</td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(appointment._id)}
                        className="p-2 bg-SecondaryColor text-white rounded-full hover:bg-DarkColor transition-all"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                      >
                        <FiTrash size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageAppointment;