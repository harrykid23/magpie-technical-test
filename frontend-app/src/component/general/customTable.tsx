"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TextField,
  Flex,
  Box,
  Button,
  Select,
  Text,
  Card,
  Spinner,
} from "@radix-ui/themes";
import { TypePagination, TypeRequestGetTable } from "@shared/types.ts";
import { debounce } from "@/utils/generalUtils.ts";
import { useToast } from "./customToast.tsx";

export interface CustomTableColumn<TRowList extends any[]> {
  key: string;
  label: string;
  sortable?: boolean;
  orderByPath?: string | ((direction: "asc" | "desc") => any); // Custom orderBy structure
  valueByPath?: (row: TRowList[number]) => any; // Custom orderBy structure
}

interface CustomTableProps<TDataList extends any[]> {
  columns: CustomTableColumn<TDataList>[];
  fetchData: (params: TypeRequestGetTable) => void;
  pagination: TypePagination;
  data: TDataList;
  isLoading: boolean;
  searchPlaceholder?: string;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

const CustomTable = <TDataList extends any[]>({
  columns,
  fetchData,
  data,
  isLoading,
  pagination,
  searchPlaceholder,
}: CustomTableProps<TDataList>): React.ReactElement => {
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemPerPage, setItemPerPage] = useState(10);
  const { showToast } = useToast();

  // Fetch data when search, sort, or pagination changes
  useEffect(() => {
    const loadData = async () => {
      if (!fetchData) {
        return;
      }
      try {
        const orderBy = sortConfigs.map((config) => {
          const column = columns.find((col) => col.key === config.key);
          if (column?.orderByPath) {
            if (typeof column.orderByPath === "function") {
              return column.orderByPath(config.direction);
            } else {
              return {
                [column.orderByPath]: config.direction,
              };
            }
          }
          return {
            [config.key]: config.direction,
          };
        });

        fetchData({
          currentPage: currentPage,
          itemPerPage: itemPerPage,
          option: {
            search: searchTerm,
            orderBy,
          },
        });
        setPageInput(currentPage.toString());
      } catch (error) {
        if (error instanceof Error) {
          showToast("error", "Failed to fetch data: " + error.message);
        } else {
          showToast("error", "Failed to fetch data: Unknown error");
        }
      }
    };

    loadData();
  }, [searchTerm, sortConfigs, currentPage, itemPerPage]);

  // Handle sorting for a column
  const handleSort = (key: string) => {
    const existingConfigIndex = sortConfigs.findIndex(
      (config) => config.key === key
    );

    let newConfigs: SortConfig[] = [];

    if (existingConfigIndex === -1) {
      // If the column is not in the sort configs, add it with ascending order
      newConfigs = [...sortConfigs, { key, direction: "asc" }];
    } else {
      const existingConfig = sortConfigs[existingConfigIndex];
      if (existingConfig.direction === "asc") {
        // If the column is already sorted ascending, change to descending
        newConfigs = [
          ...sortConfigs.slice(0, existingConfigIndex),
          { key, direction: "desc" },
          ...sortConfigs.slice(existingConfigIndex + 1),
        ];
      } else {
        // If the column is sorted descending, remove it from the sort configs
        newConfigs = sortConfigs.filter((config) => config.key !== key);
      }
    }

    setSortConfigs(newConfigs);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemPerPage(Number(value));
    setCurrentPage(1); // Reset to the first page
  };

  // Pagination with input field
  const [pageInput, setPageInput] = useState<string>(currentPage.toString());

  // Handle input change
  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  // Handle page submission
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = parseInt(pageInput, 10);

    if (newPage >= 1 && newPage <= pagination.maxPage) {
      handlePageChange(newPage);
    } else {
      // Reset input to current page if the input is invalid
      setPageInput(currentPage.toString());
    }
  };

  // Debouncing search input
  const debounceSetInputField = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 700),
    []
  );
  const handleInputSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempSearchTerm(value);
    debounceSetInputField(value);
  };

  return (
    <Box>
      <Flex direction="column" gap="4">
        {/* Search Input */}
        <TextField.Root
          placeholder={searchPlaceholder || "Search..."}
          value={tempSearchTerm}
          onChange={handleInputSearchChange}
        ></TextField.Root>

        {/* Table */}
        <div className="w-full relative">
          {/* Show loading indicator overlay */}
          {isLoading && (
            <Flex
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: 1,
              }}
              width={"100%"}
              height={"100%"}
              align={"center"}
              justify={"center"}
            >
              <Card className="flex flex-row gap-2 items-center justify-center">
                <Flex
                  direction={"row"}
                  gap="2"
                  align={"center"}
                  justify={"center"}
                >
                  <Spinner size={"3"} />
                  <span>Loading...</span>
                </Flex>
              </Card>
            </Flex>
          )}
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell style={{ cursor: "default" }}>
                  No
                </Table.ColumnHeaderCell>
                {columns.map((column) => (
                  <Table.ColumnHeaderCell
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    style={{ cursor: column.sortable ? "pointer" : "default" }}
                  >
                    {column.label}
                    {sortConfigs.some(
                      (config) => config.key === column.key
                    ) && (
                      <span>
                        {sortConfigs.find((config) => config.key === column.key)
                          ?.direction === "asc"
                          ? " ▲"
                          : " ▼"}
                      </span>
                    )}
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            {/* Apply blur effect when isLoading is true */}
            <Table.Body style={{ filter: isLoading ? "blur(2px)" : "none" }}>
              {data.length ? (
                ((data as any[]) || []).map((row, rowIndex) => (
                  <Table.Row key={rowIndex}>
                    <Table.Cell>
                      {(currentPage - 1) * itemPerPage + rowIndex + 1}
                    </Table.Cell>
                    {columns.map((column) => (
                      <Table.Cell key={column.key}>
                        {column.valueByPath
                          ? column.valueByPath(row)
                          : row[column.key]}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell
                    colSpan={columns.length + 1}
                    className="text-center"
                  >
                    Data not found
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Root>
        </div>

        {/* Pagination */}
        <Flex justify="between" align="center">
          <Select.Root
            value={itemPerPage.toString()}
            onValueChange={handleItemsPerPageChange}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="10">10 per page</Select.Item>
              <Select.Item value="20">20 per page</Select.Item>
              <Select.Item value="50">50 per page</Select.Item>
            </Select.Content>
          </Select.Root>

          <Flex gap="2" align="center">
            <Button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>

            <form onSubmit={handlePageSubmit}>
              <Flex gap="2" align="center">
                <Text>Page</Text>
                <TextField.Root
                  type="number"
                  value={pageInput}
                  onChange={handleInputPageChange}
                  min={1}
                  max={pagination.maxPage}
                  className="w-10 text-center"
                />
                <Text>of {pagination.maxPage}</Text>
              </Flex>
            </form>

            <Button
              disabled={currentPage >= pagination.maxPage}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default CustomTable;
