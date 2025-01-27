"use client";
import React, { useState, createContext, useContext, useEffect } from "react";
import ReactDOM from "react-dom";
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

  // Create a container for the Toast portal
  const [toastContainer, setToastContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    // Create a div for the Toast portal and append it to the body
    const container = document.createElement("div");
    document.body.appendChild(container);
    setToastContainer(container);

    // Cleanup: Remove the container when the component unmounts
    return () => {
      document.body.removeChild(container);
    };
  }, []);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const newToast = { id: toastId++, type, message };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Automatically remove the toast after specific seconds
    setTimeout(() => {
      setToasts((prevToasts) =>
        prevToasts.filter((toast) => toast.id !== newToast.id)
      );
    }, toastDuration + 1000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {/* Render children (including Dialog) */}
      {children}

      {/* Render toasts in a portal */}
      {toastContainer &&
        ReactDOM.createPortal(
          <Toast.Provider swipeDirection="right">
            {toasts.map((toast) => (
              <Toast.Root
                key={toast.id}
                className={`ToastRoot relative ${toast.type}`}
                duration={toastDuration}
                style={{ zIndex: 1000 }} // Ensure higher z-index
              >
                <Toast.Close
                  style={{
                    color: "white",
                    cursor: "pointer",
                    fontSize: "20px",
                    width: "20px",
                    height: "20px",
                  }}
                  className="!absolute !top-0 !right-2"
                >
                  &times;
                </Toast.Close>
                <Flex
                  direction={"column"}
                  justify={"start"}
                  align="start"
                  gap="3"
                  width={"100%"}
                >
                  <Toast.Description asChild>
                    <Text size={"2"}>{toast.message}</Text>
                  </Toast.Description>
                </Flex>
              </Toast.Root>
            ))}

            {/* Toast viewport (where the toasts will appear) */}
            <Toast.Viewport className="ToastViewport" />
          </Toast.Provider>,
          toastContainer // Render the Toast in the portal container
        )}
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
