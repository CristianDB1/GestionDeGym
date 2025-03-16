import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// Configuración por defecto para axios
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Servicios para autenticación
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Servicios para usuarios
export const getUsuarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/usuarios/listar`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsuario = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const crearUsuario = async (usuario) => {
  try {
    const response = await axios.post(`${API_URL}/usuarios/crear`, usuario);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const actualizarUsuario = async (id, usuario) => {
  try {
    const response = await axios.put(`${API_URL}/usuarios/${id}`, usuario);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/usuarios/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};