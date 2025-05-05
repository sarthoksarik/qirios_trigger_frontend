// src/api/axiosConfig.js
import axios from 'axios';

// Helper function to get a cookie by name (if not using axios built-in handling)
// You might not strictly need this if xsrfCookieName works, but it's explicit.
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Create an Axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Your API base URL
    xsrfCookieName: 'csrftoken', // Tells axios to look for this cookie
    xsrfHeaderName: 'X-CSRFToken', // Tells axios to set this header with the cookie value
    withCredentials: true, // *** CRITICAL: Allows sending cookies cross-origin ***
});

// Alternative/Explicit Header Setting (if xsrf options don't work reliably for some reason)
// const csrftoken = getCookie('csrftoken');
// if (csrftoken) {
//     apiClient.defaults.headers.common['X-CSRFToken'] = csrftoken;
// }


export default apiClient;