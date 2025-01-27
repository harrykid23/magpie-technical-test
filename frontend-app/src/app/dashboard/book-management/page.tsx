"use client";

import CustomTable, {
  CustomTableColumn,
} from "@/component/general/customTable.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { Button, Flex } from "@radix-ui/themes";
import {
  TypePagination,
  TypeRequestGetTable,
  TypeResponseGetBookList,
} from "@shared/types.ts";
import { TypeAPIBody } from "../../../../../backend-app/utils/apiUtils.ts";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store.ts";
import { PERMISSION_NAME } from "@shared/constants.ts";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useToast } from "@/component/general/customToast.tsx";
import AddBookButton from "@/component/book-management/addBookButton.tsx";

export default function Dashboard() {
  // table data
  const session = useSelector((state: RootState) => state.session.session);
  const userPermissionSet = new Set(
    session?.role.mapRolePermissions.map(
      (mapRolePermission) => mapRolePermission.permission.name
    ) || []
  );

  const columns: CustomTableColumn<TypeResponseGetBookList>[] = [
    { key: "title", label: "Title", sortable: true, orderByPath: "title" },
    { key: "author", label: "Author", sortable: true, orderByPath: "author" },
    { key: "isbn", label: "ISBN", sortable: true, orderByPath: "isbn" },
    {
      key: "quantity",
      label: "Quantity",
      sortable: true,
      orderByPath: "quantity",
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      orderByPath: (dir) => ({
        category: {
          name: dir,
        },
      }),
      valueByPath(row) {
        return row.category.name;
      },
    },
    {
      key: "createdBy",
      label: "Created By",
      sortable: true,
      orderByPath: (dir) => ({
        createdBy: {
          name: dir,
        },
      }),
      valueByPath(row) {
        return row.createdBy.name;
      },
    },
    {
      key: "action",
      label: "Action",
      valueByPath(row) {
        return (
          <Flex
            width={"100%"}
            direction={"row"}
            align={"center"}
            justify={"center"}
            gap="3"
          >
            {userPermissionSet.has(PERMISSION_NAME.update_book) ? (
              <Button
                color="orange"
                className="hover:bg-orange-700 transition-al duration-300l"
              >
                <Pencil1Icon color="white" />
              </Button>
            ) : null}
            {userPermissionSet.has(PERMISSION_NAME.delete_book) ? (
              <Button
                color="red"
                className="hover:bg-red-600 transition-all duration-300"
              >
                <TrashIcon color="white" />
              </Button>
            ) : null}
          </Flex>
        );
      },
    },
  ];

  // get table data functions
  const {
    isLoading: isLoadingBookList,
    result: resultBookList,
    fetchData: getBookList,
  } = buildApiCaller<TypeRequestGetTable, TypeAPIBody<TypeResponseGetBookList>>(
    "/book"
  );

  const [pagination, setPagination] = useState<TypePagination>({
    currentPage: 1,
    maxPage: 1,
    itemPerPage: 10,
  });
  const [refreshDataFunction, setRefreshDataFunction] = useState<
    (() => void) | null
  >(null);

  const { showToast } = useToast();

  return (
    <Flex
      className="bg-white p-6 rounded-lg shadow-md"
      direction="column"
      gap="3"
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Book Management
      </h2>
      <Flex direction={"row"} justify="end" width={"100%"}>
        <AddBookButton refreshTable={refreshDataFunction} />
      </Flex>
      <CustomTable<TypeResponseGetBookList>
        data={resultBookList?.data || []}
        isLoading={isLoadingBookList}
        columns={columns}
        fetchData={(body) => {
          getBookList({
            method: "POST",
            body,
            callback(result, isError) {
              if (isError) {
                showToast(
                  "error",
                  "Error when retrieving data. " + result.displayMessage
                );
              } else {
                if (result.pagination) {
                  setPagination(result.pagination);
                }
              }
            },
          });
        }}
        pagination={pagination}
        searchPlaceholder="Search title, author, ISBN, or category..."
        setRefreshDataFunction={setRefreshDataFunction}
      />
    </Flex>
  );
}
