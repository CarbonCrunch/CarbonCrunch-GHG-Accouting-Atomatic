import React, { useState } from "react";
import NavBar from "../NavBar";
import carbonele from '../assets/carbonele.png';

const RequestDemo = () => {
  const [formData, setFormData] = useState({
    email: "",
    interestedIn: "",
    employees: "",
    mobile: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add form submission logic here
    console.log(formData);
  };

  return (
    
    <section className="min-h-screen bg-gradient-to-b from-[#10240b] to-[#000000] flex justify-center items-center py-10">
      <NavBar/>
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-8 mt-12">
        {/* Left Section */}
        <div className="text-white max-w-lg text-center">
          <h1 className="text-4xl font-bold mb-4">
            Learn how Carbon Crunch helps sustainability teams
          </h1>
          <p className="text-lg mb-2">
            The only tool sustainability teams need to measure, track, and
            improve ESG metrics, ensuring global compliance within budget.
          </p>
          <img src={carbonele} alt="Carbonele" className="w-96 ml-16" />
        </div>

        {/* Right Section (Form) */}
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Book a demo</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Work Email*
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Interested In*
              </label>
              <select
                name="interestedIn"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={formData.interestedIn}
                onChange={handleChange}
                required
              >
                <option value="">--Select--</option>
                <option value="GHG Accounting">GHG Accounting</option>
                <option value="BRSR Reporting">BRSR Reporting</option>
                <option value="ESG Management">ESG Management</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Number of employees*
              </label>
              <select
                name="employees"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={formData.employees}
                onChange={handleChange}
                required
              >
                <option value="">--Select--</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Mobile number*
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="+91 0000000000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Message*
              </label>
              <textarea
                name="message"
                placeholder="Leave us a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Book a demo
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RequestDemo;