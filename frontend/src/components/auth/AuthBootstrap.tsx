"use client";

import { useEffect } from "react";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

/** Removes stale persisted credentials so internal gallery actions do not keep retrying 401s. */
export function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    void fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && data.success && data.data) setAuth(token, data.data);
      })
      .catch(() => {
        // A temporary network failure must not log a user out.
      });

    return () => {
      cancelled = true;
    };
  }, [logout, setAuth, token]);

  return null;
}
