"use client";
import { useEffect, useState } from "react";

export default function AllEmployees() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [updatedEmployeeData, setUpdatedEmployeeData] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch("/api/employee/all");
                const data = await res.json();
                if (res.ok) {
                    setEmployees(data.employees);
                } else {
                    setError("Failed to fetch employees");
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
                setError("Failed to fetch employees");
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setUpdatedEmployeeData(employee);
    };

    const handleInputChange = (e, field) => {
        setUpdatedEmployeeData((prev) => ({
            ...prev,
            [field]: field === "password" && e.target.value === "" ? undefined : e.target.value,
        }));
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch("/api/employee/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedEmployeeData),
            });

            if (res.ok) {
                setEmployees((prev) =>
                    prev.map((emp) =>
                        emp.id === updatedEmployeeData.id ? updatedEmployeeData : emp
                    )
                );
                setEditingEmployee(null);
            } else {
                alert("Failed to update employee.");
            }
        } catch (error) {
            console.error("Error updating employee:", error);
            alert("An error occurred while updating the employee.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this employee?")) return;

        try {
            const res = await fetch("/api/employee/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                setEmployees((prev) => prev.filter((emp) => emp.id !== id));
            } else {
                alert("Failed to delete employee.");
            }
        } catch (error) {
            console.error("Error deleting employee:", error);
            alert("An error occurred while deleting the employee.");
        }
    };

    const filteredEmployees = employees.filter((employee) =>
        [employee.name, employee.email, employee.department, employee.role]
            .some((field) => field.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">All Employees</h2>
            <div className="relative w-full sm:w-3/4 md:w-2/3 mx-auto">
                <input
                    type="text"
                    placeholder="Search employees by name, email, department, or role..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 4a7 7 0 110 14 7 7 0 010-14zm0 0v2m0 12v2m8-8h2m-2 0h-2m-12 0H3m2 0h2m8-2h2m2 0h2"
                    />
                </svg>
            </div>
            {loading && <div className="mt-6 text-center text-gray-500">Loading employees...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
            {
                filteredEmployees.length === 0 && !loading && !error && (
                    <p className="text-center text-gray-600">No employees found.</p>
                )
            }
            <div className="mt-4 space-y-4">
                {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-all duration-300">
                        <div className="flex justify-between items-center">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-700 font-semibold w-24">Name:</label>
                                    <h3 className="text-xl font-medium">{employee.name}</h3>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-700 font-semibold w-24">Email:</label>
                                    <p className="text-gray-600">{employee.email}</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-700 font-semibold w-24">Department:</label>
                                    <p className="text-gray-600">{employee.department}</p>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="text-gray-700 font-semibold w-24">Role:</label>
                                    <p className="text-gray-600 capitalize">{employee.role}</p>
                                </div>
                            </div>

                            <div className="space-x-2">
                                <button
                                    onClick={() => handleEdit(employee)}
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(employee.id)}
                                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {
                editingEmployee && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                            <h3 className="text-2xl font-bold mb-3">Edit Employee</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 font-semibold">Name:</label>
                                    <input
                                        type="text"
                                        value={updatedEmployeeData.name}
                                        onChange={(e) => handleInputChange(e, "name")}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                        placeholder="Enter name"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 font-semibold">Email:</label>
                                    <input
                                        type="email"
                                        value={updatedEmployeeData.email}
                                        onChange={(e) => handleInputChange(e, "email")}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                        placeholder="Enter email"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 font-semibold">Department:</label>
                                    <input
                                        type="text"
                                        value={updatedEmployeeData.department}
                                        onChange={(e) => handleInputChange(e, "department")}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                        placeholder="Enter department"
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 font-semibold">Role:</label>
                                    <select
                                        value={updatedEmployeeData.role}
                                        onChange={(e) => handleInputChange(e, "role")}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="employee">Employee</option>
                                    </select>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <label className="text-gray-700 font-semibold">New Password:</label>
                                    <input
                                        type="password"
                                        placeholder="Leave blank to keep the same"
                                        value={updatedEmployeeData.password || ""}
                                        onChange={(e) => handleInputChange(e, "password")}
                                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setEditingEmployee(null)}
                                    className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all duration-200"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
