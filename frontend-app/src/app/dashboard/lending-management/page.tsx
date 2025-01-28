"use client";

import CustomTable, {
  CustomTableColumn,
} from "@/component/general/customTable.tsx";
import buildApiCaller from "@/hook/apiHook.ts";
import { Button, Flex, Text } from "@radix-ui/themes";
import {
  TypePagination,
  TypeRequestGetTable,
  TypeResponseGetLendingList,
} from "@shared/types.ts";
import { TypeAPIBody } from "../../../../../backend-app/utils/apiUtils.ts";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store.ts";
import { PERMISSION_NAME } from "@shared/constants.ts";
import { CheckCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { useToast } from "@/component/general/customToast.tsx";
import { dateToString } from "@/utils/generalUtils.ts";
import ReturnLendingModal from "@/component/lending-management/returnLendingModal.tsx";
import DeleteLendingModal from "@/component/lending-management/deleteLendingModal.tsx";
import AddLendingButton from "@/component/lending-management/addLendingButton.tsx";

export default function Dashboard() {
  // table data
  const session = useSelector((state: RootState) => state.session.session);
  const userPermissionSet = new Set(
    session?.role.mapRolePermissions.map(
      (mapRolePermission) => mapRolePermission.permission.name
    ) || []
  );

  const columns: CustomTableColumn<TypeResponseGetLendingList>[] = [
    {
      key: "createdAt",
      label: "Date Borrow",
      sortable: true,
      orderByPath: "createdAt",
      valueByPath(row) {
        return dateToString(row.createdAt);
      },
    },
    {
      key: "member",
      label: "Member",
      sortable: true,
      orderByPath: (dir) => ({
        member: {
          name: dir,
        },
      }),
      valueByPath(row) {
        return (
          <Flex direction={"column"} gap="1">
            <Text size={"2"} weight={"bold"}>
              {row.member.name}
            </Text>
            <Text size={"1"} weight={"medium"}>
              Email : {row.member.email}
            </Text>
            <Text size={"1"} weight={"medium"}>
              Phone : {row.member.phone}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "book",
      label: "Book",
      sortable: true,
      orderByPath: (dir) => ({
        book: {
          title: dir,
        },
      }),
      valueByPath(row) {
        return (
          <Flex direction={"column"} gap="1">
            <Text size={"2"} weight={"bold"}>
              {row.book.title}
            </Text>
            <Text size={"1"} weight={"medium"}>
              ISBN : {row.book.isbn}
            </Text>
            <Text size={"1"} weight={"medium"}>
              Author : {row.book.author}
            </Text>
          </Flex>
        );
      },
    },

    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      orderByPath: "dueDate",
      valueByPath(row) {
        return dateToString(row.dueDate);
      },
    },
    {
      key: "returnDate",
      label: "Return Date",
      sortable: true,
      orderByPath: "returnDate",
      valueByPath(row) {
        const currentDate = new Date().toISOString();
        const isLate = row.returnDate
          ? row.returnDate > row.dueDate
          : currentDate > (row.dueDate as string);

        return isLate ? (
          <Text color="red">
            {row.returnDate ? dateToString(row.returnDate) : "Not Returned"}
          </Text>
        ) : (
          <Text color="green">
            {row.returnDate ? dateToString(row.returnDate) : "Not Returned"}
          </Text>
        );
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
            {userPermissionSet.has(PERMISSION_NAME.update_lending) ? (
              <Button
                color="green"
                className="enabled:hover:bg-green-700 transition-al duration-300l"
                onClick={() => {
                  setSelectedLendingData(row);
                  setIsModalReturnLendingOpen(true);
                }}
                title="Return Lending"
                disabled={!!row.returnDate}
              >
                <CheckCircledIcon color="white" />
              </Button>
            ) : null}
            {userPermissionSet.has(PERMISSION_NAME.delete_lending) ? (
              <Button
                color="red"
                className="hover:bg-red-600 transition-all duration-300"
                onClick={() => {
                  setSelectedLendingData(row);
                  setIsModalDeleteLendingOpen(true);
                }}
                title="Delete Lending"
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
    isLoading: isLoadingLendingList,
    result: resultLendingList,
    fetchData: getLendingList,
  } = buildApiCaller<
    TypeRequestGetTable,
    TypeAPIBody<TypeResponseGetLendingList>
  >("/lending");

  const [pagination, setPagination] = useState<TypePagination>({
    currentPage: 1,
    maxPage: 1,
    itemPerPage: 10,
  });
  const [refreshDataFunction, setRefreshDataFunction] = useState<
    (() => void) | null
  >(null);

  const { showToast } = useToast();

  // return lending functions
  const [selectedLendingData, setSelectedLendingData] = useState<
    TypeResponseGetLendingList[number] | null
  >(null);
  const [isModalReturnLendingOpen, setIsModalReturnLendingOpen] =
    useState(false);

  // delete lending functions
  const [isModalDeleteLendingOpen, setIsModalDeleteLendingOpen] =
    useState(false);
  return (
    <Flex
      className="bg-white p-6 rounded-lg shadow-md"
      direction="column"
      gap="3"
    >
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        Lending Management
      </h2>
      <Flex direction={"row"} justify="end" width={"100%"}>
        <AddLendingButton refreshTable={refreshDataFunction} />
      </Flex>
      <CustomTable<TypeResponseGetLendingList>
        data={resultLendingList?.data || []}
        isLoading={isLoadingLendingList}
        columns={columns}
        fetchData={(body) => {
          getLendingList({
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
        searchPlaceholder="Search title, author, ISBN, member name, or member email..."
        setRefreshDataFunction={setRefreshDataFunction}
      />
      {userPermissionSet.has(PERMISSION_NAME.update_lending) ? (
        <ReturnLendingModal
          refreshTable={refreshDataFunction}
          lendingData={selectedLendingData}
          isModalOpen={isModalReturnLendingOpen}
          setIsModalOpen={setIsModalReturnLendingOpen}
        />
      ) : null}
      {userPermissionSet.has(PERMISSION_NAME.delete_lending) ? (
        <DeleteLendingModal
          refreshTable={refreshDataFunction}
          lendingData={selectedLendingData}
          isModalOpen={isModalDeleteLendingOpen}
          setIsModalOpen={setIsModalDeleteLendingOpen}
        />
      ) : null}
    </Flex>
  );
}
