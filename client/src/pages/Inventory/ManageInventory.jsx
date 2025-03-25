import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiArrowLeft, FiSearch, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';

const ManageInventory = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all inventory items from the backend
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`);
        if (!response.ok) throw new Error('Failed to fetch inventory items');
       
        const data = await response.json();

        console.log(data)
        setInventoryItems(data);
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

    fetchInventoryItems();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/search?search=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to search inventory items');
      const data = await response.json();
      setInventoryItems(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
    }
  };

  // Handle delete inventory item
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this inventory item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#89198f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete inventory item');

        // Remove the deleted inventory item from the state
        setInventoryItems((prev) => prev.filter((item) => item._id !== id));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The inventory item has been deleted.',
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

  // Handle edit inventory item
  const handleEdit = (id) => {
    navigate(`/manager/edit-inventory/${id}`);
  };

  // Handle add new inventory item
  const handleAdd = () => {
    navigate('/manager/add-inventory');
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
          <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Manage Inventory</h1>
          <button
            onClick={handleAdd}
            className="p-2 bg-PrimaryColor text-DarkColor rounded-full hover:bg-SecondaryColor transition-all"
          >
            <FiPlus size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search inventory items..."
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
          /* Inventory Table */
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-DarkColor text-white">
                  <th className="p-3 text-left">Item Name</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Supplier Name</th>
                  <th className="p-3 text-left">Supplier Email</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3">{item.ItemName}</td>
                    <td className="p-3">{item.Category}</td>
                    <td className="p-3">{item.Quantity}</td>
                    <td className="p-3">{item.Price}</td>
                    <td className="p-3">{item.SupplierName}</td>
                    <td className="p-3">{item.SupplierEmail}</td>
                    <td className="p-3 flex space-x-2">
                      <button
                        onClick={() => handleEdit(item._id)}
                        className="p-2 bg-SecondaryColor text-white rounded-full hover:bg-DarkColor transition-all"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
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

export default ManageInventory;