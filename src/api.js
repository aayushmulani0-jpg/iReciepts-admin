import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://ireceipts.com.au/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const method = (config.method || "get").toUpperCase();
    console.log(
      `[API REQUEST] ${method} ${config.baseURL || API_BASE_URL}${config.url}`,
    );
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const method = (error.config?.method || "get").toUpperCase();
    const requestUrl = `${error.config?.baseURL || API_BASE_URL}${error.config?.url || ""}`;
    console.error(
      `[API ERROR] ${method} ${requestUrl}`,
      error.response?.data || error.message,
    );
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/login";
    }
    const message =
      error.response?.data?.message || error.message || "API Error";
    return Promise.reject(new Error(message));
  },
);

const getTokenFromResponse = (response) => {
  if (!response) {
    return "";
  }

  if (typeof response === "string") {
    return response;
  }

  return (
    response.token ||
    response.accessToken ||
    response.jwt ||
    response.data?.token ||
    response.data?.accessToken ||
    response.data?.jwt ||
    ""
  );
};

// Admin API
export const loginAdmin = async (email, password) => {
  const response = await apiClient.post("/v1/admin/login", { email, password });
  console.log("Admin login response:", response);
  return response;
};

export const getStats = async () => {
  const response = await apiClient.get("/v1/admin/bills/stats");
  console.log("Admin stats response:", response);
  return response;
};

export const getUsers = async (
  page = 1,
  limit = 20,
  search = "",
  role = "",
) => {
  const response = await apiClient.post("/v1/admin/users/all", {
    page,
    limit,
    search,
    role,
  });
  console.log("Admin users response:", response);
  return response;
};

export const getUserById = async (id) => {
  const response = await apiClient.post(`/v1/admin/user/${id}`);
  console.log("Admin user detail response:", response);
  return response;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/v1/admin/user/${id}`);
  console.log("Admin delete user response:", response);
  return response;
};

export const setUserPassword = async (id, password) => {
  const response = await apiClient.post(`/v1/admin/users/${id}/password`, {
    password,
  });
  console.log("Admin set password response:", response);
  return response;
};

export const getAttachments = async (
  page = 1,
  limit = 20,
  userId = "",
  isPdf = "true",
) => {
  const response = await apiClient.post("/v1/admin/attachments/all", {
    page,
    limit,
    userId,
    isPdf,
  });
  console.log("Admin attachments response:", response);
  return response;
};

export const getAttachmentById = async (id) => {
  const response = await apiClient.post(`/v1/admin/attachments/${id}`);
  console.log("Admin attachment detail response:", response);
  return response;
};

export const getBills = async (
  page = 1,
  limit = 20,
  userId = "",
  category = "",
  fromDate = "",
  toDate = "",
) => {
  const response = await apiClient.post("/v1/admin/bills/all", {
    page,
    limit,
    userId,
    category,
    fromDate,
    toDate,
  });
  console.log("Admin bills response:", response);
  return response;
};

export const getBillsAnalysisJson = async (userId = "", folderId = "") => {
  const response = await apiClient.post("/v1/admin/bills/analysis-json", {
    userId,
    folderId,
  });
  console.log("Admin bills analysis JSON response:", response);
  return response;
};

export const getBillStats = async () => {
  const response = await apiClient.get("/v1/admin/bills/stats");
  console.log("Admin bills stats response:", response);
  return response;
};

export const getAdminTokenFromResponse = getTokenFromResponse;
