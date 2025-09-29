import { authAPI } from './api.js';

// Authentication functions
export async function loginUser(loginId, password, userType) {
  try {
    const response = await authAPI.login(loginId, password, userType);
    
    if (response.success) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      return response.user;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export async function logoutUser() {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}

export function checkAuth() {
  const currentUser = getCurrentUser();
  
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  
  return currentUser;
}

export function checkAuthAndRedirect() {
  const currentUser = getCurrentUser();
  
  if (currentUser) {
    if (currentUser.type === 'broker' && !window.location.href.includes('dashboard1.html')) {
      window.location.href = 'dashboard1.html';
    } else if (currentUser.type === 'admin' && !window.location.href.includes('dashboard2.html')) {
      window.location.href = 'dashboard2.html';
    }
  }
}