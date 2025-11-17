import React from "react";

export const UserSkeleton = () => {
  const rows = Array.from({ length: 12 });

  return (
    <div className="rounded-xl shadow-lg mt-10  dark:border-gray-700 bg-white   animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 ">
            {rows.map((_, idx) => (
              <tr key={idx}>
                <td className="px-4 py-4">
                  <div className="h-4 w-6 bg-gray-300 " />
                </td>
                <td className="px-3 py-4">
                  <div className="flex flex-col space-y-2">
                    <div className="h-4 w-32 bg-gray-300  rounded" />
                    <div className="h-3 w-24 bg-gray-200  rounded" />
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <div className="h-4 w-48 bg-gray-300  rounded" />
                </td>
                <td className="px-4 py-4 hidden md:table-cell">
                  <div className="h-4 w-24 bg-gray-300  rounded" />
                </td>
                <td className="px-3 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <div className="h-4 w-4 bg-gray-300  rounded-full" />
                    <div className="h-4 w-4 bg-gray-300  rounded-full" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="py-4 text-center">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 mx-auto rounded" />
      </div>
    </div>
  );
};

export default UserSkeleton;
