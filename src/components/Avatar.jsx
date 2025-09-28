import React from "react";

function Avatar({width = "100px"}) {
  return (
    <img
      src="/2289_SkVNQSBGQU1PIDEwMjgtMTIy.jpg"
      alt="avatar"
      className="w-32 h-32 rounded-full"
      style={{ width, height: "auto", display: "block" }}
    />
  );
}

export default Avatar;
