/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import axios from "axios";
import { BASE_URL } from "./apiPath"; 
import axiosInstance from "./axiosInstance";



// const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
// const cloudFolderName = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const handleApiError = (error) => {
  // console.error("API Error:", error);
  const message =
    error?.response?.data?.message ||
    error?.response?.data ||
    error?.message ||
    "Unknown error occurred";
  throw new Error(message);
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/create`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    // console.error(
    //   "Registration error:",
    //   error?.response?.data || error.message
    // );
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/signin`, credentials);
    return response.data;
  } catch (error) {
    // console.error("Login error:", error?.response?.data || error.message);
    throw error.response?.data || { message: "Login failed" };
  }
};

export const getUserById = async (id) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await axiosInstance.get(`/users/get/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getConnectedSearchedUserById = async (currentUserId, targetUserId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await axiosInstance.get(
      `/users/get/search/${currentUserId}/${targetUserId}`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getConnections = async (userId) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await axiosInstance.get(
      `/connection/${userId}/connections`
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const searchUsers = async (searchTerm, excludeIds = []) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users/searchByName`, {
      params: {
        name: searchTerm,
        excludeIds: excludeIds.join(","),
      },
    });
    return response.data;
  } catch (error) {
    // console.error("Error searching users:", error);
    return [];
  }
};

export const sendConnectionRequest = async (requesterId, receiverId) => {
  try {
    const payload = {
      requesterId,
      receiverId,
    };

    const response = await axiosInstance.post("/connection/send", payload);

    return response.data;
  } catch (error) {
    console.error("Error sending connection request:", error);
    throw error;
  }
};

export const getConnectionStatus = async (user1, user2) => {
  try {
    const res = await axiosInstance.get(`/connection/status`, {
      params: { user1, user2 },
    });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const removeConnection = async (data) => {
  try {
    const res = await axiosInstance.delete(`/connection/remove`, { data });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const blockConnection = async (data) => {
  try {
    const res = await axiosInstance.post(`/connection/block`, data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const unblockConnection = async (data) => {
  try {
    const res = await axiosInstance.delete(`/connection/unblock`, { data });
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPendingRequestsCount = async (userId) => {
  try {
    const res = await axiosInstance.get(
      `/connection/${userId}/pending/received/count`
    );
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getPendingReceivedRequests = async (userId) => {
  try {
    const requestedUsers = await axiosInstance.get(
      `/connection/${userId}/pending/received`
    );

    //  const requestedUsers = await Promise.all(
    //    res?.data?.map(async (item) => await getUserById(item?.requesterId))
    //  );
    return requestedUsers?.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const acceptFriendReq = async (data) => {
  try {
    const res = await axiosInstance.post(`/connection/accept`, data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const rejectFriendReq = async (data) => {
  try {
    const res = await axiosInstance.post(`/connection/reject`, data);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getFriendSuggestions = async (userId) => {
  try {
    const res = await axiosInstance.get(`/graph/suggestions?userId=${userId}`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};
export const getPendingRequest = async (userId) => {
  try {
    const res = await axiosInstance.get(`/connection/${userId}/pending/sent`);
    return res.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", process.env.VITE_CLOUDINARY_CLOUD_NAME);

  try {
    const res = await axiosInstance.post(
      `https://api.cloudinary.com/v1_1/${process.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData
    );

    return res.data.secure_url;
  } catch (error) {
    handleApiError(error);
  }
};


export const checkUsernameAPI = async (username) => {
  try {
    const res = await axiosInstance.get(`${BASE_URL}/users/check-username`, {
      params: { username },
    });
    return res.data;
  } catch (err) {
    // console.error("Username check failed", err);
    return false;
  }
};