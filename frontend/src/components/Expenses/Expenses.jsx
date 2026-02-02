import React, { useState, useEffect } from "react";
import { createExpense, projectname } from "../../api/services/projectServices";
import { useNavigate } from "react-router-dom";

function Expenses() {
    const [expenses, setExpenses] = useState({
        type: "",
        project: "",
        amount: "",
        attachments: null,
        notes: "",
    });

    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await projectname();
                if (response && response.data) {
                    const flattenedProjects = response.data.flatMap(project =>
                        project.projectDetails.map(detail => ({
                            _id: project._id,
                            projectName: detail.projectName
                        }))
                    );
                    setProjects(flattenedProjects);
                    setError(null);
                } else {
                    throw new Error("Failed to fetch projects.");
                }
            } catch (error) {
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpenses((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setExpenses((prev) => ({ ...prev, [name]: files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(expenses).forEach((key) => {
            formData.append(key, expenses[key]);
        });

        try {
            const response = await createExpense(formData);
            if (response.status === 201) {
                alert("Expense data submitted successfully!");
                navigate("/expense-table");
                setExpenses({
                    type: "",
                    project: "",
                    amount: "",
                    attachments: null,
                    notes: "",
                });
            } else {
                alert("There was an issue with the submission.");
            }
        } catch (error) {
            alert("There was an error submitting the data.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <p className="text-xl font-semibold text-blue-600 animate-pulse">
                    Loading...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
                <p className="text-lg font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8">
                <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
                    Expenses Form
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-2 gap-6"
                >
                    {/* Expense Type */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Expense Type
                        </label>
                        <select
                            name="type"
                            value={expenses.type}
                            onChange={handleChange}
                            required
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                            <option value="">-- Select Expense Type --</option>
                            <option value="Office Expenses">Office Expenses</option>
                            <option value="Rents">Rents</option>
                            <option value="Wages">Wages</option>
                            <option value="Project Expenses">Project Expenses</option>
                            <option value="Traveling Expenses">Traveling Expenses</option>
                            <option value="Others">Others</option>
                        </select>

                        {expenses.type === "Others" && (
                            <input
                                type="text"
                                name="otherType"
                                value={expenses.otherType || ""}
                                onChange={handleChange}
                                placeholder="Specify expense type"
                                required
                                className="mt-2 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                        )}
                    </div>

                    {/* Project */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Project (Optional)
                        </label>
                        <select
                            name="project"
                            value={expenses.project}
                            onChange={handleChange}
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                            <option value="">-- Select Project --</option>
                            {projects.map((project) => (
                                <option key={project._id} value={project.projectName}>
                                    {project.projectName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={expenses.amount}
                            onChange={handleChange}
                            required
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                    </div>

                    {/* Attachments */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Attachments
                        </label>
                        <input
                            type="file"
                            name="attachments"
                            onChange={handleFileChange}
                            className="rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                        />
                    </div>

                    {/* Notes */}
                    <div className="col-span-2 flex flex-col">
                        <label className="text-sm font-semibold text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            name="notes"
                            value={expenses.notes}
                            onChange={handleChange}
                            rows="3"
                            className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold px-8 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
                        >
                            Submit Expense
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Expenses;