import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

/**
 * Call this once from a component that has access to Clerk's `getToken`
 * (e.g. in App.jsx via useAuth()) so every request automatically carries
 * a fresh JWT. Keeping this outside a hook avoids re-creating the
 * interceptor on every render.
 */
export function attachClerkAuthInterceptor(getToken) {
  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // No signed-in user — request proceeds unauthenticated for
      // optionalAuth routes.
    }
    return config;
  });
}

export default api;