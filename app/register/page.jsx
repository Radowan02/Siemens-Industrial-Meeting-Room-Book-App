'use client';
import { useState } from 'react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    email: '',
    password: '',
    role: 'employee',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const { name, department, email, password, role } = formData;

    if (!name || !department || !email || !password || !role) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, department, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Employee registered successfully!');
        setFormData({
          name: '',
          department: '',
          email: '',
          password: '',
          role: 'employee',
        });
        window.scrollTo(0, 0);

      } else {
        setError(data.error || 'Something went wrong!');
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4 text-center text-blue-500">Create an Account</h1>

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
      {successMessage && <div className="text-green-500 mb-4 text-center">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-semibold">Department</label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-semibold">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 w-full rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 transition-all"
            disabled={loading}
          >
            {loading ? (
              <span className="flex justify-center items-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path d="M4 12a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                </svg>
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
