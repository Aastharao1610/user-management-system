"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Calendar, Edit, Plus, Search, Trash2, Ellipsis } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { useUserPermissions } from "@/hooks/usePermission";
import DeleteModal from "@/app/(Ui)/components/Modals/DeleteBlog";
import { BlogModal } from "@/app/(Ui)/components/Modals/BlogModal";
import BlogSkeleton from "@/app/(Ui)/components/skeleton/BlogSkeletion";
import Pagination from "@/app/(Ui)/components/common/page";

const Blog = ({ themeClasses = {} }) => {
  const [blogs, setBlogs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("PUBLISHED");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { loading: userLoading, user, permissions } = useUserPermissions();

  const userPermission = permissions.find((p) => p.name === "Blog") || {
    allowedActions: [],
  };
  const {
    accentColor = "text-indigo-600",
    inactiveText = "text-gray-500",
    hover = "curor-pointer",
    text = "text-black",
    bg = "bg-white",
    border = "border-gray-200",
  } = themeClasses;
  const cardBg = bg === "bg-gray-900" ? "bg-gray-800" : "bg-white";

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PUBLISHED":
        return "text-green-500";
      case "DRAFT":
        return "text-yellow-500";
      case "ARCHIVED":
        return "text-gray-500";
      default:
        return "text-blue-500";
    }
  };

  const fetchBlogs = async (pageNumber = page, pageLimit = limit) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/Blog?page=${pageNumber}&limit=${pageLimit}&search=${search}&status=${selectedStatus}`
      );
      console.log(res, "response");

      setBlogs(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalRecords(res.data?.totalCount || 0);
    } catch (err) {
      toast.error("Error fetching blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, limit, search, selectedStatus]);
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await axios.put("/api/Blog", { id, status: newStatus });

      if (res.status === 200) {
        toast.success(
          newStatus === "ARCHIVED"
            ? "Blog archived successfully"
            : "Blog published successfully"
        );
        fetchBlogs();
        setActiveMenu(null);
      } else {
        toast.error(res.data?.error || "Failed to update blog status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating blog status");
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".relative")) setActiveMenu(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = (id) => {
    setSelectedBlogId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await axios.delete(`/api/Blog?id=${selectedBlogId}`);
      console.log(selectedBlogId, "id");
      console.log(res, "what is response of response");
      if (res.data?.message === "Blog deleted successfully") {
        toast.success(res.data.message);
        fetchBlogs();
      } else {
        toast.error(res.data?.error || "Failed to delete blog");
      }
    } catch (error) {
      toast.error("Error deleting blog!");
      console.error(error);
    } finally {
      setDeleteModalOpen(false);
      setSelectedBlogId(null);
    }
  };
  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const blogStatus = b.status?.trim().toUpperCase();
      const matchStatus = blogStatus === selectedStatus;
      const matchSearch = b.title?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [blogs, selectedStatus, search]);

  console.log(filteredBlogs, "filteredBlogs");

  return (
    <div className="space-y-6">
      {isModalOpen && (
        <BlogModal
          existingBlog={selectedBlog}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBlog(null);
          }}
        />
      )}

      {!userLoading && userPermission.allowedActions.includes("READ") ? (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search Blogs by title or author..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`w-full p-2 pl-10 rounded-lg border ${border} ${cardBg} ${text} text-sm focus:ring-2 ${accentColor.replace(
                  "text",
                  "focus:ring"
                )} focus:border-transparent transition duration-200`}
                style={{ outline: "none" }}
              />

              <Search
                name="Search"
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${inactiveText}`}
              />
            </div>
            {!userLoading &&
              userPermission.allowedActions.includes("CREATE") && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className={`flex cursor-pointer items-center space-x-2 py-2 px-4 rounded-lg font-semibold text-white ${accentColor.replace(
                    "text",
                    "bg"
                  )} transition duration-200 hover:opacity-90 shadow-md ${accentColor.replace(
                    "text",
                    "shadow"
                  )}/50`}
                >
                  <Plus name="Plus" className="w-5 h-5 " />
                  <span>Create New Blog</span>
                </button>
              )}
          </div>

          <div className="flex gap-3">
            {userPermission.allowedActions.includes("CREATE") &&
              ["PUBLISHED", "ARCHIVED", "DRAFT"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-full px-6 py-2 text-md font-semibold cursor-pointer ${
                    selectedStatus === status
                      ? status === "PUBLISHED"
                        ? "bg-green-50 text-green-500"
                        : status === "ARCHIVED"
                        ? "bg-yellow-50 text-yellow-500"
                        : "bg-orange-100 text-orange-500"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {status}
                </button>
              ))}
          </div>

          <div className="flex flex-col  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {loading ? (
              <BlogSkeleton />
            ) : blogs.length === 0 ? (
              <p className="px-24 w-[600px] py-12 text-center justify-center bg-gray-100 mx-auto my-12">
                No blogs found.
              </p>
            ) : (
              blogs.map((post) => (
                <div
                  key={post.id}
                  className={`p-5 w-full  rounded-xl border ${border} ${cardBg} shadow-lg transition-all duration-300 ${hover.replace(
                    "hover:bg-gray",
                    "hover:bg-indigo"
                  )}/5`}
                >
                  <div className="flex justify-between">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        post.statusColor || getStatusColor(post.status)
                      } ${(
                        post.statusColor || getStatusColor(post.status)
                      ).replace("text", "bg")}/10 mb-3 inline-block`}
                    >
                      {post.status}
                    </span>
                    {post.authorId === user?.id &&
                      ["PUBLISHED", "ARCHIVED"].includes(post.status) && (
                        <div className="relative">
                          <button
                            className="cursor-pointer p-1 rounded-full hover:bg-gray-100"
                            onClick={() =>
                              setActiveMenu(
                                post.id === activeMenu ? null : post.id
                              )
                            }
                          >
                            <Ellipsis />
                          </button>

                          {activeMenu === post.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                              {post.status === "PUBLISHED" ? (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(post.id, "ARCHIVED")
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Archive
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleStatusUpdate(post.id, "PUBLISHED")
                                  }
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Publish
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  {/* Title */}
                  <h4
                    className={`text-lg font-bold mb-2 ${text} transition-colors duration-200`}
                  >
                    {post.title}
                  </h4>
                  <p className="text-lg my-3">{post.content}</p>

                  {/* Metadata */}

                  <p className={`text-sm ${inactiveText} mb-3`}>
                    By{" "}
                    <span className={`font-medium ${text}`}>
                      {post.author?.name || "Unknown"}
                    </span>
                  </p>

                  {/* Date */}
                  <div
                    className={`flex space-x-1 text-xs ${inactiveText} mb-4`}
                  >
                    <Calendar size={22} name="Calendar" className="w-4 h-4" />

                    <span>
                      Published on{" "}
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}

                  {!userLoading &&
                    (user?.role === "Admin" || post.authorId === user?.id) && (
                      <>
                        <div className="flex space-x-3 pt-3 border-t border-dashed">
                          {post.status !== "PUBLISHED" &&
                            post.status !== "ARCHIVED" && (
                              <button
                                className={`flex cursor-pointer items-center text-sm ${accentColor} hover:underline`}
                                onClick={() => handleEdit(post)}
                              >
                                <Edit size={20} className="mr-1" /> Edit
                              </button>
                            )}
                          <button
                            className={`flex cursor-pointer items-center text-sm text-red-500 hover:underline`}
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 size={20} className="mr-1" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                </div>
              ))
            )}
          </div>

          <div
            className={`flex justify-center items-center py-4 ${inactiveText}`}
          >
            {blogs.length > 10 && (
              <p className="text-sm">
                Showing {blogs.length} of {blogs.length} Blogs.
              </p>
            )}
          </div>
        </>
      ) : userLoading ? (
        <BlogSkeleton />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg font-semibold text-gray-400">
            You don’t have permission to view blogs.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please contact your administrator if you think this is a mistake.
          </p>
        </div>
      )}
      {!loading && totalRecords > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          setLimit={setLimit}
          totalRecords={totalRecords}
        />
      )}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Blog;
