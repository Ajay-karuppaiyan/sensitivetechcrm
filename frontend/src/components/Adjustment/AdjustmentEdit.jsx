import React, { useState, useEffect } from "react";
import {
    updatePayroll,
    getPayrollById,
    employeename
} from "../../api/services/projectServices";
import { useParams, useNavigate } from "react-router-dom";

function AdjustmentEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const empid = localStorage.getItem("empId");

    const [payrolls, setPayrolls] = useState([
        { empId: "", type: "", month: "", amount: "", note: "" },
    ]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const res = await employeename(empid);
                setEmployees(res.data);
            } catch {
                setError("Failed to fetch employees");
            } finally {
                setLoading(false);
            }
        };

        const fetchPayrollData = async () => {
            if (id) {
                try {
                    const res = await getPayrollById(id);
                    setPayrolls([res.data]);
                } catch {
                    setError("Failed to fetch adjustment data");
                }
            }
        };

        fetchEmployees();
        fetchPayrollData();
    }, [id, empid]);

    const handleChange = (index, e) => {
        const { name, value } = e.target;
        setPayrolls(prev => {
            const updated = [...prev];
            updated[index][name] = value;
            return updated;
        });
    };

    const handleAddFields = () => {
        setPayrolls(prev => [
            ...prev,
            { empId: "", type: "", month: "", amount: "", note: "" },
        ]);
    };

    const handleRemoveFields = (index) => {
        setPayrolls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            for (const data of payrolls) {
                const res = await updatePayroll(id, data);
                if (res.status === 200) {
                    alert("Adjustment updated successfully!");
                    navigate("/adjustment-table");
                }
            }
        } catch {
            alert("Update failed");
        }
    };

    if (loading) {
        return (
            <p className="text-center mt-32 text-xl text-blue-700">
                Loading...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-center mt-32 text-xl text-red-600">
                {error}
            </p>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-16">
            
            {/* TITLE */}
            <div className="max-w-5xl mx-auto mt-20 mb-12 px-4">
                <h2 className="text-4xl font-bold text-center text-indigo-800 mb-3">
                    Edit Adjustment
                </h2>
                <p className="text-center text-gray-600">
                    Update employee payroll adjustments with accuracy
                </p>
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="max-w-5xl mx-auto bg-white/90 backdrop-blur-lg
                           border border-indigo-100 rounded-2xl shadow-2xl
                           p-10"
            >
                {payrolls.map((payroll, index) => (
                    <div
                        key={payroll._id || index}
                        className="bg-indigo-50 border border-indigo-200
                                   rounded-xl p-6 mb-8 space-y-5"
                    >
                        {/* Employee */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Employee
                            </label>
                            <select
                                name="empId"
                                value={payroll.empId}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="w-full p-3 rounded-lg border border-indigo-300
                                           focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Employee</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Type
                            </label>
                            <select
                                name="type"
                                value={payroll.type}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="w-full p-3 rounded-lg border border-indigo-300"
                            >
                                <option value="">Select Type</option>
                                <option value="Allowances">Allowances</option>
                                <option value="Deductions">Deductions</option>
                                <option value="Advance">Advance</option>
                            </select>
                        </div>

                        {/* Month */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Month
                            </label>
                            <select
                                name="month"
                                value={payroll.month}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="w-full p-3 rounded-lg border border-indigo-300"
                            >
                                <option value="">Select Month</option>
                                {[
                                    "January","February","March","April","May","June",
                                    "July","August","September","October","November","December"
                                ].map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Amount
                            </label>
                            <input
                                type="number"
                                name="amount"
                                value={payroll.amount}
                                onChange={(e) => handleChange(index, e)}
                                required
                                className="w-full p-3 rounded-lg border border-indigo-300"
                            />
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-semibold text-indigo-700 mb-2">
                                Note
                            </label>
                            <textarea
                                name="note"
                                value={payroll.note}
                                onChange={(e) => handleChange(index, e)}
                                rows="4"
                                className="w-full p-3 rounded-lg border border-indigo-300"
                            />
                        </div>

                        {payrolls.length > 1 && (
                            <div className="text-right">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFields(index)}
                                    className="text-red-600 font-semibold hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* ADD MORE – TOP */}
                <div className="flex justify-center mb-8">
                    <button
                        type="button"
                        onClick={handleAddFields}
                        className="bg-emerald-600 hover:bg-emerald-700
                                   text-white px-8 py-3 rounded-xl shadow-lg"
                    >
                        + Add More
                    </button>
                </div>

                {/* ACTION BUTTONS – BOTTOM */}
                <div className="flex justify-end gap-6">
                    <button
                        type="button"
                        onClick={() => navigate("/adjustment-table")}
                        className="bg-gray-500 hover:bg-gray-600
                                   text-white px-12 py-3 rounded-xl shadow-lg"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700
                                   text-white px-12 py-3 rounded-xl shadow-lg"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AdjustmentEdit;