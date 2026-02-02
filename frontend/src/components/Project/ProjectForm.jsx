import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { createProject, employeename } from "../../api/services/projectServices";

const ProjectForm = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const id = localStorage.getItem("empId");
  const [role, setRole] = useState(localStorage.getItem("role") || "Superadmin");

  const statuses = ["Pending", "In Progress", "Completed", "On Hold"];

  const [projectDetails, setProjectDetails] = useState([
    {
      projectName: "",
      type: "",
      requirements: "",
      description: "",
      category: "",
      techStack: "",
      domain: "",
      designation: "",
      addOnServices: "",
      duration: "",
      dependencies: "",
      companyName: "",
      task: "",
    },
  ]);

  const [financialDetails, setFinancialDetails] = useState([
    {
      quotedValue: "",
      approvedValue: "",
      paymentTerms: "",
      finalQuotation: "",
      taxTerms: "",
    },
  ]);

  const [additionalDetails, setAdditionalDetails] = useState([
    {
      projectDocument: null,
      nda: null,
      msa: null,
      assignedTo: "",
      status: "",
      createdDate: new Date().toISOString().split("T")[0],
    },
  ]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeename(`${id}`);
        if (response) setEmployees(response.data);
        else throw new Error("Failed to fetch employees.");
      } catch (error) {
        console.error(error);
        setError("Failed to fetch employees. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, [role, id]);

  const capitalizeLabel = (label) => {
    return label
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, str => str.toUpperCase())
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleAddProject = async () => {
    if (!validateForm()) {
      alert("Please fill out all mandatory fields!");
      return;
    }

    const projectData = { projectDetails, financialDetails, additionalDetails };

    try {
      const response = await createProject(projectData);
      if (response?.status === 201 || response?.status === 200) {
        alert("Project added successfully!");
        navigate("/project");
      } else {
        alert("Failed to create project. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "An error occurred while creating the project.");
    }
  };

  const validateForm = () => {
    const projectValidation = projectDetails.every(
      (d) => d.projectName && d.type && d.description && d.category && d.techStack && d.companyName && d.task
    );
    const financialValidation = financialDetails.every(
      (d) => d.quotedValue && d.approvedValue && d.paymentTerms
    );
    const additionalValidation = additionalDetails.every(
      (d) => d.assignedTo && d.status
    );
    return projectValidation && financialValidation && additionalValidation;
  };

  const handleInputChange = (index, section, field, value) => {
    const sectionState = section === "projectDetails" ? projectDetails : section === "financialDetails" ? financialDetails : additionalDetails;
    const updatedDetails = [...sectionState];
    updatedDetails[index][field] = value;

    if (section === "projectDetails") setProjectDetails(updatedDetails);
    if (section === "financialDetails") setFinancialDetails(updatedDetails);
    if (section === "additionalDetails") setAdditionalDetails(updatedDetails);
  };

  const handleFileChange = (index, field, e) => {
    const updatedDetails = [...additionalDetails];
    updatedDetails[index][field] = e.target.files[0];
    setAdditionalDetails(updatedDetails);
  };

  const addSection = (section) => {
    const defaultValue =
      section === "projectDetails"
        ? { projectName: "", type: "", requirements: "", description: "", category: "", techStack: "", domain: "", designation: "", addOnServices: "", duration: "", dependencies: "", companyName: "", task: "" }
        : section === "financialDetails"
          ? { quotedValue: "", approvedValue: "", paymentTerms: "", finalQuotation: "", taxTerms: "" }
          : { projectDocument: null, nda: null, msa: null, assignedTo: "", status: "", createdDate: new Date().toISOString().split("T")[0] };

    if (section === "projectDetails") setProjectDetails(prev => [...prev, defaultValue]);
    if (section === "financialDetails") setFinancialDetails(prev => [...prev, defaultValue]);
    if (section === "additionalDetails") setAdditionalDetails(prev => [...prev, defaultValue]);
  };

  const removeSection = (section, index) => {
    const sectionState = section === "projectDetails" ? projectDetails : section === "financialDetails" ? financialDetails : additionalDetails;
    if (sectionState.length > 1) {
      const updatedDetails = sectionState.filter((_, i) => i !== index);
      if (section === "projectDetails") setProjectDetails(updatedDetails);
      if (section === "financialDetails") setFinancialDetails(updatedDetails);
      if (section === "additionalDetails") setAdditionalDetails(updatedDetails);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><p className="text-xl">Loading...</p></div>;
  if (error) return <div className="min-h-screen flex justify-center items-center"><p className="text-xl text-red-600">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200 p-6 flex justify-center items-start pt-24">

      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-7xl space-y-8">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Add New Project</h1>
        <form className="space-y-8">
          {[
            ["Project Details", projectDetails, "projectDetails"],
            ["Financial Details", financialDetails, "financialDetails"],
            ["Additional Details", additionalDetails, "additionalDetails"]
          ].map(([title, details, section]) => (
            <section key={section} className="border-l-4 border-blue-400 rounded-xl p-6 space-y-4 bg-gray-50 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h2>

              {details.map((detail, index) => (
                <div key={index} className="rounded-lg p-4 bg-white shadow-sm relative space-y-4">
                  {details.length > 1 && (
                    <button type="button" onClick={() => removeSection(section, index)} className="absolute top-2 right-2 text-red-500 hover:text-red-600">
                      <X />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.keys(detail).map(field => field !== "task" && (
                      <div key={field}>
                        <label className="block text-gray-600 mb-1 font-medium">{capitalizeLabel(field)}</label>
                        {field === "assignedTo" ? (
                          <select
                            value={detail[field]}
                            onChange={e => handleInputChange(index, section, field, e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="">Select User</option>
                            {employees.map(emp => <option key={emp._id} value={emp.name}>{emp.name}</option>)}
                          </select>
                        ) : field === "status" ? (
                          <select
                            value={detail[field]}
                            onChange={e => handleInputChange(index, section, field, e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="">Select Status</option>
                            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
                          </select>
                        ) : field.includes("Document") ? (
                          <input type="file" onChange={e => handleFileChange(index, field, e)} className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        ) : (
                          <input type={field.includes("Date") ? "date" : "text"} value={detail[field]} onChange={e => handleInputChange(index, section, field, e.target.value)} className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        )}
                      </div>
                    ))}
                  </div>

                  {section === "projectDetails" && (
                    <div className="col-span-1 md:col-span-3 mt-4">
                      <label className="block text-gray-600 mb-1 font-medium">Task</label>
                      <textarea value={detail.task} onChange={e => handleInputChange(index, section, "task", e.target.value)} rows="4" className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                    </div>
                  )}
                </div>
              ))}

              <button type="button" onClick={() => addSection(section)} className="flex items-center text-blue-500 hover:text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                <Plus className="mr-2" /> Add More {title}
              </button>
            </section>
          ))}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate("/project")} className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-200">Cancel</button>
            <button type="button" onClick={handleAddProject} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200">Add Project</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;