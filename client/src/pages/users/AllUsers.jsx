import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Filter,
  Search,
  PlusCircle,
  Download,
  Trash2,
  UserPlus,
  BarChart2,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import html2canvas from "html2canvas";
import client from "../../api/axiosClient";
import AddUserPopup from "./AddUserPopup";

const COLOR_THEME = {
  PrimaryColor: "#d8f3dc",
  SecondaryColor: "#95d5b2",
  DarkColor: "#52b788",
  ExtraDarkColor: "#1b4332",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [reportType, setReportType] = useState("csv");
  const [userCounts, setUserCounts] = useState({
    total: 0,
    customers: 0,
    managers: 0,
  });
  const chartRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await client.get(`/api/v1/user`);
      setUsers(response.data);
      calculateUserCounts(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error!", "Failed to fetch users.", "error");
    }
  };

  const calculateUserCounts = (userData) => {
    const counts = {
      total: userData.length,
      customers: userData.filter((user) => user.role === "customer").length,
      managers: userData.filter((user) => user.role === "admin").length,
    };
    setUserCounts(counts);
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: COLOR_THEME.DarkColor,
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await client.delete(`/api/v1/user/${id}`);
        Swal.fire("Deleted!", "The user has been deleted.", "success");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error!", "There was an error deleting the user.", "error");
      }
    }
  };

  const downloadCSV = () => {
    const csvContent = [
      ["Name", "Email", "Phone Number", "Role", "Status", "Created At"],
      ...filteredUsers.map((user) => [
        user.name,
        user.email,
        user?.phone || "",
        user.role,
        user.status,
        user.createdAt,
      ]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "users_report.csv");
  };

  const downloadPDF = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Header
    doc
      .setFont("helvetica", "normal")
      .setFontSize(28)
      .setTextColor(COLOR_THEME.ExtraDarkColor);
    doc.text("User Management", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal").setFontSize(18).setTextColor(0, 0, 0);
    doc.text("Comprehensive User Report", 105, 30, { align: "center" });

    // Date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(10).setTextColor(100, 100, 100);
    doc.text(`Generated on: ${currentDate}`, 20, 48);

    // User Count Cards
    const cardY = 60;
    const cardWidth = 50;
    const cardHeight = 25;
    const cardSpacing = 5;

    const drawCard = (x, y, title, count) => {
      doc.setFillColor(COLOR_THEME.PrimaryColor);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(0, 0, 0);
      doc.text(title, x + cardWidth / 2, y + 8, { align: "center" });
      doc.setFontSize(14).setTextColor(COLOR_THEME.ExtraDarkColor);
      doc.text(count.toString(), x + cardWidth / 2, y + 20, {
        align: "center",
      });
    };

    drawCard(20, cardY, "Total Users", userCounts.total);
    drawCard(
      20 + cardWidth + cardSpacing,
      cardY,
      "Customers",
      userCounts.customers
    );
    drawCard(
      20 + (cardWidth + cardSpacing) * 2,
      cardY,
      "Managers",
      userCounts.managers
    );

    // Generate Pie Chart image
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 70, 100, 90, 70);
    }

    // Add table with user data
    doc.autoTable({
      startY: cardY + cardHeight + 100,
      head: [["Name", "Email", "Phone Number", "Role", "Status", "Created At"]],
      body: filteredUsers.map((user) => [
        user.name,
        user.email,
        user?.phone || "",
        user.role,
        user.status,
        user.createdAt,
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [COLOR_THEME.DarkColor],
        textColor: 255,
      },
      alternateRowStyles: { fillColor: [COLOR_THEME.PrimaryColor] },
    });

    // Footer (Page numbering)
    const pageCount = doc.internal.getNumberOfPages();
    doc
      .setFont("helvetica", "normal")
      .setFontSize(8)
      .setTextColor(100, 100, 100);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save("User_Report.pdf");
  };

  const handleDownload = () => {
    if (reportType === "csv") {
      downloadCSV();
    } else {
      downloadPDF();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const UserDistributionChart = () => {
    const data = [
      { name: "Managers", value: userCounts.managers },
      { name: "Customers", value: userCounts.customers },
    ];
    const COLORS = [COLOR_THEME.DarkColor, COLOR_THEME.SecondaryColor];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-4 rounded-lg shadow-md"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart2 className="mr-2" /> User Distribution
        </h3>
        <div ref={chartRef}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  const UserCountCard = ({ title, count, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4 w-64"
    >
      <div
        className="p-3 rounded-full"
        style={{ backgroundColor: COLOR_THEME.DarkColor }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{count}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        background: `linear-gradient(135deg, ${COLOR_THEME.PrimaryColor}, ${COLOR_THEME.SecondaryColor})`,
      }}
      className="p-6 rounded-lg text-[#1b4332]"
    >
      {/* Summary Cards and Chart */}
      <div className="md:grid md:grid-cols-3 gap-4 justify-center">
        {/* Column for Count Cards */}
        <div className="md:col-span-2 space-y-4">
          <UserCountCard
            title="Total Users"
            count={userCounts.total}
            icon={<Users className="text-white text-2xl" />}
          />
          <UserCountCard
            title="Customers"
            count={userCounts.customers}
            icon={<UserPlus className="text-white text-2xl" />}
          />
          <UserCountCard
            title="Managers"
            count={userCounts.managers}
            icon={<Filter className="text-white text-2xl" />}
          />
        </div>

        {/* Column for User Distribution Chart */}
        <div className="md:col-span-1">
          <UserDistributionChart />
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4 mt-8">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative w-full md:w-1/3"
        >
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-3 pl-10 border rounded-lg shadow-md focus:outline-none focus:ring-2"
            style={{
              borderColor: COLOR_THEME.DarkColor,
              focusRingColor: COLOR_THEME.ExtraDarkColor,
            }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex space-x-4"
        >
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="p-2 border rounded-lg shadow-md focus:outline-none focus:ring-2"
            style={{
              borderColor: COLOR_THEME.DarkColor,
              focusRingColor: COLOR_THEME.ExtraDarkColor,
            }}
          >
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 rounded-lg transition duration-300 shadow-md"
            style={{
              backgroundColor: COLOR_THEME.DarkColor,
              color: "white",
              "&:hover": { backgroundColor: COLOR_THEME.ExtraDarkColor },
            }}
          >
            <Download className="mr-2" />
            Download Report
          </button>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center px-4 py-2 rounded-lg transition duration-300 shadow-md"
            style={{
              backgroundColor: COLOR_THEME.DarkColor,
              color: "white",
              "&:hover": { backgroundColor: COLOR_THEME.ExtraDarkColor },
            }}
          >
            <UserPlus className="mr-2" />
            Add User
          </button>
        </motion.div>
      </div>

      {/* User Table */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="overflow-x-auto rounded-lg shadow-lg"
      >
        <table className="w-full bg-white">
          <thead>
            <tr
              style={{ backgroundColor: COLOR_THEME.DarkColor }}
              className="text-white"
            >
              <th className="p-3">Avatar</th>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mobile No</th>
              <th className="p-3">Role</th>
              <th className="p-3">Position</th>

              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b hover:bg-gray-100 transition duration-300"
                >
                  <td className="p-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="p-3">{user?.name}</td>
                  <td className="p-3">{user?.email}</td>
                  <td className="p-3">{user?.phone}</td>
                  <td className="p-3">{user?.role}</td>
                  <td className="p-3">{user?.position}</td>
                  <td className="p-3">{user?.status}</td>
                  <td className="p-3">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="flex items-center bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300"
                    >
                      <Trash2 className="mr-2" />
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      {/* Commented out Add User Popup - replace with your actual implementation */}
      {isAddUserOpen && (
        <AddUserPopup
          closePopup={() => setIsAddUserOpen(false)}
          refreshUsers={fetchUsers}
        />
      )}
    </motion.div>
  );
};

export default UserManagement;
