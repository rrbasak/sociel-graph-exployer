import axios from "axios";

export const BASE_URL = "https://social-graph-exployer-backend-api-gateway.onrender.com/api/v0";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Attach token to each request
axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken: user.refreshToken,
          });

          const updatedUser = {
            ...user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
          localStorage.setItem("token", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);

          // Retry original request with new token
          originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          localStorage.clear();
          window.location.href = "/login"; 
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);





// Handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(
      error?.response?.data || { message: "Something went wrong" }
    );
  }
);

export default axiosInstance;
