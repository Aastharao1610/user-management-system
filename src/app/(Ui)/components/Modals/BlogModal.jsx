"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Save, X } from "lucide-react";

export const BlogModal = ({ onClose, existingBlog, onSuccess }) => {
  const isEditMode = !!existingBlog;
  const [title, setTitle] = useState(existingBlog?.title || "");
  const [status, setStatus] = useState(existingBlog?.status || "DRAFT");
  const [content, setContent] = useState(existingBlog?.content || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && !isSaving && onClose();
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, isSaving]);

  const handleStatusChange = (e) => {
    if (!title.trim() || !content.trim()) {
      toast.warning("Please enter title and content before changing status.");
      return;
    }
    setStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      setIsSaving(false);
      return;
    }

    const payload = { id: existingBlog?.id, title, content, status };

    try {
      const res = isEditMode
        ? await axios.put("/api/Blog", payload)
        : await axios.post("/api/Blog", payload);

      if (res.status === 200 || res.status === 201) {
        toast.success(
          isEditMode ? "Blog updated successfully" : "Blog created successfully"
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.data?.error || "Failed to save blog");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while saving blog");
    } finally {
      setIsSaving(false);
    }
  };

  const buttonText =
    status === "DRAFT"
      ? isEditMode
        ? "Save Changes (Draft)"
        : "Save as Draft"
      : isEditMode
      ? "Update & Publish"
      : "Publish Blog";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
      onClick={() => !isSaving && onClose()}
    >
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-2xl font-semibold">
            {isEditMode ? "Edit Blog" : "Create Blog"}
          </h2>
          <button
            onClick={() => !isSaving && onClose()}
            className="p-2 text-gray-600 hover:text-gray-800"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSaving}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <div className="border border-gray-300 rounded-lg shadow-sm">
              <div
                contentEditable={!isSaving}
                suppressContentEditableWarning={true}
                className="min-h-[300px] p-4 focus:outline-none text-gray-800 prose max-w-none"
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              required
              onChange={handleStatusChange}
              disabled={isSaving}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish</option>
            </select>
          </div>

          {/* Footer */}
          <footer className="pt-6 border-t flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => !isSaving && onClose()}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-6 py-2 ${
                status === "DRAFT" ? "bg-yellow-500" : "bg-indigo-600"
              } text-white font-semibold rounded-lg hover:opacity-90 flex items-center disabled:opacity-50`}
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {buttonText}
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
