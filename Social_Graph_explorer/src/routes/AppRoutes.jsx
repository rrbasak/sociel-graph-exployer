import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../components/Auth/Register";
import Login from "../components/Auth/Login";
import Home from "../pages/Home";
import FriendRequestsPage from "../pages/FriendRequestsPage";
import FriendSuggestionsPage from "../pages/FriendSuggestionsPage";
import PendingSentReqPage from "../pages/PendingSentReqPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import Navbar from "../pages/Navbar";

const AppRoutes = () => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const userId = user?.id;

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(JSON.parse(localStorage.getItem("user")));
    };


    window.addEventListener("storage", handleStorageChange);


    const interval = setInterval(() => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    }, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <Router>
      <ToastContainer />
      {userId && <Navbar userId={userId} />}
      <Routes>
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/friend-requests"
          element={
            <PrivateRoute>
              <FriendRequestsPage userId={userId} />
            </PrivateRoute>
          }
        />
        <Route
          path="/suggestions"
          element={
            <PrivateRoute>
              <FriendSuggestionsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/sent-requests"
          element={
            <PrivateRoute>
              <PendingSentReqPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
