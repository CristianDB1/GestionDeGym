// Funciones para gestionar la sesión del usuario

// Guarda la información del usuario en localStorage
export const setUserSession = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  // Obtiene la información del usuario desde localStorage
  export const getUserSession = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
  };
  
  // Elimina la información del usuario de localStorage
  export const removeUserSession = () => {
    localStorage.removeItem('user');
  };
  
  // Verifica si hay un usuario autenticado
  export const isAuthenticated = () => {
    return getUserSession() !== null;
  };