import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactDom from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {Home} from "./pages/Home.jsx";
import Signup from "./pages/Singup.jsx";
import Login from "./pages/Login.jsx";
import Chat from "./pages/Chat.jsx";
//import { ChatWrapper } from "./pages/ChatWrapper.jsx";
import {VerifyEmail} from "./pages/VerifyEmail.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import "./index.css";
import App from "./App.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
        children: [{ path: "/chat/:contactId", element: <Chat /> }],
      },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup />},
      { path: "/verify-email", element: <VerifyEmail /> },

    ],
  },
]);

ReactDom.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
