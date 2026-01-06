import axios from "axios";

// Extend the AxiosRequestConfig to include our custom options
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuthRefresh?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000, // 10 second timeout
});

// Request interceptor
const requestInterceptor = apiClient.interceptors.request.use(
  async (config) => {
    // Skip auth for public endpoints or when skipAuthRefresh is true
    if (config.skipAuthRefresh || config.url?.includes('/public/') || 
        config.url?.includes('/core/refresh/') || 
        config.url?.includes('/core/public-token/')) {
      return config;
    }
    
    try {
      const token = await ensureToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
const responseInterceptor = apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/core/refresh/') && 
        !originalRequest.url?.includes('/core/public-token/') &&
        !originalRequest.skipAuthRefresh) {
      
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${apiClient.defaults.baseURL}/core/refresh/`,
            { refresh: refreshToken },
            { skipAuthRefresh: true }
          );
          
          localStorage.setItem("accessToken", data.access);
          if (data.refresh) {
            localStorage.setItem("refreshToken", data.refresh);
          }
          
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

// Public Token
export const getPublicToken = async () => {
  const { data } = await apiClient.post(
    "/core/public-token/",
    {},
    { skipAuthRefresh: true }
  );
  localStorage.setItem("accessToken", data.access);
  if (data.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
  }
  return data;
};

// Login
export const login = async (credentials: { email: string; password: string }) => {
  const { data } = await apiClient.post("/core/login/", credentials, { skipAuthRefresh: true });
  localStorage.setItem("accessToken", data.access);
  if (data.refresh) {
    localStorage.setItem("refreshToken", data.refresh);
  }
  return data;
};

// Logout
export const logout = () => {
  localStorage.clear();
  window.location.href = "/";};

// Fetch Authenticated User
export const getUserDetails = async () => {
  const { data } = await apiClient.get("/core/me/");
  return data;
};

export const ensureToken = async (): Promise<string | null> => {
  // If we have a valid token, use it
  const currentToken = localStorage.getItem("accessToken");
  if (currentToken) {
    return currentToken;
  }
  
  // Otherwise get a public token
  try {
    const { data } = await apiClient.post(
      "/core/public-token/",
      {},
      { skipAuthRefresh: true }
    );
    localStorage.setItem("accessToken", data.access);
    if (data.refresh) {
      localStorage.setItem("refreshToken", data.refresh);
    }
    return data.access;
  } catch (error) {
    console.error("Failed to get public token", error);
    throw error;
  }
};

// Cleanup function for interceptors (useful in development)
const cleanupInterceptors = () => {
  apiClient.interceptors.request.eject(requestInterceptor);
  apiClient.interceptors.response.eject(responseInterceptor);
};

export { cleanupInterceptors };
export default apiClient;