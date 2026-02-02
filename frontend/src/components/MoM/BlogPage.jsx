import React, { useEffect, useState } from "react";
import { deleteMoM, getMoM } from "../../api/services/projectServices";
import {
  Calendar,
  Clock,
  MapPin,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  FileText,
  Plus,
  NotebookText,
  MessageSquareText,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const BlogPage = () => {
  const [meetingData, setMeetingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const role = localStorage.getItem("role") || "Superadmin";
  const navigate = useNavigate();

  /* ================= HELPERS ================= */

  const cleanText = (text = "") =>
    text.replace(/<\/?[^>]+(>|$)/g, "");

  const formatDateWithDay = (dateStr) => {
    if (!dateStr) return "Date not specified";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Date not specified";

    const datePart = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    return `${datePart} (${day})`;
  };

  const formatTime = (time) => {
  if (!time) return null;

  // If already in AM/PM format
  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
    return time.toUpperCase();
  }

  const [h, m] = time.split(":");
  if (!h || !m) return null;

  const date = new Date();
  date.setHours(parseInt(h, 10), parseInt(m, 10));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getTimeRange = (start, end) => {
  const formattedStart = formatTime(start);
  const formattedEnd = formatTime(end);

  // Case 1: both start and end valid
  if (formattedStart && formattedEnd) return `${formattedStart} - ${formattedEnd}`;

  // Case 2: only start valid
  if (formattedStart) return formattedStart;

  // Case 3: only end valid (show it but mark start missing)
  if (formattedEnd) return `Start time not specified - ${formattedEnd}`;

  // Case 4: both missing
  return "Time not specified";
};

  /* ================= FETCH ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMoM();
        setMeetingData(res.data || []);
      } catch (err) {
        setError("Failed to fetch meeting minutes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= ACTIONS ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    await deleteMoM(id);
    setMeetingData((prev) => prev.filter((m) => m._id !== id));
  };

  const handleExport = () => {
    const data = meetingData.map((m) => ({
      Title: m.title,
      Date: formatDateWithDay(m.date),
      Time: getTimeRange(m.startTime, m.endTime),
      Location: m.location,
      Agenda: cleanText(m.agenda),
      Discussion: cleanText(m.discussionNotes),
      Action_Items: cleanText(m.actionItems),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meeting Minutes");
    XLSX.writeFile(wb, "meeting-minutes.xlsx");
  };

  /* ================= UI STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 mt-32 text-lg">{error}</div>
    );
  }

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 px-6 py-10 mt-24">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-800 flex items-center gap-3">
          <NotebookText size={32} />
          Meeting Minutes
        </h1>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/mom")}
            className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            <Plus size={16} /> Add MoM
          </button>

          {role === "Superadmin" && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              <Download size={16} /> Export
            </button>
          )}
        </div>
      </div>

      {/* CARDS */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {meetingData.map((meeting) => (
          <div
            key={meeting._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition"
          >
            <div className="p-6">

              <h2 className="text-xl font-bold text-center text-indigo-700 mb-4">
                {meeting.title}
              </h2>

                            <div className="flex flex-wrap items-center gap-2 mb-3 text-indigo-600 font-semibold">
                <MessageSquareText size={18} />
                {meeting.attendees
                    ? Array.isArray(meeting.attendees)
                    ? `Attendees: ${meeting.attendees.join(", ")}`
                    : `Attendees: ${meeting.attendees}` // if it's a string
                    : "No attendees"}
                </div>

              <div className="flex items-center gap-2 text-blue-700">
                <Calendar size={16} /> {formatDateWithDay(meeting.date)}
              </div>

             <div className="flex items-center gap-2 text-purple-700 mt-2">
              <Clock size={16} /> {getTimeRange(meeting.startTime, meeting.endTime)}
            </div>

              <div className="flex items-center gap-2 text-emerald-700 mt-2">
                <MapPin size={16} /> {meeting.location}
              </div>

              <p className="mt-4 text-gray-700 line-clamp-3">
                <strong>Agenda:</strong> {cleanText(meeting.agenda)}
              </p>

              <p className="mt-2 text-gray-700 line-clamp-3">
                <strong>Discussion Notes:</strong> {cleanText(meeting.discussionNotes)}
              </p>

              <p className="mt-2 text-gray-700 line-clamp-3">
                <strong>Action Items:</strong> {cleanText(meeting.actionItems)}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="px-6 pb-5 flex justify-between items-center">
              <span className="flex items-center gap-2 text-indigo-600 text-sm font-medium">
                <FileText size={16} /> Meeting Minutes
              </span>

              <div className="relative group">
                <MoreVertical className="cursor-pointer" />
                <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg w-44 opacity-0 group-hover:opacity-100 transition z-10">
                  <button
                    onClick={() => { setSelectedMeeting(meeting); setIsModalOpen(true); }}
                    className="w-full px-4 py-2 flex gap-2 hover:bg-gray-100"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => navigate(`/mom-edit/${meeting._id}`)}
                    className="w-full px-4 py-2 flex gap-2 hover:bg-gray-100"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(meeting._id)}
                    className="w-full px-4 py-2 flex gap-2 text-red-600 hover:bg-gray-100"
                  >
                    <Trash size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODAL */}
      {isModalOpen && selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 bg-indigo-600 text-white">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <NotebookText size={20} /> Meeting Minutes
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl">×</button>
            </div>

            <div className="p-6 space-y-4 text-gray-700">
              <h3 className="text-2xl font-bold text-indigo-700 text-center">
                {selectedMeeting.title}
              </h3>

              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                <div className="flex items-center gap-2 text-blue-700">
                  <Calendar size={16} /> {formatDateWithDay(selectedMeeting.date)}
                </div>

                <div className="flex items-center gap-2 text-purple-700">
                  <Clock size={16} /> {getTimeRange(selectedMeeting.startTime, selectedMeeting.endTime)}
                </div>

                <div className="flex items-center gap-2 text-emerald-700">
                  <MapPin size={16} /> {selectedMeeting.location}
                </div>
              </div>

              <hr />

              <div>
                <h4 className="font-semibold text-indigo-700">Agenda</h4>
                <p>{cleanText(selectedMeeting.agenda)}</p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-700">Discussion Notes</h4>
                <p>{cleanText(selectedMeeting.discussionNotes)}</p>
              </div>

              <div>
                <h4 className="font-semibold text-indigo-700">Action Items</h4>
                <p>{cleanText(selectedMeeting.actionItems)}</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;