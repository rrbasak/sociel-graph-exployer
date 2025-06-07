import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Card, Spin, Space } from "antd";
import { loginUser } from "../../api/auth";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await loginUser(values);

      if (!data?.accessToken || typeof data.accessToken !== "string") {
        toast.error("Invalid token");
        return;
      }

      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data));
      // toast.success("Login successful");
      toast.success(
        `Welcome ${data?.fname}! You have successfully logged in.`
      );
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.id) {
          navigate("/home");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Card style={{ width: 400 }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Login
        </Title>
        <Spin spinning={loading}>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your username!" },
              ]}
            >
              <Input placeholder="Enter username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  disabled={loading}
                >
                  Login
                </Button>
                <Button
                  type="default"
                  block
                  onClick={() => navigate("/register")}
                  disabled={loading}
                >
                  Register
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default Login;
