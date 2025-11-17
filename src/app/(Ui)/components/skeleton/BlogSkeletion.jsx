import React from "react";

const BlogSkeleton = () => {
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="flex flex-col grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
      <div className="bg-gray-50 w-72 py-3 my-3 rounded-xs"></div>
      <div className="flex gap-5">
        <button className="w-44 rounded-full bg-gray-100 px-3 py-6"></button>
        <button className="w-44 rounded-full bg-gray-100 px-3 py-6"></button>
        <button className="w-44 rounded-full bg-gray-100 px-3 py-6"></button>
      </div>

      {skeletons.map((_, index) => (
        <div
          key={index}
          className="p-5 rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          {/* Status Badge */}
          <div className="flex justify-between mb-3">
            <div className="h-4 w-16 bg-gray-200 rounded-full" />
            <div className="h-4 w-4 bg-gray-200 rounded-full" />
          </div>

          {/* Title */}
          <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />

          {/* Content */}
          <div className="h-4 w-full bg-gray-200 rounded mb-1" />
          <div className="h-4 w-5/6 bg-gray-200 rounded mb-4" />

          {/* Author */}
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-3" />

          {/* Date */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-3 border-t border-dashed">
            <div className="h-4 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogSkeleton;
