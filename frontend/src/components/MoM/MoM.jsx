import React, { useState } from 'react';
import { Paperclip, Calendar, Clock, Users } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { createMoM } from '../../api/services/projectServices';
import { useNavigate } from "react-router-dom";

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean']
];

const MoM = () => {
  const navigate = useNavigate();

  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    agenda: '',
    discussionNotes: '',
    actionItems: '',
    agendaFile: null,
    discussionFile: null,
    actionFile: null
  });

  const handleChange = (value, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: value });
  };

  const handleFileChange = (e, field) => {
    setMeetingDetails({ ...meetingDetails, [field]: e.target.files[0] });
  };

  // 🔒 VALIDATION LOGIC
  const validateMeetingTime = () => {
    const { date, startTime, endTime } = meetingDetails;
    if (!date || !startTime || !endTime) {
      alert("Please select meeting date, start time, and end time");
      return false;
    }

    const now = new Date();
    now.setSeconds(0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Meeting date cannot be in the past");
      return false;
    }

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (selectedDate.getTime() === today.getTime() && startDateTime < now) {
      alert("Start time cannot be in the past");
      return false;
    }

    if (endDateTime <= startDateTime) {
      alert("End time must be after start time");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateMeetingTime()) return;

    const formData = new FormData();
    for (const key in meetingDetails) {
      if (!['agendaFile', 'discussionFile', 'actionFile'].includes(key)) {
        if (key === 'discussionNotes') {
          formData.append(key, DOMPurify.sanitize(meetingDetails[key]));
        } else {
          formData.append(key, meetingDetails[key]);
        }
      }
    }

    if (meetingDetails.agendaFile) formData.append('agendaFile', meetingDetails.agendaFile);
    if (meetingDetails.discussionFile) formData.append('discussionFile', meetingDetails.discussionFile);
    if (meetingDetails.actionFile) formData.append('actionFile', meetingDetails.actionFile);

    try {
      await createMoM(formData);
      alert('Meeting saved successfully!');
      navigate("/momdetails");
    } catch (error) {
      console.error(error);
      alert('Failed to save meeting');
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">Create Minutes of Meeting</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            placeholder="Meeting Title"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.title}
            onChange={(e) => handleChange(e.target.value, 'title')}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={meetingDetails.date}
              onChange={(e) => handleChange(e.target.value, 'date')}
              required
            />
            <input
              type="text"
              placeholder="Location"
              className="p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={meetingDetails.location}
              onChange={(e) => handleChange(e.target.value, 'location')}
            />
            <input
              type="time"
              className="p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={meetingDetails.startTime}
              onChange={(e) => handleChange(e.target.value, 'startTime')}
              required
            />
            <input
              type="time"
              className="p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={meetingDetails.endTime}
              onChange={(e) => handleChange(e.target.value, 'endTime')}
              required
            />
          </div>

          <input
            type="text"
            placeholder="Attendees (comma separated)"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.attendees}
            onChange={(e) => handleChange(e.target.value, 'attendees')}
          />

          <textarea
            placeholder="Agenda"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.agenda}
            onChange={(e) => handleChange(e.target.value, 'agenda')}
          />

          <input type="file" onChange={(e) => handleFileChange(e, 'agendaFile')} className="my-2" />

          <div>
            <label className="font-semibold mb-2 block">Discussion Notes</label>
            <ReactQuill
              value={meetingDetails.discussionNotes}
              onChange={(value) => handleChange(value, 'discussionNotes')}
              modules={{ toolbar: toolbarOptions }}
              theme="snow"
              style={{ height: "250px", marginBottom: "10px" }}
            />
            <input type="file" onChange={(e) => handleFileChange(e, 'discussionFile')} />
          </div>

          <textarea
            placeholder="Action Items"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.actionItems}
            onChange={(e) => handleChange(e.target.value, 'actionItems')}
          />
          <input type="file" onChange={(e) => handleFileChange(e, 'actionFile')} className="my-2" />

         <div className="flex justify-between mt-4">
            <div className="flex justify-end">
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Meeting
                </button>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
         </div>
        </form>
      </div>
    </div>
  );
};

export default MoM;