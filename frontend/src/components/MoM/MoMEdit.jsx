import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Calendar, Clock, Users, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getMoMById, updateMoM } from '../../api/services/projectServices';

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['clean'],
];

const MoMEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    agendaFile: '',
    discussionFile: '',
    actionFile: '',
  });

  const [existingFiles, setExistingFiles] = useState({
    agendaFile: null,
    discussionFile: null,
    actionFile: null
  });

  useEffect(() => {
    const fetchMoMData = async () => {
      if (!id) return setError('Invalid meeting ID'), setLoading(false);

      try {
        setLoading(true);
        const response = await getMoMById(id);

        if (response?.data) {
          setMeetingDetails({
            title: response.data.title || '',
            date: response.data.date || '',
            startTime: response.data.startTime || '',
            endTime: response.data.endTime || '',
            location: response.data.location || '',
            attendees: response.data.attendees || '',
            agenda: response.data.agenda || '',
            discussionNotes: response.data.discussionNotes || '',
            actionItems: response.data.actionItems || '',
            agendaFile: '',
            discussionFile: '',
            actionFile: '',
          });
          setExistingFiles({
            agendaFile: response.data.agendaFile || null,
            discussionFile: response.data.discussionFile || null,
            actionFile: response.data.actionFile || null,
          });
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load meeting details');
      } finally {
        setLoading(false);
      }
    };

    fetchMoMData();
  }, [id]);

  const handleChange = (value, field) => setMeetingDetails(prev => ({ ...prev, [field]: value }));
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setMeetingDetails(prev => ({ ...prev, [field]: file }));
      setExistingFiles(prev => ({ ...prev, [field]: null }));
    }
  };
  const handleRemoveExistingFile = (field) => {
    setExistingFiles(prev => ({ ...prev, [field]: null }));
    setMeetingDetails(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(meetingDetails).forEach(key => {
        if (!key.includes('File')) formData.append(key, meetingDetails[key]);
      });
      ['agendaFile', 'discussionFile', 'actionFile'].forEach(field => {
        if (meetingDetails[field] instanceof File) formData.append(field, meetingDetails[field]);
      });

      const response = await updateMoM(id, formData);
      if (response.status === 200) {
        alert('Meeting updated successfully!');
        navigate("/momdetails");
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update meeting');
    }
  };

  const FileAttachment = ({ field, label }) => (
    <div className="mt-2">
      {existingFiles[field] ? (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Paperclip className="w-4 h-4" />
          <a href={existingFiles[field]} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
            {existingFiles[field].split('/').pop()}
          </a>
          <button type="button" onClick={() => handleRemoveExistingFile(field)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
          <Paperclip className="w-5 h-5 text-blue-500" />
          {label}
          <input type="file" onChange={(e) => handleFileChange(e, field)} className="hidden" />
        </label>
      )}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-700 text-lg">Loading...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-600 text-lg">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-white to-blue-400 py-16">
      <div className="max-w-4xl mx-auto bg-blue-100 shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-8">Edit Minutes of Meeting</h1>
        <form onSubmit={handleSubmit} className="space-y-6">

          <input
            type="text"
            placeholder="Meeting Title"
            className="w-full p-3 text-xl border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.title}
            onChange={(e) => handleChange(e.target.value, 'title')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="date"
                className="w-full pl-10 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={meetingDetails.date}
                onChange={(e) => handleChange(e.target.value, 'date')}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Location"
                className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={meetingDetails.location}
                onChange={(e) => handleChange(e.target.value, 'location')}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="time"
                className="w-full pl-10 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={meetingDetails.startTime}
                onChange={(e) => handleChange(e.target.value, 'startTime')}
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-[2.1rem] h-5 w-5 text-gray-400" />
              <input
                type="time"
                className="w-full pl-10 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={meetingDetails.endTime}
                onChange={(e) => handleChange(e.target.value, 'endTime')}
              />
            </div>
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Attendees (comma separated)"
              className="w-full pl-10 p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={meetingDetails.attendees}
              onChange={(e) => handleChange(e.target.value, 'attendees')}
            />
          </div>

          <textarea
            rows="4"
            placeholder="Agenda"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.agenda}
            onChange={(e) => handleChange(e.target.value, 'agenda')}
          />
          <FileAttachment field="agendaFile" label="Attach agenda file" />

          <label className="block mt-4 text-sm font-medium text-gray-700">Discussion Notes</label>
          <ReactQuill
            value={meetingDetails.discussionNotes}
            onChange={(value) => handleChange(value, 'discussionNotes')}
            modules={{ toolbar: toolbarOptions }}
            theme="snow"
            style={{ height: '200px', marginBottom: '10px' }}
          />
          <FileAttachment field="discussionFile" label="Attach discussion file" />

          <textarea
            rows="4"
            placeholder="Action Items"
            className="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={meetingDetails.actionItems}
            onChange={(e) => handleChange(e.target.value, 'actionItems')}
          />
          <FileAttachment field="actionFile" label="Attach action items file" />

        <div className="flex justify-between mt-4">
  <button
    type="button"
    onClick={() => navigate(-1)}
    className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
  >
    Cancel
  </button>
  <button
    type="submit"
    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
  >
    Update Meeting
  </button>
</div>

        </form>
      </div>
    </div>
  );
};

export default MoMEdit;