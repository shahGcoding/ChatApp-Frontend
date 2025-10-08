import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import { login, logout } from "./store/authSlice.js";
import { getCurrentUser } from "./config/config.js";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (userData) {
          setLoading(false);
          return;
        }

        const userRes = await getCurrentUser();
        if (userRes) {
          dispatch(login(userRes));
        } else {
          dispatch(logout());
          navigate("/login");
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("User not logged in (cookie missing/expired).");
        } else {
          console.error("Error fetching current user:", error);
        }
        dispatch(logout());
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, userData]);

  return (
    <div className="h-screen flex items-center justify-center">
      {!loading ? (
        <div className="w-full bg-white shadow-lg rounded-2xl">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;
