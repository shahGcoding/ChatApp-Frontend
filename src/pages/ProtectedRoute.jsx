import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);

  // Check login status from Redux store
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    // If not logged in, redirect to login
    if (!authStatus) {
      navigate("/login");
    }
    // Once checked, stop loading
    setLoader(false);
  }, [authStatus, navigate]);

  // While checking, show loading state
  if (loader) {
    return <h1 className="text-center mt-10 text-xl font-semibold">Loading...</h1>;
  }

  // If logged in, render protected content
  return <>{children}</>;
}
