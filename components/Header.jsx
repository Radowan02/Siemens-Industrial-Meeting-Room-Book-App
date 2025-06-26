"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaUser, FaUsers, FaSignOutAlt, FaCalendarCheck, FaCalendarAlt, FaTag, FaPlus, FaRegClipboard, FaBars } from "react-icons/fa";
import logo from "@/assets/image/logo.svg";
import { useAuth } from "@/context/AuthContext";

function Header() {
    const { currentUser, logout } = useAuth();
    const router = useRouter();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen((prev) => !prev);
    };

    return (
        <header className="bg-gray-100">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href={currentUser ? "/dashboard" : "/"} passHref>
                            <Image className="h-16 w-16 cursor-pointer" src={logo} alt="Book App" priority={true} />
                        </Link>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {currentUser && (
                                    <>
                                        <Link href="/bookRoom" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                            <FaCalendarAlt className="inline mr-1" /> Book Room
                                        </Link>
                                        <Link href="/bookings/my" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                            <FaTag className="inline mr-1" /> My Booking
                                        </Link>
                                        {currentUser.role === "admin" && (
                                            <>
                                                <Link href="/bookings/all" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                                    <FaCalendarCheck className="inline mr-1" /> All Booking
                                                </Link>
                                                <Link href="/allEmployees" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                                    <FaUsers className="inline mr-1" /> All Employee
                                                </Link>
                                                <Link href="/addRoom" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                                    <FaPlus className="inline mr-1" /> Add Room
                                                </Link>
                                                <Link href="/register" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                                    <FaUser className="inline mr-1" /> Register
                                                </Link>
                                                <Link href="/bookings/report" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                                    <FaRegClipboard className="inline mr-1" /> Report
                                                </Link>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="md:hidden flex items-center">
                            <button onClick={toggleMobileMenu} className="text-gray-800 hover:text-cyan-600">
                                <FaBars className="text-2xl" />
                            </button>
                        </div>
                    </div>

                    <div className="ml-auto">
                        <div className="ml-4 flex items-center md:ml-6">
                            {currentUser ? (
                                <button onClick={handleLogout} className="mr-3 text-gray-800 hover:text-cyan-600">
                                    <FaSignOutAlt className="inline mr-1" /> Sign Out
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
                {isMobileMenuOpen && currentUser && (
                    <div className="md:hidden">
                        <div className="space-y-2">
                            <Link href="/bookRoom" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                <FaCalendarAlt className="inline mr-1" /> Book Room
                            </Link>
                            <Link href="/bookings/my" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                <FaTag className="inline mr-1" /> My Booking
                            </Link>
                            {currentUser.role === "admin" && (
                                <>
                                    <Link href="/bookings/all" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                        <FaCalendarCheck className="inline mr-1" /> All Booking
                                    </Link>
                                    <Link href="/allEmployees" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                        <FaUsers className="inline mr-1" /> All Employee
                                    </Link>
                                    <Link href="/addRoom" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                        <FaPlus className="inline mr-1" /> Add Room
                                    </Link>
                                    <Link href="/register" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                        <FaUser className="inline mr-1" /> Register
                                    </Link>
                                    <Link href="/bookings/report" className="block px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                                        <FaRegClipboard className="inline mr-1" /> Report
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Header;

