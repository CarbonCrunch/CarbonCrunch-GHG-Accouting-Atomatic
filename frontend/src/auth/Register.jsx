import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/landingPage/Header";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/dashboard/Sidebar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // In the Register component
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    axios.defaults.baseURL = "http://127.0.0.1:8000";
    // axios.defaults.baseURL = "https://ghg.carboncrunch.in";
    axios.defaults.withCredentials = true;
    try {
      const res = await axios.post("/api/users/register", {
        username,
        password,
        companyName,
        facilityName,
        role,
      });

      const { user, accessToken } = res.data.data;
      localStorage.setItem("accessToken", accessToken); // Store accessToken in localStorage
      // console.log("User from accessToken:", accessToken);
      login(user, accessToken);
      toast.success("Registration successful!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response?.status === 409) {
        setError("Username already exists");
      } else {
        setError(error.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex">
        {" "}
        {/* Main container */}
        <div className="w-1/6 sticky top-0 h-screen">
          {" "}
          {/* Sidebar */}
          <Sidebar />
        </div>
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">

          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-0 text-center text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleRegister}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div>
                  <input
                    id="facilityName"
                    name="facilityName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Facility Name"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  />
                </div>
                <div>
                  <select
                    id="role"
                    name="role"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select your role</option>
                    <option value="Admin">Admin</option>
                    <option value="FacAdmin">Facility Admin</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Register
                </button>
              </div>
            </form>

            {error && (
              <p className="mt-2 text-center text-sm text-red-600">{error}</p>
            )}

            {/* <div className="text-sm text-center">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Already have an account? Sign in
            </Link>
          </div> */}
          </div>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
