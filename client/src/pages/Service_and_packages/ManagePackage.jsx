import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManagePackage = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PACK}`);
        if (!response.ok) throw new Error('Failed to fetch packages');
        const data = await response.json();
        setPackages(data);
        setFilteredPackages(data); // Initialize filtered packages with all packages
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

  // Client-side search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all packages
      setFilteredPackages(packages);
      return;
    }
    
    // Filter packages based on search query (case-insensitive)
    const lowercaseQuery = searchQuery.toLowerCase();
    const results = packages.filter(pkg => 
      (pkg.ID && String(pkg.ID).includes(lowercaseQuery)) ||
      (pkg.p_name && String(pkg.p_name).toLowerCase().includes(lowercaseQuery)) ||
      (pkg.category && String(pkg.category).toLowerCase().includes(lowercaseQuery)) ||
      (pkg.package_type && String(pkg.package_type).toLowerCase().includes(lowercaseQuery)) ||
      (pkg.status && String(pkg.status).toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredPackages(results);
  };

  // Handle search input changes with immediate filtering
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search field is cleared, show all packages
    if (value === '') {
      setFilteredPackages(packages);
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
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add salon branding
    doc.setFillColor(137, 25, 143); // PrimaryColor
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');
    
    // Add title
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255); // White text on purple header
    doc.setFontSize(20);
    doc.text('GlowSuite Salon', doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Packages Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
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
    doc.text(`Total Packages: ${filteredPackages.length}`, 14, searchQuery ? 49 : 42);
    
    // Create the table
    const tableColumn = ["ID", "Name", "Category", "Type", "Base Price ($)", "Discount (%)", "Final Price ($)", "Start Date", "End Date", "Status"];
    const tableRows = [];

    // Add data rows
    filteredPackages.forEach(pkg => {
      // Format dates
      const startDate = new Date(pkg.start_date).toLocaleDateString();
      const endDate = new Date(pkg.end_date).toLocaleDateString();
      
      const packageData = [
        pkg.ID || '',
        pkg.p_name || '',
        pkg.category || '',
        pkg.package_type || '',
        pkg.base_price ? pkg.base_price.toFixed(2) : '0.00',
        pkg.discount_rate ? pkg.discount_rate.toString() : '0',
        pkg.final_price ? pkg.final_price.toFixed(2) : '0.00',
        startDate,
        endDate,
        pkg.status || ''
      ];
      tableRows.push(packageData);
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
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 30 }, // Name
        2: { cellWidth: 25 }, // Category
        3: { cellWidth: 25 }, // Type
        4: { cellWidth: 20, halign: 'right' }, // Base Price
        5: { cellWidth: 20, halign: 'center' }, // Discount
        6: { cellWidth: 20, halign: 'right' }, // Final Price
        7: { cellWidth: 25 }, // Start Date
        8: { cellWidth: 25 }, // End Date
        9: { cellWidth: 20 }  // Status
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
    doc.text('GlowSuite Salon - Package Management System', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 5, 
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`packages-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

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
        setFilteredPackages(prev => prev.filter(pkg => pkg._id !== id)); // Update filtered packages
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
        
        {/* Action Buttons and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/manager/create-package')}
            className="bg-DarkColor text-white py-2 px-4 rounded-lg flex items-center hover:bg-ExtraDarkColor transition-all"
          >
            <FiPlus className="mr-2" /> Create New Package
          </button>
          
          <div className="flex w-full md:w-auto items-center gap-2">
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyPress={handleKeyPress}
              className="w-full p-2 rounded-lg border-2 border-gray-200 focus:border-DarkColor focus:ring-2 focus:ring-SecondaryColor"
            />
            <button
              onClick={handleSearch}
              className="p-2 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-all"
            >
              <FiSearch size={20} />
            </button>
            <button
              onClick={generatePDF}
              className="p-2 bg-DarkColor text-white rounded-lg hover:bg-ExtraDarkColor transition-all"
              title="Export as PDF"
            >
              <FiFileText size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No matching packages found.</p>
            </div>
          ) : (
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
                {filteredPackages.map(pkg => (
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
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ManagePackage;