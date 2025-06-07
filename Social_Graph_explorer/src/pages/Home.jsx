/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUserById,
  getConnections,
  searchUsers,
  sendConnectionRequest,
  getConnectedSearchedUserById,
} from "../api/auth";
import {
  List,
  Button,
  Input,
  Typography,
  Layout,
  Card,
  Row,
  Col,
  Modal,
  Descriptions,
  Tag,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import ForceGraph2D from "react-force-graph-2d";
import { toast } from "react-toastify";
import UserProfileModal from "./UserProfileModal";
import FriendRequestsTab from "./FriendRequestsTab";

const { Title, Paragraph } = Typography;
const { Content } = Layout;
const { Search } = Input;

const Home = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [links, setLinks] = useState([]);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const graphRef = useRef();

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const [excludeIds, setExcludeIds] = useState([userId]);

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchModalUser, setSearchModalUser] = useState(null);
  const currentUserInterests = user?.interests || [];

  const isFirstTimeUser = connections.length < 1;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.length >= 1) {
        fetchResults();
      } else {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchResults = async () => {
    const users = await searchUsers(query, excludeIds);
    setResults(users);
  };

  const fetchConnections = async () => {
    try {
      const data = await getConnections(userId);
      const connectedUsers = data.connections;
      // console.log("connectionIds Users:", connectedUsers);

      const nodes = connectedUsers.map((u) => ({
        id: u.userId,
        name: u.fname + " " + u.lname,
        profilePicture: u.profilePicture,
      }));
      const edges = connectedUsers
        .filter((u) => u.userId !== userId)
        .map((u) => ({
          source: userId,
          target: u.userId,
        }));
      // console.log("Nodes:", nodes);
      // console.log("Edges:", edges);
      setConnections(nodes);
      setLinks(edges);
    } catch (err) {
      // console.error("Failed to fetch connections", err);
    }
  };
  useEffect(() => {
    fetchConnections();
  }, [userId]);

  const imageCache = useRef({});

  useEffect(() => {
    connections.forEach((node) => {
      if (node.profilePicture && !imageCache.current[node.id]) {
        const img = new Image();
        img.src = node.profilePicture;
        img.onload = () => {
          imageCache.current[node.id] = img;
        };
      }
    });
  }, [connections]);
  const handleSearchUserClick = async (user) => {
    try {
      const fullData = await getConnectedSearchedUserById(userId,user.userId);
      setSearchModalUser(fullData);
      setSearchModalVisible(true);
    } catch (err) {
      toast.error("Failed to load user data");
    }
  };
  
  const handleAddConnection = async (user) => {
    try {
      // console.log("results:", results);
      // console.log("user:", user);
      const receiver = results.find((r) => r.username === user?.username);
      if (!receiver) {
        toast.error("User not found");
        return false;
      }

      const res = await sendConnectionRequest(userId, receiver.userId);

      // if (!connections.find((node) => node.id === receiver.userId)) {
      //   setConnections((prev) => [
      //     ...prev,
      //     { id: receiver.userId, name: receiver.username },
      //   ]);
      //   setLinks((prev) => [
      //     ...prev,
      //     { source: userId, target: receiver.userId },
      //   ]);
      // }

      if (res?.success) {
        toast.success(res?.message || "Connection request sent!");
        return true;
      }
      // setResults([]);
      // setQuery("");
    } catch (error) {
      toast.error("Failed to send connection request.");
    }
    return false;
  };
  

  const handleNodeClick = async (node) => {
    try {
      const userData = await getUserById(node.id);
      setSelectedUserData(userData);
      setIsModalVisible(true);
    } catch (err) {
      // console.error("Error fetching user data", err);
    }
  };

  const graphData = { nodes: connections, links };

  const [refreshRequestsCounter, setRefreshRequestsCounter] = useState(0);

  const triggerFriendRequestRefresh = () => {
    setRefreshRequestsCounter((prev) => prev + 1);
  };

  return (
    <Layout
      style={{ minHeight: "100vh", padding: "2rem", background: "#f0f2f5" }}
    >
      <Content>
        {/* <Row justify="end" style={{ marginBottom: "1rem" }}>
          <Col>
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
          </Col>
        </Row> */}
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18}>
            <Card>
              <FriendRequestsTab
                userId={userId}
                onViewProfile={(user) => {
                  setSearchModalUser(user);
                  setSearchModalVisible(true);
                }}
                refreshTrigger={refreshRequestsCounter}
              />
            </Card>
          </Col>
        </Row>
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={18}>
            <Card>
              <Title level={2}>
                {isFirstTimeUser
                  ? "Welcome to Social Graph Explorer"
                  : "Your Social Graph"}
              </Title>
              <Paragraph>
                {isFirstTimeUser
                  ? "Start exploring by adding someone you know!"
                  : "Here’s a dynamic graph of your current social network."}
              </Paragraph>

              <Row gutter={[24, 24]}>
                {!isFirstTimeUser && (
                  <Col xs={24} lg={16}>
                    <div
                      style={{
                        height: "400px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    >
                     
                      <ForceGraph2D
                        graphData={graphData}
                        nodeAutoColorBy="id"
                        width={800}
                        height={400}
                        onNodeClick={handleNodeClick}
                        linkDirectionalArrowLength={5}
                        linkDirectionalArrowRelPos={1}
                        nodeCanvasObject={(node, ctx, globalScale) => {
                          const img = imageCache.current[node.id];
                          const size = 10;
                          if (img) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
                            ctx.closePath();
                            ctx.clip();
                            ctx.drawImage(
                              img,
                              node.x - size / 2,
                              node.y - size / 2,
                              size,
                              size
                            );
                            ctx.restore();
                          } else {

                            ctx.fillStyle = "gray";
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
                            ctx.fill();
                          }
                        }}
                        nodePointerAreaPaint={(node, color, ctx) => {
                          ctx.fillStyle = color;
                          ctx.beginPath();
                          ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI, false);
                          ctx.fill();
                        }}
                      />
                    </div>
                  </Col>
                )}

                <Col xs={24} lg={isFirstTimeUser ? 24 : 8}>
                  <Search
                    placeholder="Search people by name or username"
                    enterButton={
                      <Button icon={<SearchOutlined />}>Search</Button>
                    }
                    size="large"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    // onSearch={fetchResults}
                  />

                  {results.length > 0 && (
                    <List
                      bordered
                      style={{ marginTop: 16, cursor: "pointer" }}
                      dataSource={results}
                      renderItem={(item) => (
                        <List.Item
                          onClick={() => handleSearchUserClick(item)}
                         
                        >
                          <div>
                            <strong>
                              {item.fname} {item.lname}
                            </strong>{" "}
                            ({item.username})
                          </div>
                        </List.Item>
                      )}
                    />
                  )}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <UserProfileModal
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedUserData(null);
          }}
          userData={selectedUserData}
          currentUserInterests={currentUserInterests}
          onAddConnection={() => handleAddConnection(selectedUserData)}
          refreshConnections={fetchConnections}
        />
        <UserProfileModal
          visible={searchModalVisible}
          onClose={() => {
            setSearchModalVisible(false);
            setSearchModalUser(null);
          }}
          userData={searchModalUser}
          currentUserInterests={currentUserInterests}
          onAddConnection={() => handleAddConnection(searchModalUser)}
          refreshConnections={fetchConnections}
          triggerFriendRequestRefresh={triggerFriendRequestRefresh}
        />
      </Content>
    </Layout>
  );
};

export default Home;
