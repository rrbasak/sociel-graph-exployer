import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Tag,
  Button,
  Dropdown,
  message,
  Spin,
  Popconfirm,
} from "antd";
import { DownOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import {
  getConnectionStatus,
  removeConnection,
  blockConnection,
  unblockConnection,
  acceptFriendReq,
  rejectFriendReq,
} from "../api/auth";
import { toast } from "react-toastify";

const { Title, Paragraph } = Typography;
// const { confirm } = Modal;

const UserProfileModal = ({
  visible,
  onClose,
  userData,
  currentUserInterests = [],
  onAddConnection,
  refreshConnections,
  triggerFriendRequestRefresh,
}) => {
  const [status, setStatus] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchStatus = async () => {

    // if (!currentUser?.id || (!userData?.userId || !userData?.requesterId)) return;
    console.log("Fetching connection status for user:", userData);
    try {
      setLoadingStatus(true);
      if(currentUser?.id === userData?.requesterId){
        const res = await getConnectionStatus(
          currentUser?.id,
          userData.userId || userData?.receiverId
        );
        setStatus(res);
      }
      else{
        const res = await getConnectionStatus(
          currentUser?.id,
          userData.userId || userData?.requesterId
        );
        setStatus(res);
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    console.log("visible", visible);
    console.log("userData", userData);
    // console.log("userData?.userId", userData?.userId);
    // console.log("userData?.requesterId", userData?.requesterId);
    if (visible && (userData?.userId || userData?.requesterId)) {
      fetchStatus();
    }
  }, [visible, userData]);

 

  const ConfirmAction = ({ title, onConfirm, children }) => (
    <Popconfirm
      title={title}
      onConfirm={onConfirm}
      okText="Yes"
      cancelText="No"
      placement="topRight"
    >
      <span style={{ cursor: "pointer" }}>{children}</span>
    </Popconfirm>
  );

  const renderConnectionControl = () => {
    if (!userData || currentUser?.id === userData?.userId) return null;
    if (loadingStatus) return <Spin size="small" />;

    const payload = {
      requesterId: currentUser?.id,
      receiverId: userData.userId,
    };
    // console.log("userData?.connectionId", userData?.connectionId);
    // console.log("currentUser?.id", currentUser?.id);
    // console.log("userData?.requesterId", userData?.requesterId);
    switch (status) {
      case "PENDING":
        if (
          (userData?.connectionId != null &&
            userData?.connectionId != undefined &&
            currentUser?.id !== userData?.requesterId) 
        ) {
          return (
            <Dropdown
              placement="top"
              menu={{
                items: [
                  {
                    key: "accept",
                    label: (
                      <ConfirmAction
                        title="Are you sure you want to accept?"
                        onConfirm={async () => {
                          setLoadingAction(true);
                          try {
                            const res = await acceptFriendReq({
                              requesterId: userData?.requesterId || userData?.userId,
                              receiverId: userData.receiverId || currentUser?.id,
                            });
                            toast.success(
                              res?.message || "Accepted friend request"
                            );
                            fetchStatus();
                            refreshConnections();
                            triggerFriendRequestRefresh();
                            onClose();
                          } catch (err) {
                            toast.error(err.message);
                          } finally {
                            setLoadingAction(false);
                          }
                        }}
                      >
                        Accept
                      </ConfirmAction>
                    ),
                  },
                  {
                    key: "cancel",
                    label: (
                      <ConfirmAction
                        title="Are you sure you want to reject?"
                        onConfirm={async () => {
                          setLoadingAction(true);
                          try {
                            const res = await rejectFriendReq(payload);
                            toast.success(
                              res?.message || "Rejected friend request"
                            );
                            fetchStatus();
                            refreshConnections();
                            onClose();
                          } catch (err) {
                            toast.error(err.message);
                          } finally {
                            setLoadingAction(false);
                          }
                        }}
                      >
                        Reject
                      </ConfirmAction>
                    ),
                  },
                ],
              }}
            >
              <Button>
                Friend Request <DownOutlined />
              </Button>
            </Dropdown>
          );
        } else {
          return <Button disabled>Requested</Button>;
        }

      case "ACCEPTED":
        return (
          <Dropdown
            placement="top"
            menu={{
              items: [
                {
                  key: "unfriend",
                  label: (
                    <ConfirmAction
                      title="Are you sure you want to unfriend?"
                      onConfirm={async () => {
                        setLoadingAction(true);
                        try {
                          const res = await removeConnection(payload);
                          toast.success(res || "Unfriended successfully");
                          fetchStatus();
                          refreshConnections();
                          onClose();
                        } catch (err) {
                          toast.error(err.message);
                        } finally {
                          setLoadingAction(false);
                        }
                      }}
                    >
                      Unfriend
                    </ConfirmAction>
                  ),
                },
                {
                  key: "block",
                  label: (
                    <ConfirmAction
                      title="Are you sure you want to block this user?"
                      onConfirm={async () => {
                        setLoadingAction(true);
                        try {
                          const res = await blockConnection(payload);
                          toast.success(res || "User blocked");
                          fetchStatus();
                          refreshConnections();
                          onClose();
                        } catch (err) {
                          toast.error(err.message);
                        } finally {
                          setLoadingAction(false);
                        }
                      }}
                    >
                      Block
                    </ConfirmAction>
                  ),
                },
              ],
            }}
          >
            <Button>
              Friend <DownOutlined />
            </Button>
          </Dropdown>
        );

      case "BLOCKED":
        return (
          <Dropdown
            placement="top"
            menu={{
              items: [
                {
                  key: "blocked",
                  label: <span style={{ color: "gray" }}>Blocked</span>,
                  disabled: true,
                },
                {
                  key: "unblock",
                  label: (
                    <ConfirmAction
                      title="Are you sure you want to unblock this user?"
                      onConfirm={async () => {
                        setLoadingAction(true);
                        try {
                          const res = await unblockConnection(payload);
                          toast.success(res || "User unblocked");
                          fetchStatus();
                          refreshConnections();
                        } catch (err) {
                          toast.error(err.message);
                        } finally {
                          setLoadingAction(false);
                        }
                      }}
                    >
                      Unblock
                    </ConfirmAction>
                  ),
                },
              ],
            }}
          >
            <Button danger>
              Blocked <DownOutlined />
            </Button>
          </Dropdown>
        );

      default:
        return (
          <Button
            type="primary"
            loading={loadingAction}
            onClick={async () => {
              setLoadingAction(true);
              const success = await onAddConnection();
              if (success) fetchStatus();
              setLoadingAction(false);
            }}
          >
            Add Connection
          </Button>
        );
    }
  };

  return (
    <Modal
      title="User Profile"
      open={visible}
      onCancel={onClose}
      footer={renderConnectionControl()}
    >
      {userData ? (
        <>
          {/* <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img
              src={userData.profilePicture}
              alt="Profile"
              style={{ width: 100, height: 100, borderRadius: "50%" }}
            />
            <Title level={4} style={{ marginTop: 10 }}>
              {userData.fname} {userData.lname}
            </Title>
            <Paragraph type="secondary">@{userData.username}</Paragraph>
          </div> */}
          <div style={{ marginBottom: 16 }}>
            {/* Cover Picture */}
            <div
              style={{
                width: "100%",
                height: 180,
                backgroundImage: `url(${
                  userData.coverPhoto || "https://via.placeholder.com/600x200"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                position: "relative",
              }}
            >
              {/* Profile Picture - overlapping */}
              <img
                src={userData.profilePicture}
                alt="Profile"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  border: "4px solid white",
                  position: "absolute",
                  bottom: -50,
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#fff",
                }}
              />
            </div>

            <div style={{ textAlign: "center", marginTop: 60 }}>
              <Title level={4}>
                {userData.fname} {userData.lname}
              </Title>
              <Paragraph type="secondary">{userData.username}</Paragraph>
            </div>
          </div>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Bio">
              {userData.bio || "Just a chill guy"}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {userData.gender || "Male"}
            </Descriptions.Item>
            {/* <Descriptions.Item label="Date of Birth">
              {userData.dateOfBirth
                ? new Date(userData.dateOfBirth).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {userData.location || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Joined On">
              {userData.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item> */}
            <Descriptions.Item label="Date of Birth">
              <span
                style={{
                  filter:
                    status !== "ACCEPTED" && status !== "OWN"
                      ? "blur(4px)"
                      : "none",
                }}
              >
                {userData.dateOfBirth
                  ? new Date(userData.dateOfBirth).toLocaleDateString()
                  : "16/12/2000"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Location">
              <span
                style={{
                  filter:
                    status !== "ACCEPTED" && status !== "OWN"
                      ? "blur(4px)"
                      : "none",
                }}
              >
                {userData.location || "Kolkata, India"}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Joined On">
              <span
                style={{
                  filter:
                    status !== "ACCEPTED" && status !== "OWN"
                      ? "blur(4px)"
                      : "none",
                }}
              >
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : "16/12/2000"}
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Title level={5} style={{ marginTop: 20 }}>
            Interest(s)
          </Title>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(userData.interests || []).map((interest) => {
              const isCommon = currentUserInterests.includes(interest);
              return (
                <Tag
                  key={interest}
                  bordered={false}
                  style={{
                    margin: 6,
                    padding: "6px 12px",
                    borderRadius: 20,
                    backgroundColor: isCommon ? "#52c41a" : "#1d9bf0",
                    color: "#fff",
                    fontWeight: "bold",
                    cursor: "default",
                    userSelect: "none",
                  }}
                >
                  {interest}
                </Tag>
              );
            })}
          </div>
        </>
      ) : (
        <Paragraph>Loading...</Paragraph>
      )}
    </Modal>
  );
};

export default UserProfileModal;
