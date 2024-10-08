import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Fields from "./Fields";
import Canvas from "../Canvas";
import NavbarD from "../../dashboard/NavbarD";
import Sidebar from "../../dashboard/Sidebar";
import { useAuth } from "../../../context/AuthContext";

function ImageViewer({ uploadedImage }) {
  const [formData, setFormData] = useState({});
  const [activeField, setActiveField] = useState(null);
  const [containerRef, setContainerRef] = useState(null);
  const { user } = useAuth();

  const handleInputFocus = (field) => {
    setActiveField(field);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

    const handleSubmit = async () => {
      
    };


  useEffect(() => {
    if (containerRef) {
      const containerWidth = containerRef.offsetWidth;
      const screenWidth = window.innerWidth;
      if (containerWidth > screenWidth) {
        containerRef.style.overflow = "hidden";
      }
    }
  }, [containerRef]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        <NavbarD />
        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="w-1/6 flex-shrink-0 sticky top-0 h-screen">
            <Sidebar />
          </div>
          <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1">
                <div className="md:w-1/2 pr-4">
                  <Link
                    to="/ocr/tables"
                    className="mb-4 inline-block bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    Upload Another Image
                  </Link>
                  {/* See Tables Button */}
                  <Link
                    to="/ocr/tables"
                    className="ml-1 mb-4 inline-block bg-[#002952] text-white px-4 py-2 rounded hover:bg-[#003D7A] transition duration-300"
                  >
                    See Tables
                  </Link>
                </div>
                <div className="overflow-auto max-w-full max-h-[600px] border border-gray-300 rounded">
                  <div className="min-w-[800px] min-h-[600px]">
                    <Canvas
                      uploadedImage={uploadedImage}
                      activeField={activeField}
                      setFormData={setFormData}
                    />
                  </div>
                </div>
              </div>
              <div ref={setContainerRef} className="flex-1 overflow-auto">
                <Fields
                  formData={formData}
                  handleInputFocus={handleInputFocus}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageViewer;

