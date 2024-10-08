import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/landingPage/NavBar";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Admin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("user");

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Effect to handle navigation after user login
  useEffect(() => {
    if (user) {
      if (activeTab === "root") {
        navigate("/rootDashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, activeTab, navigate]); // Dependencies to trigger effect

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading on form submission
    try {
      const res = await axios.post("/api/users/login", {
        username: username,
        password: password,
        email: activeTab === "root" ? email : undefined,
        facilityName: activeTab === "user" ? facilityName : undefined,
        role: activeTab === "root" ? "SuperUser" : role,
      });

      const { user, accessToken, refreshToken } = res.data.data;
      console.log('login',user, accessToken)
      // Call login to set user in context
      login(user, accessToken);
    } catch (error) {
      setError(
        "Invalid Username/Password" +
          (activeTab === "user" ? " or Facility Name" : "")
      );
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setActiveTab("user")}
              className={`px-4 py-2 ${
                activeTab === "user"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              User Login
            </button>
            <button
              onClick={() => setActiveTab("root")}
              className={`px-4 py-2 ml-4 ${
                activeTab === "root"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600"
              }`}
            >
              Root User Login
            </button>
          </div>

          {/* Conditional Form Rendering */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
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
              {activeTab === "root" && (
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
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
              {activeTab === "user" && (
                <>
                  <div>
                    <label htmlFor="facilityName" className="sr-only">
                      Facility Name
                    </label>
                    <input
                      id="facilityName"
                      name="facilityName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Facility Name"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="sr-only">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="FacAdmin">FacAdmin</option>
                      <option value="Employee">Employee</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>

          {error && (
            <p className="mt-2 text-center text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
