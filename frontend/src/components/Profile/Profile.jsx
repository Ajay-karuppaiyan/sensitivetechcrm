import React from "react";
import { FaTimes, FaUserCircle } from "react-icons/fa";

export default function ProfileModal({ userProfile, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-lg"
        >
          <FaTimes />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FaUserCircle className="text-blue-600 text-4xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-600">
              {userProfile.name}
            </h2>
            <p className="text-sm text-gray-500">
              {userProfile.position}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Name</span>
            <span className="font-semibold text-gray-800">
              {userProfile.name}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-600 font-medium">Email</span>
            <span className="font-semibold text-gray-800 break-all">
              {userProfile.email}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Position</span>
            <span className="font-semibold text-gray-800">
              {userProfile.position}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}