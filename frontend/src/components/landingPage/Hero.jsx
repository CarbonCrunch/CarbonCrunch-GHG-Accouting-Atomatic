import React from "react";
import carbon from "./assets/carbon.mp4";

const Hero = () => {
  return (
    <div className="video-background-container relative w-full h-screen overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="video-background absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src={carbon} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div
        style={{ marginTop: 30 }}
        className=" relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4"
      >
        <p style={{ fontSize: 30 }}>
          Streamline your Sustainability Reporting with
        </p>
        <h1 style={{ fontSize: 120, fontWeight: 700 }}>Carbon Crunch</h1>
        <button className="bg-white text-[#1f0f4b] font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition duration-200 ease-in-out mt-7">
          Act Now
        </button>
      </div>
    </div>
  );
};

export default Hero;