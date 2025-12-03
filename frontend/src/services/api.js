/**
 * API Service
 * Centralized API calls with JWT authentication
 */

const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token in localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
};

// Create fetch options with auth header
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Handle API response
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(userData)
    });
    const data = await handleResponse(response);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  logout: () => {
    removeToken();
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  }
};

// Properties API
export const propertiesAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/properties?${params}`, {
      headers: createHeaders(false)
    });
    return handleResponse(response);
  },

  getFeatured: async () => {
    const response = await fetch(`${API_URL}/properties/featured`, {
      headers: createHeaders(false)
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      headers: createHeaders(false)
    });
    return handleResponse(response);
  },

  getUserProperties: async () => {
    const response = await fetch(`${API_URL}/properties/user/my-listings`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  create: async (propertyData) => {
    const response = await fetch(`${API_URL}/properties`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(propertyData)
    });
    return handleResponse(response);
  },

  update: async (id, propertyData) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(propertyData)
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const response = await fetch(`${API_URL}/properties/${id}`, {
      method: 'DELETE',
      headers: createHeaders()
    });
    return handleResponse(response);
  }
};

// Bookmarks API
export const bookmarksAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/bookmarks`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  toggle: async (propertyId) => {
    const response = await fetch(`${API_URL}/bookmarks/${propertyId}`, {
      method: 'POST',
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  check: async (propertyId) => {
    const response = await fetch(`${API_URL}/bookmarks/check/${propertyId}`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  }
};

// Messages API
export const messagesAPI = {
  getConversations: async () => {
    const response = await fetch(`${API_URL}/messages/conversations`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  getConversation: async (userId) => {
    const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  },

  send: async (messageData) => {
    const response = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(messageData)
    });
    return handleResponse(response);
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_URL}/messages/unread`, {
      headers: createHeaders()
    });
    return handleResponse(response);
  }
};

export { getToken, setToken, removeToken };
