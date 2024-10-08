import React, { useState } from "react";
import axios from "axios";
import NavbarD from "./NavbarD";
import Sidebar from "./Sidebar";

const CRMIntegration = () => {
  const [selectedCRM, setSelectedCRM] = useState(null);
  const [formData, setFormData] = useState({
    apiKey: "",
    companyId: "",
  });
  const [result, setResult] = useState(null);

  const crmOptions = [
    {
      name: "Salesforce",
      image:
        "https://dwglogo.com/wp-content/uploads/2017/03/Salesforce-logo-01.png",
      apiKeyPlaceholder: "Salesforce API Key",
      companyIdPlaceholder: "Salesforce Company ID",
    },
    {
      name: "HubSpot",
      image:
        "https://1000logos.net/wp-content/uploads/2022/12/HubSpot-Logo-768x432.png",
      apiKeyPlaceholder: "HubSpot API Key",
      companyIdPlaceholder: "HubSpot Company ID",
    },
    {
      name: "Zoho",
      image:
        "https://logowik.com/content/uploads/images/zoho-new9282.logowik.com.webp",
      apiKeyPlaceholder: "Zoho API Key",
      companyIdPlaceholder: "Zoho Company ID",
    },
  ];

  const handleCRMSelect = (crm) => {
    setSelectedCRM(crm.toLowerCase());
    setFormData({
      apiKey: "",
      companyId: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { apiKey, companyId } = formData;
    const crm = selectedCRM;

    try {
      let url;
      let headers = { Authorization: `Bearer ${apiKey}` };

      switch (crm) {
        case "salesforce":
          url = `https://your_salesforce_instance.com/api/company/${companyId}`;
          break;
        case "hubspot":
          url = `https://api.hubapi.com/companies/v2/companies/${companyId}`;
          break;
        case "zoho":
          url = `https://www.zohoapis.com/crm/v2/companies/${companyId}`;
          break;
        default:
          throw new Error("Invalid CRM platform selected");
      }

      const response = await axios.get(url, { headers });
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.message || "Error fetching data from CRM" });
    }
  };

  const selectedCRMOption = crmOptions.find(
    (crm) => crm.name.toLowerCase() === selectedCRM
  );

  return (
    <div className="flex flex-col min-h-screen w-full">
      <NavbarD />
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-1/6 flex-shrink-0 sticky top-0 h-screen">
          <Sidebar />
        </div>
        <div className="flex-grow container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            CRM Integration
          </h1>
          <div className="space-y-8">
            {crmOptions.map((crm) => (
              <div
                key={crm.name}
                className={`flex cursor-pointer bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 ${
                  selectedCRM === crm.name.toLowerCase()
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => handleCRMSelect(crm.name)}
              >
                <div className="h-40 w-80 relative ml-10">
                  <img
                    src={crm.image}
                    alt={crm.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-4 ">
                  <h1 className="text-xl font-semibold">{crm.name}</h1>
                  <h3 className="text-blue-400">Manage your {crm.name} data</h3>
                  {selectedCRM === crm.name.toLowerCase() && (
                    <div className="pt-8">
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex items-center space-x-4">
                          <input
                            type="text"
                            name="apiKey"
                            placeholder={selectedCRMOption.apiKeyPlaceholder}
                            value={formData.apiKey}
                            onChange={handleInputChange}
                            className="flex-grow p-2 border border-gray-300 rounded"
                          />
                          <input
                            type="text"
                            name="companyId"
                            placeholder={selectedCRMOption.companyIdPlaceholder}
                            value={formData.companyId}
                            onChange={handleInputChange}
                            className="flex-grow p-2 border border-gray-300 rounded"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors duration-300"
                        >
                          Fetch Data
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {result && (
            <div className="mt-8 bg-white p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-2">Result:</h3>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMIntegration;
