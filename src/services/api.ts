import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://saquacare-backend.onrender.com/api',
});