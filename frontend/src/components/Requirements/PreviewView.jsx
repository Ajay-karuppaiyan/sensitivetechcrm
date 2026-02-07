import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Topbar from "../Topbar/Topbar"; // ✅ Correct path

const PreviewView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/preview/${id}`);
        const data = await res.json();
        if (res.ok) setSubmission(data);
        else alert(data.error || "Submission not found");
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    };
    fetchSubmission();
  }, [id]);

  if (!submission) return <div className="p-10 text-center">Loading...</div>;

  const { clientInfo, requirements } = submission;

  const formatValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (!value) return "Not Provided";
    if (typeof value === "object") return JSON.stringify(value);
    return value;
  };

  const renderNested = (data) =>
    Object.entries(data).map(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={key} className="ml-4 mb-2">
            <p className="font-semibold">{key}</p>
            {renderNested(value)}
          </div>
        );
      }
      return (
        <div key={key} className="flex justify-between px-4 py-2 bg-slate-50 rounded mb-1">
          <span>{key}</span>
          <span>{formatValue(value)}</span>
        </div>
      );
    });

  return (
    <>
      <Topbar /> {/* Fixed Topbar */}

      <div className="max-w-4xl mx-auto p-6 pt-28"> {/* pt-28 offsets topbar height */}
        <h1 className="text-3xl font-bold text-center mb-6">Preview Submission</h1>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Client Info</h2>
          <p><b>Name:</b> {clientInfo.name}</p>
          <p><b>Email:</b> {clientInfo.email}</p>
          <p><b>Phone:</b> {clientInfo.phone}</p>
          <p><b>Company:</b> {clientInfo.company || "N/A"}</p>
          <p><b>Notes:</b> {clientInfo.notes || "N/A"}</p>
        </div>

        {Object.entries(requirements)
          .filter(([key]) => key !== "Step 5 – User Flow Table")
          .map(([title, step]) => (
            <div key={title} className="bg-white p-6 rounded shadow mb-6">
              <h2 className="text-xl font-semibold mb-4">{title}</h2>
              {renderNested(step)}
            </div>
          ))}

        {requirements["Step 5 – User Flow Table"]?.map((table, idx) => (
          <div key={idx} className="mb-4 border rounded overflow-x-auto">
            <h3 className="p-2 bg-slate-100">Table {idx + 1}</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border px-4 py-2">User Type</th>
                  <th className="border px-4 py-2">Platform</th>
                  <th className="border px-4 py-2">Operations</th>
                  <th className="border px-4 py-2">Use Cases</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={i}>
                    <td className="border px-4 py-2">{row.userType || "N/A"}</td>
                    <td className="border px-4 py-2">{row.platform || "N/A"}</td>
                    <td className="border px-4 py-2">{row.operations || "N/A"}</td>
                    <td className="border px-4 py-2">{row.useCases || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <button
          onClick={() => navigate("/requirements-table")}
          className="px-6 py-2 bg-gray-600 text-white rounded"
        >
          Back
        </button>
      </div>
    </>
  );
};

export default PreviewView;
