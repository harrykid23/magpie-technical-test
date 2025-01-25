"use client";
import React, { useState, createContext, useContext } from "react";
import * as Toast from "@radix-ui/react-toast";
import { Flex, Text, Button } from "@radix-ui/themes";

interface ToastConfig {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  showToast: (type: "success" | "error" | "info", message: string) => void;
}

// Create the ToastContext
const ToastContext = createContext<ToastContextType | null>(null);

let toastId = 0;
const toastDuration = 5000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const newToast = { id: toastId++, type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Automatically remove the toast after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== newToast.id)
      );
    }, toastDuration + 1000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        {/* Render all toasts */}
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className={`ToastRoot ${toast.type}`}
            duration={toastDuration}
          >
            <Flex align="center" gap="3">
              <Toast.Description asChild>
                <Text size={"2"}>{toast.message}</Text>
              </Toast.Description>
              <Toast.Close asChild style={{ alignSelf: "flex-start" }}>
                <Button
                  size="1"
                  variant="ghost"
                  style={{
                    color: "white",
                    cursor: "pointer",
                    fontSize: "20px",
                  }}
                >
                  &times;
                </Button>
              </Toast.Close>
            </Flex>
          </Toast.Root>
        ))}

        {/* Toast viewport (where the toasts will appear) */}
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
