import React from "react";

const Preloader = () => {
  return (
    <div className=" bg-cover bg-center bgLoader h-screen w-screen">
      <div className=" flex justify-center items-center top-0 left-0 fixed z-50 bg-[#4b8fe332] h-screen w-screen backdrop-blur-[20px]">
        {" "}
        <div class="loader-5 center">
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
