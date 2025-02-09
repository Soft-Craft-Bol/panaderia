import axios from 'axios';
import { getToken } from '../utils/authFunctions';

const baseURL = "http://localhost:8082/api/v1";

const api = axios.create({
    baseURL: baseURL,
    responseType: 'json',
    withCredentials: true, 
    timeout: 10000,
  });

/* api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
}); */

export default api;

export const loginUser = (data) => api.post('/auth/log-in', data);
export const addUser = (data) => api.post('/auth/sign-up', data);


export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getRoles = () => api.get('/roles');
export const getUsers = () => api.get('/users');
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const getUserById = (id) => api.get(`/users/${id}`);

