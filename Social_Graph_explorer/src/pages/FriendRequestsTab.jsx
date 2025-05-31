import React, { useEffect, useState } from "react";
import { Badge, Tabs, List, Button } from "antd";

import {
  getPendingRequestsCount,
  getPendingReceivedRequests,
} from "../api/auth"; 

const FriendRequestsTab = ({ userId, onViewProfile, refreshTrigger }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");

  const fetchPendingCount = async () => {
    try {
      const { pendingCount } = await getPendingRequestsCount(userId);
      setPendingCount(pendingCount);
    } catch (err) {
      console.error("Error fetching pending count", err);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const requests = await getPendingReceivedRequests(userId);
      setFriendRequests(requests);
    } catch (err) {
      console.error("Error fetching friend requests", err);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    fetchFriendRequests();
  }, [userId, refreshTrigger]);

  const items = [
    {
      key: "requests",
      label: (
        <Badge count={pendingCount} offset={[10, 0]}>
          Friend Request(s)
        </Badge>
      ),
      children: (
        <List
          bordered
          dataSource={friendRequests}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button type="link" onClick={() => onViewProfile(user)} key="view">
                  View Profile
                </Button>,
              ]}
            >
              <div>
                <strong>
                  {user.fname} {user.lname}
                </strong>{" "}
                (@{user.username})
              </div>
            </List.Item>
          )}
        />
      ),
    },
  
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      style={{ marginTop: 24 }}
      items={items}
    />
  );
};

export default FriendRequestsTab;
