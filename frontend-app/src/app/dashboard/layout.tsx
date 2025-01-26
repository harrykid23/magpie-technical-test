"use client";

import { useEffect, useState } from "react";
import {
  HomeIcon,
  PersonIcon,
  HamburgerMenuIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import {
  Flex,
  Text,
  DropdownMenu,
  Button,
  Box,
  Skeleton,
} from "@radix-ui/themes";
import { redirect, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store.ts";
import buildApiCaller from "@/hook/apiHook.ts";
import { setSession } from "@/store/session/sessionSlice.ts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import { TypeSession } from "../../../../shared/types.ts";
import { useToast } from "@/component/general/customToast.tsx";
import { LOCALSTORAGE_NAME_IS_LOGGED_IN } from "@/utils/constants.ts";
import { PERMISSION_NAME } from "@shared/constants.ts";
import CustomNavLink, {
  checkMenuActive,
} from "@/component/general/customNavLink.tsx";

const menuList = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <HomeIcon className="h-5 w-full max-w-10 text-center" />,
    permission: [],
  },
  {
    title: "Book Management",
    url: "/dashboard/book-management",
    icon: <ReaderIcon className="h-5 w-full max-w-10 text-center" />,
    permission: [PERMISSION_NAME.read_book],
  },
  {
    title: "Lending Management",
    url: "/dashboard/lending-management",
    icon: <PersonIcon className="h-5 w-full max-w-10 text-center" />,
    permission: [PERMISSION_NAME.read_lending],
  },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const session = useSelector((state: RootState) => state.session.session);
  const dispatch: AppDispatch = useDispatch();
  const { isLoading: isLoadingSession, fetchData: getSessionData } =
    buildApiCaller<any, TypeAPIBody<TypeSession>>("/auth/getSessionData");
  const { showToast } = useToast();
  const forceLogout = (toastMessage?: string) => {
    if (toastMessage) {
      showToast("error", toastMessage);
    }
    dispatch(setSession(null));
    localStorage.removeItem(LOCALSTORAGE_NAME_IS_LOGGED_IN);
    redirect("/");
  };

  useEffect(() => {
    // set session data not exist in store while logged in
    const isLoggedIn = localStorage.getItem(LOCALSTORAGE_NAME_IS_LOGGED_IN);
    if (!isLoggedIn) {
      redirect("/");
    }
    if (!session) {
      getSessionData({
        method: "GET",
        callback(result, isError) {
          if (isError) {
            forceLogout(result.displayMessage);
          } else {
            dispatch(setSession(result.data));
          }
        },
      });
    }
  }, [session]);
  const userPermissionSet = new Set(
    session?.role.mapRolePermissions.map(
      (mapRolePermission) => mapRolePermission.permission.name
    ) || []
  );

  return (
    <Flex className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Box
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-white shadow-md transition-all duration-300 ease-in-out`}
      >
        <Flex
          justify={isSidebarOpen ? "between" : "center"}
          align="center"
          className="p-4"
        >
          {isSidebarOpen && (
            <Text size="4" weight="bold" className="text-gray-700">
              Library Management System
            </Text>
          )}
          <Button
            variant="ghost"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-700 hover:text-primary-500 focus:outline-none transition-colors duration-200"
          >
            <HamburgerMenuIcon className="w-6 h-6" />
          </Button>
        </Flex>
        <nav className="mt-4">
          <Flex direction="column" gap="2">
            {!session ? (
              <>
                <div className="w-full px-3">
                  <Skeleton width="100%" height="40px" />
                </div>
                <div className="w-full px-3">
                  <Skeleton width="100%" height="40px" />
                </div>
                <div className="w-full px-3">
                  <Skeleton width="100%" height="40px" />
                </div>
              </>
            ) : (
              menuList.map((menu, index) => {
                // check if user has all permission needed
                if (
                  menu.permission.every((singlePermission) =>
                    userPermissionSet.has(singlePermission)
                  )
                ) {
                  return (
                    <CustomNavLink
                      key={index}
                      href={menu.url}
                      className="flex items-center p-3 text-gray-700 hover:bg-blue-100 hover:text-primary-500 transition-colors duration-200"
                    >
                      {menu.icon}
                      {isSidebarOpen && (
                        <Text className="ml-3">{menu.title}</Text>
                      )}
                    </CustomNavLink>
                  );
                } else {
                  return null;
                }
              })
            )}
          </Flex>
        </nav>
      </Box>

      {/* Main Content */}
      <Flex direction="column" className="flex-1 overflow-hidden">
        {/* Navbar */}
        <Box className="bg-white shadow-md p-4">
          <Flex justify="between" align="center">
            <Text size="5" weight="bold" className="text-gray-700">
              {
                menuList.find((menu) => checkMenuActive(menu.url, pathname))
                  ?.title
              }
            </Text>
            <Flex align="center" gap="4">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-primary-500"
                  >
                    <Flex align="center">
                      {session ? (
                        <Text>{session.name}</Text>
                      ) : (
                        <Skeleton width="80px" height="20px" />
                      )}

                      <ChevronDownIcon className="w-4 h-4 ml-2" />
                    </Flex>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="w-48">
                  <div className="pt-2 px-4">
                    <Flex direction={"column"} gap="2">
                      {session ? (
                        <>
                          <Text size="2" weight="bold">
                            {session.name}
                          </Text>
                          <Text size="1" color="gray">
                            {session.email}
                          </Text>
                          <Text size="1" color="gray">
                            {session.role.name}
                          </Text>
                        </>
                      ) : (
                        <>
                          <Skeleton width="100%" height="20px" />
                          <Skeleton width="100%" height="20px" />
                          <Skeleton width="100%" height="20px" />
                        </>
                      )}
                    </Flex>
                  </div>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item
                    onSelect={() => {
                      forceLogout();
                    }}
                    className="!text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Flex>
        </Box>

        {/* Page Content */}
        <Box className="flex-1 p-6 bg-gray-50 overflow-y-auto">{children}</Box>
      </Flex>
    </Flex>
  );
}
