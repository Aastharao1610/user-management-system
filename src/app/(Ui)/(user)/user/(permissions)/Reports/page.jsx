"use client";
import React, { useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useUserPermissions } from "@/hooks/usePermission";
import UserSkeleton from "@/app/(Ui)/components/skeleton/UserSkeleton";
import PaginatedList from "@/app/(Ui)/components/paginatedList/paginatedList";
import DeleteReport from "@/app/(Ui)/components/Modals/DeleteReport";

const Reports = ({ themeClasses = {} }) => {
  const {
    border = "border-gray-200",
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    text = "text-black",
    bg = "bg-white",
    hover = "hover:bg-gray-50",
  } = themeClasses;

  const { role, loading: userLoading } = useUserPermissions();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [dateFilter, setDateFilter] = useState("ALL");

  if (userLoading) return <UserSkeleton />;

  const fetchReports = async ({ page, limit, search, filters }) => {
    try {
      const res = await axios.get("/api/Reports", {
        params: {
          page,
          limit: limit === "All" ? null : Number(limit),
          search,
          dateFilter: filters?.dateFilter || "ALL",
        },
      });

      return {
        data: res.data.Report.map((r) => ({
          id: r.id,
          description: r.description,
          actionType: r.actionType,
          entityType: r.entityType,
          date: r.date,
        })),
        totalPages: res.data.totalPages,
        totalCount: res.data.totalReports,
      };
    } catch {
      return { data: [], totalPages: 1, totalCount: 0 };
    }
  };

  const columns = [
    { key: "description", label: "Description" },
    { key: "actionType", label: "Action Type" },
    { key: "entityType", label: "Entity Type" },
    { key: "date", label: "Date" },
    ...(role === "Admin" ? [{ key: "actions", label: "Actions" }] : []),
  ];

  const renderRow = (report, index, styles = { limit: 10, page: 1 }) => {
    const limitVal = styles.limit === "All" ? null : Number(styles.limit);

    return (
      <>
        <td className={`px-4 py-4 text-sm ${text}`} title={report.description}>
          {report.description}
        </td>

        {/* Action Type */}
        <td className={`px-4 py-4 text-sm whitespace-nowrap ${text}`}>
          {report.actionType}
        </td>

        {/* Entity Type */}
        <td className={`px-4 py-4 text-sm whitespace-nowrap ${text}`}>
          {report.entityType}
        </td>

        {/* Date */}
        <td className={`px-4 py-4 text-sm whitespace-nowrap ${inactiveText}`}>
          {new Date(report.date).toLocaleString()}
        </td>

        {/* Actions */}
        {role === "Admin" && (
          <td className="px-4 py-4 text-right whitespace-nowrap">
            <button
              title="Delete Report"
              onClick={() => {
                setSelectedReportId(report.id);
                setDeleteModalOpen(true);
              }}
              className="inline-flex cursor-pointer items-center text-red-500 hover:opacity-75 p-1 rounded-full"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </td>
        )}
      </>
    );
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/Reports?id=${selectedReportId}`);
      setDeleteModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* <div className="flex justify-end mb-4">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className={`w-40 p-2 rounded-lg border ${border} ${bg} ${text}`}
        >
          <option value="ALL">All</option>
          <option value="TODAY">Today</option>
          <option value="WEEK">Last 7 Days</option>
          <option value="MONTH">This Month</option>
        </select>
      </div> */}

      {/* 🔥 Reusable PaginatedList */}
      <PaginatedList
        fetchData={fetchReports}
        columns={columns}
        renderRow={renderRow}
        themeClasses={themeClasses}
        // dateFilter={dateFilter}
        filters={[
          {
            key: "dateFilter",
            label: "Date",
            options: [
              { value: "ALL", label: "All" },
              { value: "TODAY", label: "Today" },
              { value: "WEEK", label: "Last 7 Days" },
              { value: "MONTH", label: "This Month" },
            ],
          },
        ]}
      />

      {/* Delete Modal */}
      <DeleteReport
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default Reports;
