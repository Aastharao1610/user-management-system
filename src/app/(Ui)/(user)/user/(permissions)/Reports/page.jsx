"use client";
import { Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserPermissions } from "@/hooks/usePermission";
import DeleteReport from "@/app/(Ui)/components/Modals/DeleteReport";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import Pagination from "@/app/(Ui)/components/common/page";

const Reports = ({ themeClasses = {} }) => {
  const {
    border = "border-gray-200",
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    text = "text-black",
    bg = "bg-white",
    hover = "hover:bg-gray-50",
  } = themeClasses || {};

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [dateFilter, setDateFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { role, loading: userLoading } = useUserPermissions();

  // const fetchReports = async (page, limit, search) => {
  //   try {
  //     setLoading(true);

  //     const res = await axios.get(
  //       `/api/Reports?page=${page}&limit=${limit}&search=${search}`
  //     );
  //     console.log(res, "res");
  //     setReports(res.data.Report);
  //     setTotalReports(res.data.totalReports);
  //     setTotalPages(res.data.totalPages);
  //   } catch (err) {
  //     console.error("Failed to fetch reports", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/Reports", {
        params: {
          page,
          limit: limit === "All" ? null : Number(limit),
          search: searchTerm,
          dateFilter,
        },
      });

      setReports(res.data.Report);
      setTotalReports(res.data.totalReports);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, limit, searchTerm, dateFilter]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     // fetchReports(page, limit, searchTerm);
  //     fetchReports(page, limit === "All" ? null : Number(limit), searchTerm);
  //   }, 300);

  //   return () => clearTimeout(timer);
  // }, [page, limit, searchTerm]);

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`/api/Reports?id=${selectedReportId}`);
      toast.success(res.data?.message || "Report deleted successfully");

      // fetchReports(page, limit, searchTerm); // FIXED
      fetchReports(page, limit === "All" ? null : Number(limit), searchTerm);

      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error(err.response?.data?.error || "Failed to delete report");
    }
  };

  if (userLoading) {
    return (
      <div className="text-center py-6 text-gray-500">
        <UserSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔍 Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1); // Reset page when searching
              setSearchTerm(e.target.value);
            }}
            className={`w-full p-2 pl-10 rounded-lg border ${border} ${bg} ${text} text-sm focus:ring-2 ${accentColor.replace(
              "text",
              "focus:ring"
            )} focus:border-transparent transition duration-200`}
            style={{ outline: "none" }}
          />
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${inactiveText}`}
          />
        </div>
        <div className="w-full sm:w-60">
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1); // reset page when filtering
            }}
            className={`w-full cursor-pointer p-2 rounded-lg border ${border} ${bg} ${text}`}
          >
            <option value="ALL">All</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Last 7 Days</option>
            <option value="MONTH">This Month</option>
          </select>
        </div>
      </div>

      {/* 📋 Reports Table */}
      <div
        className={`overflow-x-auto rounded-xl shadow-lg border ${border} ${bg}`}
      >
        <table className="min-w-full divide-y divide-gray-700">
          <thead className={`${bg}`}>
            <tr>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase ${inactiveText}`}
              >
                ID
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase ${inactiveText}`}
              >
                Description
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase ${inactiveText}`}
              >
                Action Type
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase ${inactiveText}`}
              >
                Entity Type
              </th>
              <th
                className={`px-4 py-3 text-left text-xs font-medium uppercase ${inactiveText}`}
              >
                Date
              </th>
              {role === "Admin" && (
                <th
                  className={`px-4 py-3 text-right text-xs font-medium uppercase ${inactiveText}`}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  <UserSkeleton />
                </td>
              </tr>
            ) : reports.length > 0 ? (
              reports.map((report, index) => (
                <tr key={report.id} className={`${hover}`}>
                  <td className={`px-4 py-4 text-sm ${text}`}>
                    {(page - 1) * (limit === "All" ? totalReports : limit) +
                      index +
                      1}
                    {/* {(page - 1) * (limit === "All" ? totalRecords : limit) +
                      index +
                      1} */}
                  </td>
                  <td className={`px-4 py-4 text-sm ${text}`}>
                    {report.description}
                  </td>
                  <td className={`px-4 py-4 text-sm ${text}`}>
                    {report.actionType}
                  </td>
                  <td className={`px-4 py-4 text-sm ${text}`}>
                    {report.entityType}
                  </td>
                  <td className={`px-4 py-4 text-sm ${inactiveText}`}>
                    {new Date(report.date).toLocaleString()}
                  </td>

                  {role === "Admin" && (
                    <td className="px-4 py-4 text-right">
                      <button
                        title="Delete Report"
                        onClick={() => openDeleteModal(report.id)}
                        className="inline-flex cursor-pointer items-center text-red-500 hover:opacity-75 p-1 rounded-full ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalReports > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          setLimit={setLimit}
          totalRecords={totalRecords}
        />
      )}

      <DeleteReport
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Reports;
