import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEdit, FiTrash, FiArrowLeft, FiSearch, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';
import API_CONFIG from '../../config/apiConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ManageAppointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
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
        setFilteredAppointments(data); // Initialize filtered appointments with all appointments
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

  // Client-side search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const results = appointments.filter(appointment =>
      (appointment.appoi_ID && String(appointment.appoi_ID).includes(lowercaseQuery)) ||
      (appointment.client_name && String(appointment.client_name).toLowerCase().includes(lowercaseQuery)) ||
      (appointment.client_email && String(appointment.client_email).toLowerCase().includes(lowercaseQuery)) ||
      (appointment.client_phone && String(appointment.client_phone).toLowerCase().includes(lowercaseQuery)) ||
      (appointment.stylist && String(appointment.stylist).toLowerCase().includes(lowercaseQuery)) ||
      (appointment.services && String(appointment.services).toLowerCase().includes(lowercaseQuery)) ||
      (appointment.packages && String(appointment.packages).toLowerCase().includes(lowercaseQuery))
    );

    setFilteredAppointments(results);
  };

  // Handle search input changes with immediate filtering
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value === '') {
      setFilteredAppointments(appointments);
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

    doc.setFillColor(137, 25, 143);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 25, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('Glamour Hair & Beauty Salon', doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Appointments Report', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const today = new Date();
    doc.text(`Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, 14, 35);

    if (searchQuery) {
      doc.setFontSize(10);
      doc.text(`Search query: "${searchQuery}"`, 14, 42);
    }

    const tableColumn = ["ID", "Client Name", "Email", "Phone", "Stylist", "Date", "Time", "Services", "Package", "Status"];
    const tableRows = [];

    filteredAppointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.appoi_date);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      const appointmentData = [
        appointment.appoi_ID || '',
        appointment.client_name || '',
        appointment.client_email || '',
        appointment.client_phone || '',
        appointment.stylist || '',
        formattedDate,
        appointment.appoi_time || '',
        appointment.services || '',
        appointment.packages || '',
        appointment.status || 'Processing'
      ];
      tableRows.push(appointmentData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: searchQuery ? 48 : 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: [137, 25, 143],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
        7: { cellWidth: 30 },
        8: { cellWidth: 30 },
        9: { cellWidth: 25 }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    });

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Glamour Hair & Beauty Salon - Appointments Management System',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );

    doc.save(`appointments-report-${new Date().toISOString().slice(0, 10)}.pdf`);
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

        setAppointments((prev) => prev.filter((appointment) => appointment._id !== appoi_ID));
        setFilteredAppointments((prev) => prev.filter((appointment) => appointment._id !== appoi_ID));

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

  // Handle status change
  const handleStatusChange = async (appoi_ID, newStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Change Appointment Status',
        text: `Are you sure you want to mark this appointment as ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#89198f',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, update it!',
      });

      if (result.isConfirmed) {
        const currentAppointment = appointments.find(app => app._id === appoi_ID);

        if (!currentAppointment) {
          throw new Error('Appointment not found');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${appoi_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentAppointment,
            status: newStatus
          }),
        });

        if (!response.ok) throw new Error('Failed to update appointment status');

        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appoi_ID ? { ...appointment, status: newStatus } : appointment
          )
        );
        setFilteredAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appoi_ID ? { ...appointment, status: newStatus } : appointment
          )
        );

        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: `The appointment status has been updated to ${newStatus}.`,
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
          /* Appointments Table - Now using filteredAppointments instead of appointments */
          <div className="overflow-x-auto">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No matching appointments found.</p>
              </div>
            ) : (
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
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
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
                      <td className="p-3">
                        <select
                          value={appointment.status || 'Processing'}
                          onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                          className="p-2 border rounded-lg"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
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
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ManageAppointment;