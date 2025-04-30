import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit, FiTrash2, FiArrowLeft, FiPlus, FiSearch, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageService = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setFilteredServices(data); // Initialize filtered services with all services
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

  // Client-side search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all services
      setFilteredServices(services);
      return;
    }
    
    // Filter services based on search query (case-insensitive)
    const lowercaseQuery = searchQuery.toLowerCase();
    const results = services.filter(service => 
      (service.service_ID && String(service.service_ID).includes(lowercaseQuery)) ||
      (service.category && String(service.category).toLowerCase().includes(lowercaseQuery)) ||
      (service.subCategory && String(service.subCategory).toLowerCase().includes(lowercaseQuery)) ||
      (service.available && String(service.available).toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredServices(results);
  };

  // Handle search input changes with immediate filtering
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search field is cleared, show all services
    if (value === '') {
      setFilteredServices(services);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle PDF generation
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add salon branding
    doc.setFillColor(137, 25, 143); // PrimaryColor
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text on purple header
    doc.setFontSize(20);
    doc.text('GlowSuite Salon', doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Services Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Add metadata
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(10);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, 14, 35);
    
    // Add search query if present
    if (searchQuery) {
      doc.setFontSize(10);
      doc.text(`Search query: "${searchQuery}"`, 14, 42);
    }
    
    // Add total count
    doc.setFontSize(10);
    doc.text(`Total Services: ${filteredServices.length}`, 14, searchQuery ? 49 : 42);
    
    // Create the table
    const tableColumn = ["Service ID", "Category", "Subcategory", "Price ($)", "Duration", "Available"];
    const tableRows = [];

    // Add data rows
    filteredServices.forEach(service => {
      const serviceData = [
        service.service_ID || '',
        service.category || '',
        service.subCategory || '',
        service.price ? service.price.toString() : '0.00',
        service.duration || '',
        service.available || 'No'
      ];
      tableRows.push(serviceData);
    });

    // Generate the PDF table using the imported autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: searchQuery ? 55 : 48,
      styles: { 
        fontSize: 9, 
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: { 
        fillColor: [137, 25, 143], // PrimaryColor
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Service ID
        1: { cellWidth: 40 }, // Category
        2: { cellWidth: 40 }, // Subcategory
        3: { cellWidth: 25, halign: 'right' }, // Price
        4: { cellWidth: 25 }, // Duration
        5: { cellWidth: 25, halign: 'center' }  // Available
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
      didDrawPage: function(data) {
        // Add page number at the bottom
        doc.setFontSize(10);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() / 2, 
          doc.internal.pageSize.getHeight() - 10, 
          { align: 'center' }
        );
      }
    });
    
    // Add footer
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('GlowSuite Salon - Service Management System', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 5, 
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`services-report-${new Date().toISOString().slice(0,10)}.pdf`);
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
    navigate(`/manager/edit-service/${id}`);
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
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex items-center gap-4">
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            onKeyPress={handleKeyPress}
            className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
          />
          <button
            onClick={handleSearch}
            className="p-3 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-all"
          >
            <FiSearch size={20} />
          </button>
          <button
            onClick={generatePDF}
            className="p-3 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-all"
            title="Export as PDF"
          >
            <FiFileText size={20} />
          </button>
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
            {filteredServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No matching services found.</p>
              </div>
            ) : (
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
                    {filteredServices.map((service) => (
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
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageService;