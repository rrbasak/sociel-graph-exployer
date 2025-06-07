/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Spin } from "antd";
import {
  getConnections,
  getFriendSuggestions,
  getUserById,
  sendConnectionRequest,
} from "../api/auth";
import UserProfileModal from "./UserProfileModal";
import { toast } from "react-toastify";

const FriendSuggestionsPage = () => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const data = await getFriendSuggestions(currentUser?.id);
      setSuggestions(data || []);
    } catch (err) {
      console.error("Error fetching suggestions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleAddConnection = async (selectedUser) => {
    try {
      // console.log("userId:", userId);
      // console.log("selectedUser?.userId:", selectedUser);

      const res = await sendConnectionRequest(userId, selectedUser?.userId);

      if (res?.success) {
        toast.success(res?.message || "Connection request sent!");
        fetchSuggestions();
        return true;
      }
    } catch (error) {
      toast.error("Failed to send connection request.");
    }
    return false;
  };
  return (
    <div style={{ padding: 24 }}>
      <h2>Friend Suggestions</h2>
      <Spin spinning={loading}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginTop: 24,
          }}
        >
          {suggestions.map((user) => (
            <Card
              key={user.username}
              hoverable
              style={{ width: 250 }}
              cover={
                <img
                  alt="cover"
                  src={user.coverPhoto}
                  style={{ height: 120, objectFit: "cover" }}
                />
              }
            >
              <div style={{ textAlign: "center" }}>
                <img
                  src={user.profilePicture}
                  alt="profile"
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    marginTop: -35,
                    border: "3px solid white",
                  }}
                />
                <h3 style={{ margin: "10px 0 0 0" }}>
                  {user.fname} {user.lname}
                </h3>
                <p style={{ color: "#999" }}>@{user.username}</p>
                <p style={{ fontSize: 12 }}>{user.bio}</p>
                <Button
                  type="link"
                  onClick={() => {
                    setSelectedUser(user);
                    setIsModalVisible(true);
                  }}
                >
                  View Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <UserProfileModal
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedUser(null);
          }}
          userData={selectedUser}
          currentUserInterests={currentUser?.interests || []}
          onAddConnection={() => handleAddConnection(selectedUser)}
          refreshConnections={() => {}}
        />
      </Spin>
    </div>
  );
};

export default FriendSuggestionsPage;
