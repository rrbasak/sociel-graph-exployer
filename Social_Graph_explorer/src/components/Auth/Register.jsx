/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Upload,
  Checkbox,
  Typography,
  message,
  Row,
  Col,
  Spin,
  Space
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { registerUser, uploadImageToCloudinary } from "../../api/auth";

const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const genderOptions = ["Male", "Female", "Other"];

const interestOptions = [
  "90s Kid",
  "Harry Potter",
  "SoundCloud",
  "Spa",
  "Self Care",
  "Heavy Metal",
  "House Parties",
  "Gymnastics",
  "Ludo",
  "Maggi",
  "Documentaries",
  "Biryani",
  "Drama shows",
  "Meditation",
  "Foodie",
  "Sushi",
  "Spotify",
  "Hockey",
  "Basketball",
  "Fantasy movies",
  "Home Workout",
  "Theater",
  "Cafe hopping",
  "Sneakers",
  "Aquarium",
  "Instagram",
  "Hot Springs",
  "Walking",
  "Running",
  "Travel",
  "Language Exchange",
  "Movies",
  "Action movies",
  "Animated movies",
  "Crime shows",
  "Social Development",
  "Gym",
  "Social Media",
  "Soul music",
  "Hip Hop",
  "Skincare",
  "Musical theater",
  "J-Pop",
  "Cricket",
  "Shisha",
  "Freelancing",
  "K-Pop",
  "Skateboarding",
];

const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);



  const handleFinish = async (values) => {
    setLoading(true);
    try {
      let profileUrl = null;
      let coverUrl = null;
      if (values.profilePicture && values.profilePicture.length > 0) {
        profileUrl = await uploadImageToCloudinary(
          values.profilePicture[0].originFileObj
        );
      }

      if (values.coverPhoto && values.coverPhoto.length > 0) {
        coverUrl = await uploadImageToCloudinary(
          values.coverPhoto[0].originFileObj
        );
      }

      const dob = values.dateOfBirth
        ? values.dateOfBirth.format("YYYY-MM-DD")
        : null;



      const payload = {
        fname: values.fname,
        lname: values.lname,
        username: values.username,
        email: values.email,
        password: values.password,
        bio: values.bio || "",
        dateOfBirth: dob,
        gender: values.gender || "",
        location: values.location || "",
        interests: values.interests || [],
        profilePicture: profileUrl,
        coverPhoto: coverUrl,
      };

      await registerUser(payload);
      message.success("Registered successfully!");
      navigate("/login");
    } catch (err) {
      message.error(err?.response?.data?.message || "Registration failed");
    }
    finally{
      setLoading(false);
    }
  };

  return (
    <Row justify="center" style={{ padding: "40px 0", background: "#f0f2f5" }}>
      <Col xs={22} sm={18} md={14} lg={10}>
        <div
          style={{
            background: "#fff",
            padding: 32,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Title level={2} style={{ textAlign: "center", marginBottom: 24 }}>
            Create an Account
          </Title>
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                interests: [],
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="First Name"
                    name="fname"
                    rules={[
                      { required: true, message: "First Name is required" },
                    ]}
                  >
                    <Input placeholder="First Name" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label="Last Name"
                    name="lname"
                    rules={[
                      { required: true, message: "Last Name is required" },
                    ]}
                  >
                    <Input placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: "Username is required" }]}
              >
                <Input placeholder="Username" autoComplete="new-username" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Email" autoComplete="new-email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Title level={4} style={{ marginTop: 32 }}>
                Optional Information
              </Title>

              <Form.Item label="Bio" name="bio">
                <TextArea rows={4} placeholder="Tell us about yourself" />
              </Form.Item>

              <Form.Item label="Date of Birth" name="dateOfBirth">
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                  placeholder="Select Date of Birth"
                />
              </Form.Item>

              <Form.Item label="Gender" name="gender">
                <Select placeholder="Select Gender" allowClear>
                  {genderOptions.map((g) => (
                    <Option key={g} value={g}>
                      {g}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Location" name="location">
                <Input placeholder="Location" />
              </Form.Item>

              <Form.Item
                label="Profile Picture"
                name="profilePicture"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                extra="Upload your profile picture"
                rules={[{ required: false }]}
              >
                <Upload
                  name="profilePicture"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false} 
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>
                    Select Profile Picture
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="Cover Photo"
                name="coverPhoto"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                extra="Upload your cover photo"
                rules={[{ required: false }]}
              >
                <Upload
                  name="coverPhoto"
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false} 
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Select Cover Photo</Button>
                </Upload>
              </Form.Item>

              <Form.Item label="What are you into?" name="interests">
                <Checkbox.Group>
                  <Row gutter={[8, 8]}>
                    {interestOptions.map((interest) => (
                      <Col key={interest} xs={12} sm={8} md={6}>
                        <Checkbox value={interest}>{interest}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Checkbox.Group>
              </Form.Item>

              <Form.Item>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    style={{ borderRadius: 6 }}
                    disabled={loading}
                  >
                    Register
                  </Button>
                  <Button
                    type="default"
                    block
                    onClick={() => navigate("/login")}
                    disabled={loading}
                  >
                    Login
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </div>
      </Col>
    </Row>
  );
};

export default Register;
