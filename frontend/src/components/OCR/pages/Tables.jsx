import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { useTable } from "react-table";
import NavbarD from "../../dashboard/NavbarD";
import Sidebar from "../../dashboard/Sidebar";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const data = {
  labels: ["Filled Parameters", "Pending Parameters"],
  datasets: [
    {
      data: [45, 75],
      backgroundColor: ["#36A2EB", "#FF6384"],
      hoverBackgroundColor: ["#36A2EB", "#FF6384"],
    },
  ],
};

const columns = [
  {
    Header: "Status",
    accessor: "status",
  },
  {
    Header: "Document Name",
    accessor: "documentName",
  },
  {
    Header: "Date Added",
    accessor: "dateAdded",
  },
  {
    Header: "Added By",
    accessor: "addedBy",
  },
  {
    Header: "Amount Value",
    accessor: "amountValue",
  },
];

const billTypes = [
  "Bioenergy",
  "BusinessTravel",
  "Electricity_Heating",
  "EmployCommuting",
  "Flights & Accommodations",
  "Food",
  "FreightingGoods",
  "Fuels",
  "Home",
  "MaterialsUsed",
  "OwnedVehicles",
  "Refrigerants",
  "WTTFuel",
  "WasteDisposal",
  "Water",
];

const StatusToggle = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-2 border rounded"
  >
    <option value="Pending">Pending</option>
    <option value="Completed">Completed</option>
  </select>
);

function Tables({ setUploadedImage }) {
  const [tableData, setTableData] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuth();
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: tableData });
  const [showModal, setShowModal] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    axios
      .get("/api/bills/getBills", {
        params: {
          companyName: user.companyName,
          facilityName: user.facilityName,
          role: user.role,
          username: user?.username,
          userId: user?._id,
        },
      })
      .then((response) => {
        const { message, data } = response.data;
        console.log("Bills data:", data);
        if (message === "No bills found for the user.") {
          setMessage(message);
          setTableData([]); // Empty array if no bills found
        } else {
          const transformedData = data.map((bill) => ({
            status: "Pending",
            documentName: bill.billName || `Bill ${bill.billId}`,
            dateAdded: new Date(bill.createdAt).toLocaleDateString(),
            addedBy: bill.username,
            amountValue: "",
            type_off_bill: bill.type_off_bill, // Store the bill type for filtering
          }));
          setTableData(transformedData);
        }
      })
      .catch((error) => {
        console.error("Error fetching bills:", error);
        setMessage("Something went wrong while fetching bills.");
        setTableData([]);
      });
  }, [user]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };


  const handleCreateNewBill = () => {
    setShowModal(true);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    if (!selectedBillType) {
      alert("Please select a bill type");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const ocrResponse = await axios.post(
        "http://localhost:5000/ocr/uploadimage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (ocrResponse.status !== 200) {
        throw new Error("Image upload to OCR service failed");
      }

      const billFormData = new FormData();
      billFormData.append("user", JSON.stringify(user));
      billFormData.append("billType", selectedBillType);
      billFormData.append("facilityName", user.facilityName);
      billFormData.append("companyName", user.companyName);
      billFormData.append("username", user.username);
      billFormData.append("file", selectedFile);

      const createBillResponse = await axios.post(
        "http://localhost:8000/api/bills/createBills",
        billFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (createBillResponse.status === 201) {
        setUploadedImage(URL.createObjectURL(selectedFile));
        setShowModal(false);
        alert("Bill created successfully!");
        navigate("/ocr/output");
      } else {
        throw new Error("Bill creation failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create bill: " + error.message);
    }
  };

  const filteredData = selectedCategory
    ? tableData.filter((bill) => bill.type_off_bill === selectedCategory)
    : tableData;

  return (
    <>
      <div className="flex flex-col min-h-screen overflow-hidden">
        <NavbarD />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/6 sticky top-0 h-screen">
            <Sidebar />
          </div>
          <div className="flex-grow p-8 bg-gray-100 overflow-auto">
   

            {/* Category Slider */}
            <div className="flex overflow-x-auto mb-8 space-x-4">
              {billTypes.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg shadow transition duration-300 ${
                    selectedCategory === category
                      ? "bg-blue-700 text-white"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Buttons for Pending Parameters */}
            <div className="mb-8 flex space-x-4">
              <button className="px-4 py-2 bg-[#002952] text-white rounded-lg shadow hover:bg-[#003D7A] transition duration-300">
                Pending Parameters
              </button>
              <button className="px-4 py-2 bg-[#A6D3A0] text-white rounded-lg shadow hover:bg-[#8BB78D] transition duration-300">
                Manually Update
              </button>
              <button className="px-4 py-2 bg-[#DDDCBD] text-white rounded-lg shadow hover:bg-[#BEBE9F] transition duration-300">
                Automate Parameter
              </button>
              <button
                onClick={handleCreateNewBill}
                className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg shadow hover:bg-[#45a049] transition duration-300"
              >
                Create New Bill
              </button>
            </div>

            {message ? (
              <div className="flex justify-center items-center h-full">
                <h2 className="text-xl font-semibold text-gray-700">
                  {message}
                </h2>
              </div>
            ) : (
              <>
                {/* Document Table */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Document Table
                  </h2>
                  <table
                    {...getTableProps()}
                    className="min-w-full bg-white shadow-md rounded-lg overflow-hidden"
                  >
                    <thead>
                      {headerGroups.map((headerGroup) => (
                        <tr
                          {...headerGroup.getHeaderGroupProps()}
                          className="bg-gray-50"
                        >
                          {headerGroup.headers.map((column) => (
                            <th
                              {...column.getHeaderProps()}
                              className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600"
                            >
                              {column.render("Header")}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                      {filteredData.length > 0 ? (
                        rows.map((row) => {
                          prepareRow(row);
                          return (
                            <tr
                              {...row.getRowProps()}
                              className="bg-white hover:bg-gray-100 transition duration-300"
                            >
                              {row.cells.map((cell) => (
                                <td
                                  {...cell.getCellProps()}
                                  className="px-6 py-4 border-b border-gray-200 text-sm text-gray-700"
                                >
                                  {cell.render("Cell")}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="text-center py-4"
                          >
                            No bills found for the selected category.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Create New Bill</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Bill Type:</label>
                <select
                  value={selectedBillType}
                  onChange={(e) => setSelectedBillType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a bill type</option>
                  {billTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Upload Bill:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="mr-2 px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Tables;
