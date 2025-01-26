"use client";

import { store } from "@/store/store.ts";
import { Theme } from "@radix-ui/themes";
import { Provider } from "react-redux";
import { ToastProvider } from "../general/customToast.tsx";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  LOCALSTORAGE_NAME_IS_LOGGED_IN,
  PATHNAME_NON_DASHBOARD_LIST,
} from "@/utils/constants.ts";

interface CustomProviderProps {
  children?: React.ReactNode;
}

export default function CustomProvider({ children }: CustomProviderProps) {
  // if isLoggedIn exist when accessing non-dashboard path, redirect to dashboard
  const pathname = usePathname();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem(LOCALSTORAGE_NAME_IS_LOGGED_IN);
    if (PATHNAME_NON_DASHBOARD_LIST.includes(pathname) && isLoggedIn) {
      redirect("/dashboard");
    }
  }, []);

  return (
    <Provider store={store}>
      <Theme>
        <ToastProvider>{children}</ToastProvider>
      </Theme>
    </Provider>
  );
}
