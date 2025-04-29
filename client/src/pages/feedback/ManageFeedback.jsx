import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiArrowLeft, FiSearch, FiPlus, FiFileText, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageFeedback = () => {
  const navigate = useNavigate();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all feedback items from the backend
  useEffect(() => {
    const fetchFeedbackItems = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}`);
        if (!response.ok) throw new Error('Failed to fetch feedback items');
       
        const data = await response.json();
        setFeedbackItems(data);
        setFilteredFeedback(data); // Initialize filtered feedback with all feedback
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

    fetchFeedbackItems();
  }, []);

  // Client-side search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all feedback items
      setFilteredFeedback(feedbackItems);
      return;
    }
    
    // Filter feedback based on search query (case-insensitive)
    const lowercaseQuery = searchQuery.toLowerCase();
    const results = feedbackItems.filter(item => 
      (item.message && String(item.message).toLowerCase().includes(lowercaseQuery)) ||
      (item.star_rating && String(item.star_rating).includes(lowercaseQuery)) ||
      (item.serviceDetails && item.serviceDetails.category && 
        String(item.serviceDetails.category).toLowerCase().includes(lowercaseQuery)) ||
      (item.serviceDetails && item.serviceDetails.subCategory && 
        String(item.serviceDetails.subCategory).toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredFeedback(results);
  };

  // Handle search input changes with immediate filtering
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search field is cleared, show all feedback items
    if (value === '') {
      setFilteredFeedback(feedbackItems);
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
    doc.text('Glamour Hair & Beauty Salon', doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Customer Feedback Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
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
    doc.text(`Total Feedback Items: ${filteredFeedback.length}`, 14, searchQuery ? 49 : 42);
    
    // Create the table
    const tableColumn = ["Service", "Date", "Rating", "Feedback Message"];
    const tableRows = [];

    // Add data rows
    filteredFeedback.forEach(item => {
      // Format service info
      let serviceInfo = "N/A";
      if (item.serviceDetails && item.serviceDetails.category) {
        serviceInfo = item.serviceDetails.category;
        if (item.serviceDetails.subCategory) {
          serviceInfo += ` - ${item.serviceDetails.subCategory}`;
        }
      }
      
      // Format date
      const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
      
      const feedbackData = [
        serviceInfo,
        createdAt,
        item.star_rating ? item.star_rating.toString() : 'N/A',
        item.message || 'No message'
      ];
      tableRows.push(feedbackData);
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
        0: { cellWidth: 40 }, // Service
        1: { cellWidth: 30 }, // Date
        2: { cellWidth: 20, halign: 'center' }, // Rating
        3: { cellWidth: 100 }  // Feedback message
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
    doc.text('Glamour Hair & Beauty Salon - Feedback Management System', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 5, 
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`feedback-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Helper function to display service info
  const getServiceInfo = (item) => {
    // Check if serviceDetails exists in the item
    if (item.serviceDetails && item.serviceDetails.category) {
      return (
        <>
          <div className="font-medium">{item.serviceDetails.category}</div>
          {item.serviceDetails.subCategory && (
            <div className="text-sm text-gray-500">{item.serviceDetails.subCategory}</div>
          )}
        </>
      );
    }
    
    // Do not show the serviceID as fallback
    return 'N/A';
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format: June 15, 2023, 2:30 PM
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Debug the data received from the API
  useEffect(() => {
    if (feedbackItems.length > 0) {
      console.log('Feedback items with service details:', feedbackItems);
    }
  }, [feedbackItems]);

  // Handle delete feedback item
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this feedback item!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#89198f',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete feedback item');

        // Remove the deleted feedback item from the state
        setFeedbackItems((prev) => prev.filter((item) => item._id !== id));
        setFilteredFeedback((prev) => prev.filter((item) => item._id !== id));

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The feedback item has been deleted.',
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

  // Handle edit feedback item
  const handleEdit = (id) => {
    navigate(`/manager/edit-feedback/${id}`);
  };

  // Handle add new feedback item
  const handleAdd = () => {
    navigate('/manager/add-feedback');
  };

  // Handle status update (approve/decline)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `Are you sure?`,
        text: `Do you want to ${newStatus} this feedback?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'approved' ? '#28a745' : '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: `Yes, ${newStatus} it!`,
      });

      if (result.isConfirmed) {
        console.log(`Updating feedback ${id} status to ${newStatus}`);
        
        // Use PUT method instead of PATCH to avoid CORS issues
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FEEDBACK}/status/${id}`, {
          method: 'PUT', // Changed from PATCH to PUT
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to ${newStatus} feedback`);
        }

        const updatedFeedback = await response.json();
        console.log('Status update response:', updatedFeedback);

        // Update the feedback status in state
        setFeedbackItems(prev => 
          prev.map(item => item._id === id ? { ...item, status: newStatus } : item)
        );
        setFilteredFeedback(prev => 
          prev.map(item => item._id === id ? { ...item, status: newStatus } : item)
        );

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `Feedback has been ${newStatus}.`,
          confirmButtonColor: '#89198f',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending
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
          <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Manage Feedback</h1>
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
            placeholder="Search feedback items..."
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-DarkColor"></div>
          </div>
        ) : (
          /* Feedback Table */
          <div className="overflow-x-auto">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No matching feedback found.</p>
              </div>
            ) : (
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-DarkColor text-white">
                    <th className="p-3 text-left">Service</th>
                    <th className="p-3 text-left">Created At</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Message</th>
                    <th className="p-3 text-left">Star Rating</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3">{getServiceInfo(item)}</td>
                      <td className="p-3">{formatDate(item.createdAt)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(item.status)}`}>
                          {item.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-3">{item.message}</td>
                      <td className="p-3">{item.star_rating}</td>
                      <td className="p-3 flex space-x-2">
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(item._id, 'approved')}
                              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all"
                              title="Approve feedback"
                            >
                              <FiThumbsUp size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(item._id, 'declined')}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                              title="Decline feedback"
                            >
                              <FiThumbsDown size={16} />
                            </button>
                          </>
                        )}
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
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageFeedback;