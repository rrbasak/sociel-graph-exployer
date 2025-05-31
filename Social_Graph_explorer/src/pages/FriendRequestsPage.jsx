import React, { useState } from "react";
import FriendRequestsTab from "./FriendRequestsTab";
import UserProfileModal from "./UserProfileModal";

const FriendRequestsPage = ({ userId }) => {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchModalUser, setSearchModalUser] = useState(null);
  const [refreshRequestsCounter, setRefreshRequestsCounter] = useState(0);

  const handleViewProfile = (user) => {
    setSearchModalUser(user);
    setSearchModalVisible(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Pending Friend Requests</h2>

      <FriendRequestsTab
        userId={userId}
        onViewProfile={handleViewProfile}
        refreshTrigger={refreshRequestsCounter}
      />

      <UserProfileModal
        visible={searchModalVisible}
        user={searchModalUser}
        onClose={() => setSearchModalVisible(false)}
        onActionSuccess={() => setRefreshRequestsCounter((prev) => prev + 1)}
      />
    </div>
  );
};

export default FriendRequestsPage;
