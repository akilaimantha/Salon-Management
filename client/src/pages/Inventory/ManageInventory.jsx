import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiArrowLeft, FiSearch, FiPlus, FiFileText, FiBox, FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import jsPDF from 'jspdf';
// Make sure to install this package: npm install jspdf-autotable
import autoTable from 'jspdf-autotable';

const ManageInventory = () => {
  const navigate = useNavigate();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [retrieveModal, setRetrieveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [retrieveQuantity, setRetrieveQuantity] = useState(1);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Fetch all inventory items from the backend only once on component mount
  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}`);
        if (!response.ok) throw new Error('Failed to fetch inventory items');
        
        const data = await response.json();
        setInventoryItems(data);
        setFilteredItems(data); // Initialize filtered items with all items
        
        // Generate low stock notifications
        generateLowStockNotifications(data);
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
    
    // Handle clicks outside notification dropdown
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Only run on component mount

  // Generate notifications for low stock items
  const generateLowStockNotifications = (items) => {
    const lowStockItems = items.filter(item => parseInt(item.Quantity) <= 10);
    
    if (lowStockItems.length > 0) {
      const newNotifications = lowStockItems.map(item => ({
        id: item._id,
        itemName: item.ItemName,
        quantity: item.Quantity,
        read: false,
        timestamp: new Date().toISOString()
      }));
      
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    }
  };
  
  // Mark a notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };
  
  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setShowNotifications(false);
  };

  // Toggle notification panel
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  // Client-side search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all items
      setFilteredItems(inventoryItems);
      return;
    }
    
    // Filter items based on search query (case-insensitive)
    const lowercaseQuery = searchQuery.toLowerCase();
    const results = inventoryItems.filter(item => 
      item.ItemName.toLowerCase().includes(lowercaseQuery) ||
      item.Category.toLowerCase().includes(lowercaseQuery) ||
      item.SupplierName.toLowerCase().includes(lowercaseQuery) ||
      item.SupplierEmail.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredItems(results);
  };

  // Handle search input changes with immediate filtering
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search field is cleared, show all items
    if (value === '') {
      setFilteredItems(inventoryItems);
    }
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
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
        setFilteredItems((prev) => prev.filter((item) => item._id !== id));

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
    doc.text('Inventory Items Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
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
    doc.text(`Total Items: ${filteredItems.length}`, 14, searchQuery ? 49 : 42);
    
    // Create the table
    const tableColumn = ["Item Name", "Category", "Quantity", "Price ($)", "Supplier Name", "Supplier Email"];
    const tableRows = [];

    // Add data rows
    filteredItems.forEach(item => {
      // Format price as currency
      const formattedPrice = parseFloat(item.Price).toFixed(2);
      
      const itemData = [
        item.ItemName || '',
        item.Category || '',
        item.Quantity ? item.Quantity.toString() : '0',
        formattedPrice,
        item.SupplierName || '',
        item.SupplierEmail || ''
      ];
      tableRows.push(itemData);
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
        0: { cellWidth: 40 }, // Item Name
        1: { cellWidth: 30 }, // Category
        2: { cellWidth: 20, halign: 'center' }, // Quantity - centered
        3: { cellWidth: 20, halign: 'right' }, // Price - right aligned
        4: { cellWidth: 40 }, // Supplier Name
        5: { cellWidth: 40 }  // Supplier Email
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
    doc.text('Glamour Hair & Beauty Salon - Inventory Management System', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 5, 
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`inventory-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const handleRetrieveClick = (item) => {
    setSelectedItem(item);
    setRetrieveQuantity(1);
    setRetrieveModal(true);
  };

  const handleRetrieve = async () => {
    try {
      if (!selectedItem || !selectedItem._id) {
        throw new Error('No item selected for retrieval');
      }
      
      // Check if quantity is valid
      if (retrieveQuantity <= 0 || retrieveQuantity > selectedItem.Quantity) {
        throw new Error('Invalid quantity selected');
      }
      
      // Calculate the new quantity after retrieval
      const newQuantity = parseInt(selectedItem.Quantity) - retrieveQuantity;
      
      // Instead of using a specific /retrieve endpoint, update the item directly
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVENTORY}/${selectedItem._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...selectedItem,
            Quantity: newQuantity.toString() // Convert to string to match existing format
          }),
        }
      );

      // Improved error handling for non-JSON responses
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const error = await response.json();
          throw new Error(error.message || `Error: ${response.status}`);
        } else {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }
      }

      // Update local state
      setInventoryItems(items =>
        items.map(item =>
          item._id === selectedItem._id
            ? { ...item, Quantity: newQuantity.toString() }
            : item
        )
      );
      setFilteredItems(items =>
        items.map(item =>
          item._id === selectedItem._id
            ? { ...item, Quantity: newQuantity.toString() }
            : item
        )
      );

      setRetrieveModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Successfully retrieved ${retrieveQuantity} ${selectedItem.ItemName}(s)`,
        confirmButtonColor: '#89198f',
      });
    } catch (error) {
      console.error("Retrieve error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
        confirmButtonColor: '#89198f',
      });
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
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={toggleNotifications}
                className="p-2 bg-PrimaryColor text-DarkColor rounded-full hover:bg-SecondaryColor transition-all relative"
                title="Notifications"
              >
                <FiBell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={markAllAsRead}
                          className="text-sm text-PrimaryColor hover:text-SecondaryColor flex items-center"
                          title="Mark all as read"
                        >
                          <FiCheck size={14} className="mr-1" /> All
                        </button>
                        <button 
                          onClick={clearAllNotifications}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center"
                          title="Clear all notifications"
                        >
                          <FiTrash2 size={14} className="mr-1" /> Clear
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${notification.read ? 'opacity-70' : ''}`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {notification.read ? notification.itemName : <strong>{notification.itemName}</strong>}
                              </p>
                              <p className="text-xs text-red-600 mt-1">
                                Low stock! Only {notification.quantity} items remaining.
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                className="text-PrimaryColor hover:text-SecondaryColor"
                                title="Mark as read"
                              >
                                <FiCheck size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-extrabold text-ExtraDarkColor">Manage Inventory</h1>
          </div>
          
          <button
            // onClick={handleAdd}
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
          /* Inventory Table - Now using filteredItems instead of inventoryItems */
          <div className="overflow-x-auto">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No matching items found.</p>
              </div>
            ) : (
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
                  {filteredItems.map((item) => {
                    const isLowStock = parseInt(item.Quantity) <= 10;
                    
                    return (
                      <tr 
                        key={item._id} 
                        className={`border-b border-gray-200 hover:bg-gray-50 ${isLowStock ? 'bg-red-100' : ''}`}
                        title={isLowStock ? "Low stock! Consider reordering." : ""}
                      >
                        <td className="p-3">{item.ItemName}</td>
                        <td className="p-3">{item.Category}</td>
                        <td className={`p-3 ${isLowStock ? 'font-bold text-red-600' : ''}`}>
                          {item.Quantity}
                          {isLowStock && <span className="ml-2 text-xs text-red-600">Low!</span>}
                        </td>
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
                          <button
                            onClick={() => handleRetrieveClick(item)}
                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all"
                          >
                            <FiBox size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add Retrieve Modal */}
      {retrieveModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Retrieve Items</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Item: {selectedItem.ItemName}</p>
                <p className="text-gray-600">Available: {selectedItem.Quantity}</p>
                <p className="text-gray-600">Price: ${selectedItem.Price}</p>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Quantity to Retrieve:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.Quantity}
                  value={retrieveQuantity}
                  onChange={(e) => setRetrieveQuantity(Number(e.target.value))}
                  className="w-full p-2 border rounded focus:border-PrimaryColor"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setRetrieveModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetrieve}
                  className="px-4 py-2 bg-PrimaryColor text-white rounded hover:bg-SecondaryColor"
                >
                  Retrieve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageInventory;