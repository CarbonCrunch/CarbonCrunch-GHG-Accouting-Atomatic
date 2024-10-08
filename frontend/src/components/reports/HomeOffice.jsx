import React, { useState, useEffect } from "react";
import { FaPlus, FaSave, FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext";

const HomeOffice = ({ report }) => {
  const [homeOfficeData, setHomeOfficeData] = useState([]);
  const [newHomeOffice, setNewHomeOffice] = useState({
    date: null,
    type: "",
    numberOfEmployees: "",
    workingRegime: "",
    workingFromHome: "",
    numberOfMonths: "",
  });
  const [editIndex, setEditIndex] = useState(-1);
  const [isYearPicker, setIsYearPicker] = useState(false);
  const [isMonthPicker, setIsMonthPicker] = useState(false);
  const { user } = useAuth();

  const permissions = user?.facilities?.[0]?.userRoles?.find(
    (role) => role.username === user.username
  )?.permissions;

  const homeOfficePermissions = permissions?.find(
    (perm) => perm.entity.toLowerCase() === "homeoffice"
  );

  const hasReadPermission = homeOfficePermissions?.actions?.includes("read");
  const hasCreatePermission =
    homeOfficePermissions?.actions?.includes("create");
  const hasUpdatePermission =
    homeOfficePermissions?.actions?.includes("update");
  const hasDeletePermission =
    homeOfficePermissions?.actions?.includes("delete");

  // If no read permission, display a message
  if (!hasReadPermission) {
    return <p>You do not have permission to view this data.</p>;
  }

  const TypeOptions = ["With Heating", "With Cooling", "No Heating/No Cooling"];

  const reportData = report;
  const {
    companyName = "",
    facilityName = "",
    reportId = "",
    timePeriod = {},
    homeOffice = [],
  } = reportData || {};

  useEffect(() => {
    if (homeOffice && Array.isArray(homeOffice)) {
      setHomeOfficeData(
        homeOffice.map((item) => ({
          ...item,
          date: new Date(item.date),
        }))
      );
    }
  }, [report]);

  const getDateRange = () => {
    if (!timePeriod || typeof timePeriod !== "object") {
      return { start: new Date(), end: new Date() };
    }

    const { start, end } = timePeriod;
    return { start: new Date(start), end: new Date(end) };
  };

  const { start, end } = getDateRange();

  const handleAddHomeOffice = () => {
    if (
      newHomeOffice.date &&
      newHomeOffice.type &&
      newHomeOffice.numberOfEmployees &&
      newHomeOffice.workingRegime &&
      newHomeOffice.workingFromHome &&
      newHomeOffice.numberOfMonths
    ) {
      if (editIndex === -1) {
        setHomeOfficeData([...homeOfficeData, newHomeOffice]);
      } else {
        const updatedHomeOfficeData = [...homeOfficeData];
        updatedHomeOfficeData[editIndex] = newHomeOffice;
        setHomeOfficeData(updatedHomeOfficeData);
        setEditIndex(-1);
      }
      setNewHomeOffice({
        date: null,
        type: "",
        numberOfEmployees: "",
        workingRegime: "",
        workingFromHome: "",
        numberOfMonths: "",
      });
    } else {
      toast.error("Please fill all fields");
    }
  };

  const handleEdit = (index) => {
    setNewHomeOffice(homeOfficeData[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedHomeOfficeData = homeOfficeData.filter((_, i) => i !== index);
    setHomeOfficeData(updatedHomeOfficeData);
    toast.info("Now click on save to permanently delete", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleSave = async () => {
    try {
      // console.log("homeOfficeData", homeOfficeData);
      const response = await axios.patch(
        `/api/reports/:reportId/home-office/put`,
        { homeOffice: homeOfficeData },
        {
          params: {
            reportId,
            companyName,
            facilityName,
          },
          headers: {
            Authorization: `Bearer ${user.accessToken}`, // Include accessToken in headers
          },
          withCredentials: true, // Ensure cookies are sent
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error("Failed to update home office data");
      }
    } catch (error) {
      console.error("Error saving home office data:", error);
      toast.error(
        error.response?.data?.message || "Failed to save home office data"
      );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Date</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-left">No. of Employees</th>
            <th className="py-3 px-6 text-left">
              Working Regime (%) eg 100% for full time{" "}
            </th>
            <th className="py-3 px-6 text-left">
              % Working from Home eg 50% for remote{" "}
            </th>
            <th className="py-3 px-6 text-left">Number of Months</th>
            <th className="py-3 px-6 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {homeOfficeData.map((item, index) => (
            <tr
              key={index}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left">
                {item.date.toLocaleDateString()}
              </td>
              <td className="py-3 px-6 text-left">{item.type}</td>
              <td className="py-3 px-6 text-left">{item.numberOfEmployees}</td>
              <td className="py-3 px-6 text-left">{item.workingRegime}</td>
              <td className="py-3 px-6 text-left">{item.workingFromHome}</td>
              <td className="py-3 px-6 text-left">{item.numberOfMonths}</td>
              <td className="py-3 px-6 text-left">
                <button
                  onClick={() => handleEdit(index)}
                  className={`text-blue-500 hover:text-blue-700 mr-2 ${
                    !hasUpdatePermission ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasUpdatePermission}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className={`text-red-500 hover:text-red-700 ${
                    !hasDeletePermission ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!hasDeletePermission}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-3 px-6">
              <DatePicker
                selected={newHomeOffice.date}
                onChange={(date) =>
                  setNewHomeOffice({ ...newHomeOffice, date })
                }
                minDate={start}
                maxDate={end}
                placeholderText="Select Date"
                className="border p-1 w-full"
                showPopperArrow={false}
                renderCustomHeader={({
                  date,
                  changeYear,
                  changeMonth,
                  decreaseMonth,
                  increaseMonth,
                  prevMonthButtonDisabled,
                  nextMonthButtonDisabled,
                }) => (
                  <div
                    className="react-datepicker__header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <button
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--previous"
                    >
                      {"<"}
                    </button>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div
                        className="react-datepicker__current-month"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsMonthPicker(true); // Show month picker when month is clicked
                          setIsYearPicker(false); // Hide year picker
                        }}
                      >
                        {date.toLocaleString("default", { month: "long" })}
                      </div>
                      <div
                        className="react-datepicker__current-year"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsYearPicker(true); // Show year picker when year is clicked
                          setIsMonthPicker(false); // Hide month picker
                        }}
                      >
                        {date.getFullYear()}
                      </div>
                    </div>
                    <button
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="react-datepicker__navigation react-datepicker__navigation--next"
                    >
                      {">"}
                    </button>
                  </div>
                )}
                showYearPicker={isYearPicker} // Show only year picker if isYearPicker is true
                showMonthYearPicker={isMonthPicker} // Show month picker if isMonthPicker is true
                onSelect={(date) => {
                  setNewHomeOffice({ ...newHomeOffice, date });
                  if (isYearPicker) {
                    setIsYearPicker(false); // Switch to date picker after selecting a year
                    setIsMonthPicker(true); // Show month picker after selecting a year
                  } else if (isMonthPicker) {
                    setIsMonthPicker(false); // Switch to date picker after selecting a month
                  }
                }}
              />
            </td>
            <td className="py-3 px-6">
              <select
                value={newHomeOffice.type}
                onChange={(e) =>
                  setNewHomeOffice({ ...newHomeOffice, type: e.target.value })
                }
                className="border p-1 w-full"
              >
                <option value="">Select Type</option>
                {TypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </td>
            <td className="py-3 px-6">
              <input
                type="number"
                value={newHomeOffice.numberOfEmployees}
                onChange={(e) =>
                  setNewHomeOffice({
                    ...newHomeOffice,
                    numberOfEmployees: e.target.value,
                  })
                }
                placeholder="No. of Employees"
                className="border p-1 w-full"
              />
            </td>
            <td className="py-3 px-6">
              <input
                type="number"
                value={newHomeOffice.workingRegime}
                onChange={(e) =>
                  setNewHomeOffice({
                    ...newHomeOffice,
                    workingRegime: e.target.value,
                  })
                }
                placeholder="Working Regime (%)"
                className="border p-1 w-full"
              />
            </td>
            <td className="py-3 px-6">
              <input
                type="number"
                value={newHomeOffice.workingFromHome}
                onChange={(e) =>
                  setNewHomeOffice({
                    ...newHomeOffice,
                    workingFromHome: e.target.value,
                  })
                }
                placeholder="Working from Home (%)"
                className="border p-1 w-full"
              />
            </td>
            <td className="py-3 px-6">
              <input
                type="number"
                value={newHomeOffice.numberOfMonths}
                onChange={(e) =>
                  setNewHomeOffice({
                    ...newHomeOffice,
                    numberOfMonths: e.target.value,
                  })
                }
                placeholder="Number of Months"
                className="border p-1 w-full"
              />
            </td>
            <td className="py-3 px-6">
              <button
                onClick={handleAddHomeOffice}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                  !hasCreatePermission ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!hasCreatePermission}
              >
                {editIndex === -1 ? <FaPlus /> : <FaEdit />}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={handleSave}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center ${
            !hasCreatePermission && !hasUpdatePermission
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={!hasCreatePermission && !hasUpdatePermission}
        >
          <FaSave className="mr-2" /> Save
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default HomeOffice;
