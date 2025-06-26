"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import * as XLSX from "xlsx";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function BookingReport() {
    const [completedBookings, setCompletedBookings] = useState([]);
    const [monthlyBookings, setMonthlyBookings] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchCompletedBookings();
        fetchMonthlyBookings(year);
    }, [year]);

    const fetchCompletedBookings = async () => {
        try {
            const res = await fetch("/api/bookings/report");
            const data = await res.json();
            if (res.ok) {
                setCompletedBookings(data.completedBookings);
            }
        } catch (error) {
            console.error("Error fetching completed bookings:", error);
        }
    };

    const fetchMonthlyBookings = async (selectedYear) => {
        try {
            const res = await fetch("/api/bookings/report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ year: selectedYear }),
            });

            const data = await res.json();
            if (res.ok) {
                setMonthlyBookings(data.monthlyBookings);
            }
        } catch (error) {
            console.error("Error fetching monthly room bookings:", error);
        }
    };

    const filteredBookings = completedBookings.filter((booking) => {
        return (
            (!selectedMonth || new Date(booking.BookingDate).getMonth() + 1 === Number(selectedMonth)) &&
            (!selectedYear || new Date(booking.BookingDate).getFullYear() === Number(selectedYear))
        );
    });

    const roomNames = [...new Set(monthlyBookings.map((b) => b.RoomName))];

    const series = roomNames.map((room) => ({
        name: room,
        data: Array(12).fill(0).map((_, i) => {
            const found = monthlyBookings.find((b) => b.month === i + 1 && b.RoomName === room);
            return found ? found.count : 0;
        }),
    }));

    const options = {
        chart: { type: "bar", stacked: true },
        xaxis: {
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        },
        plotOptions: {
            bar: { horizontal: false, columnWidth: "60%" },
        },
    };

    const formatBookingDate = (date) => format(new Date(date), "yyyy-MM-dd");
    const formatTime = (timeString) => timeString.slice(0, 5);

    const downloadExcel = () => {
        if (filteredBookings.length === 0) {
            alert("There is no bookings to export.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(
            filteredBookings.map((booking) => ({
                "Room Name": booking.RoomName,
                "Employee Name": booking.EmployeeName,
                "Booking Date": formatBookingDate(booking.BookingDate),
                "Start Time": formatTime(booking.StartTime),
                "End Time": formatTime(booking.EndTime),
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Completed Bookings");
        XLSX.writeFile(workbook, `Completed_Bookings_${selectedYear}_${selectedMonth || "All"}.xlsx`);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h2 className="text-4xl font-semibold text-gray-800 mb-6 text-center">Booking Report</h2>
            <div className="flex items-center justify-center mb-6">
                <label className="mr-2 font-medium">Select Year:</label>
                <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {[...Array(5)].map((_, i) => {
                        const y = new Date().getFullYear() - i;
                        return (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Room Bookings ({year})</h3>
                <Chart options={options} series={series} type="bar" height={350} />
            </div>
            <div className="flex justify-center gap-4 mb-6">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Months</option>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{format(new Date(2022, i, 1), "MMMM")}</option>
                    ))}
                </select>
                <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {[...Array(5)].map((_, i) => {
                        const y = new Date().getFullYear() - i;
                        return <option key={y} value={y}>{y}</option>;
                    })}
                </select>
            </div>
            <div className="bg-white p-6 shadow-lg rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Completed Bookings</h3>
                    <button onClick={downloadExcel} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Download Excel
                    </button>
                </div>
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-3 text-left">Room</th>
                            <th className="border p-3 text-left">Employee</th>
                            <th className="border p-3 text-left">Date</th>
                            <th className="border p-3 text-left">Start Time</th>
                            <th className="border p-3 text-left">End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map((booking) => (
                            <tr key={booking.BookingId} className="hover:bg-gray-50">
                                <td className="border p-3">{booking.RoomName}</td>
                                <td className="border p-3">{booking.EmployeeName}</td>
                                <td className="border p-3">{formatBookingDate(booking.BookingDate)}</td>
                                <td className="border p-3">{formatTime(booking.StartTime)}</td>
                                <td className="border p-3">{formatTime(booking.EndTime)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
