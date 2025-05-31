/* eslint-disable no-unused-vars */
import { Menu, Badge, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPendingRequestsCount } from "../api/auth";

const Navbar = ({ userId }) => {
  const navigate = useNavigate();
  const location = useLocation();


  const items = [
    {
      label: "Home",
      key: "/",
      onClick: () => navigate("/"),
    },

    {
      label: "Suggestions",
      key: "/suggestions",
      onClick: () => navigate("/suggestions"),
    },
    {
      label: "Sent Requests",
      key: "/sent-requests",
      onClick: () => navigate("/sent-requests"),
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px" }}>
      <Menu mode="horizontal" selectedKeys={[location.pathname]} items={items} style={{ flex: 1 }} />
      <Button
        type="primary"
        icon={<LogoutOutlined />}
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      >
        Sign Out
      </Button>
    </div>
  );
};

export default Navbar;
