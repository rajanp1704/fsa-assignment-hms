"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { initAuth, logout } from "@/store";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, token } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(initAuth());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    token,
    logout: handleLogout,
  };
}

export function useRequireAuth(allowedRoles?: string[]) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        switch (user.role) {
          case "patient":
            router.push("/patient/dashboard");
            break;
          case "doctor":
            router.push("/doctor/dashboard");
            break;
          case "labstaff":
            router.push("/lab/dashboard");
            break;
          case "admin":
            router.push("/admin/dashboard");
            break;
          default:
            router.push("/");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router, allowedRoles]);

  return { user, isAuthenticated, isLoading };
}
