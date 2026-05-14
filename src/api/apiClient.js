const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://family-node.duckdns.org/api';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('family-node-auth');
    return saved ? JSON.parse(saved)?.token : null;
  } catch (error) {
    console.error('Auth token read error:', error);
    return null;
  }
};

const request = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const token = getStoredToken();
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    mergedHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || response.statusText || 'API 요청 실패';
    throw new Error(errorMessage);
  }

  return data;
};

export const login = (payload) => request('/auth/login', { method: 'POST', body: payload });
export const getMe = () => request('/auth/me');

export const getPosts = () => request('/posts');
export const createPost = (payload) => request('/posts', { method: 'POST', body: payload });

export const getSchedules = () => request('/schedules');
export const createSchedule = (payload) => request('/schedules', { method: 'POST', body: payload });

export const getChats = () => request('/chats');
export const createChat = (payload) => request('/chats', { method: 'POST', body: payload });
