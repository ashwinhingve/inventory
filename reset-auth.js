// Clear all authentication-related items in localStorage
try {
  // Clear auth-related items
  localStorage.removeItem('token');
  localStorage.removeItem('loggedOut');
  localStorage.removeItem('login_successful');
  localStorage.removeItem('manual_logout');
  localStorage.removeItem('redirectAfterLogin');
  
  // Clear session storage items too
  sessionStorage.removeItem('redirectAttempted');
  sessionStorage.removeItem('storeContextInit');
  
  // Reload the page to apply changes
  console.log('Authentication state reset successfully. Reloading page...');
  window.location.reload();
} catch (error) {
  console.error('Error resetting authentication state:', error);
}

