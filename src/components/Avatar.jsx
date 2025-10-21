import React from "react";

function Avatar({ src, size = 80, alt = "User Avatar" }) {
  const defaultAvatar = "/2289_SkVNQSBGQU1PIDEwMjgtMTIy.jpg"; // fallback if no avatar uploaded

  return (
    <div
      className="rounded-full overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-gray-100"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
      }}
    >
      <img 
        src={src || defaultAvatar}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Avatar;

