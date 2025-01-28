"use client";
import buildApiCaller from "@/hook/apiHook.ts";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TypeAPIBody } from "../../../../backend-app/utils/apiUtils.ts";
import {
  TypeResponseDashboardLendingPerMonth,
  TypeResponseDashboardMostPopularBook,
  TypeResponseDashboardMostPopularCategory,
} from "@shared/types.ts";
import { Card, Flex, Spinner, Text } from "@radix-ui/themes";
import CustomYearPicker from "@/component/general/customYearPicker.tsx";

export default function Dashboard() {
  // api caller
  const {
    result: dataTotalLendingsPerMonth,
    isLoading: isLoadingTotalLendingsPerMonth,
    fetchData: getTotalLendingsPerMonth,
  } = buildApiCaller<any, TypeAPIBody<TypeResponseDashboardLendingPerMonth>>(
    "/dashboard/totalLendingsPerMonth"
  );
  const {
    result: dataTopBookLending,
    isLoading: isLoadingTopBookLending,
    fetchData: getTopBookLending,
  } = buildApiCaller<any, TypeAPIBody<TypeResponseDashboardMostPopularBook>>(
    "/dashboard/topBookLending"
  );
  const {
    result: dataTopCategoryLending,
    isLoading: isLoadingTopCategoryLending,
    fetchData: getTopCategoryLending,
  } = buildApiCaller<
    any,
    TypeAPIBody<TypeResponseDashboardMostPopularCategory>
  >("/dashboard/topCategoryLending");

  // year picker
  const [year1, setYear1] = useState("");
  const [year2, setYear2] = useState("");
  const [year3, setYear3] = useState("");

  // on mounted page
  useEffect(() => {
    const initialDate = "2024";
    setYear1(initialDate);
    setYear2(initialDate);
    setYear3(initialDate);
  }, []);

  // on changed year
  useEffect(() => {
    if (year1) {
      getTotalLendingsPerMonth({
        method: "GET",
        queryParams: { year: year1 },
      });
    }
  }, [year1]);
  useEffect(() => {
    if (year2) {
      getTopBookLending({
        method: "GET",
        queryParams: { year: year2 },
      });
    }
  }, [year2]);
  useEffect(() => {
    if (year3) {
      getTopCategoryLending({
        method: "GET",
        queryParams: { year: year3 },
      });
    }
  }, [year3]);

  return (
    <Flex direction={"column"} className="w-full" gap="4">
      <Card
        size="3"
        className="w-full p-8 bg-white shadow-xl rounded-lg border border-blue-100 relative z-10"
      >
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Welcome to Library Management System
        </h2>
        <p className="text-gray-600">
          Quick check some insight based on the existing data in this page.
        </p>
      </Card>

      <Card
        size="3"
        className="w-full p-8 bg-white shadow-xl rounded-lg border border-blue-100 relative z-10"
      >
        <Flex direction={"column"} justify={"start"} align={"start"} gap="2">
          <Text size={"4"} weight={"bold"} align={"center"}>
            Total Lendings Per Month
          </Text>
          <Flex direction={"row"} gap={"3"} align={"center"} justify={"start"}>
            <Text size={"1"}>Data Year : </Text>
            <CustomYearPicker
              disabled={isLoadingTotalLendingsPerMonth}
              onYearChange={setYear1}
              year={year1}
            />
            {isLoadingTotalLendingsPerMonth ? <Spinner /> : null}
          </Flex>
          <ResponsiveContainer
            width="100%"
            height="100%"
            className="min-w-full min-h-80"
          >
            <LineChart
              data={dataTotalLendingsPerMonth?.data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="yearMonth" />
              <YAxis dataKey="count" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  padding: "10px",
                }}
                formatter={(value: number) => `${value} times`}
              />
              <Legend
                align="right"
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: "20px" }}
              />

              <Line
                type="monotone"
                dataKey="count"
                name="Lending Count"
                stroke="blue"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Flex>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          size="3"
          className="w-full p-8 bg-white shadow-xl rounded-lg border border-blue-100 relative z-10"
        >
          <Flex direction={"column"} justify={"start"} align={"start"} gap="2">
            <Text size={"4"} weight={"bold"} align={"center"}>
              Top Book Lending
            </Text>
            <Flex
              direction={"row"}
              gap={"3"}
              align={"center"}
              justify={"start"}
            >
              <Text size={"1"}>Data Year : </Text>
              <CustomYearPicker
                disabled={isLoadingTopBookLending}
                onYearChange={setYear2}
                year={year2}
              />
              {isLoadingTopBookLending ? <Spinner /> : null}
            </Flex>
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="min-w-full min-h-80"
            >
              <BarChart
                data={dataTopBookLending?.data}
                margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  interval={0}
                  dataKey="title"
                  type="category"
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                  formatter={(value: number) => `${value} times`}
                />
                <Legend
                  align="right"
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />

                <Bar
                  dataKey="count"
                  name="Lending Count"
                  fill="blue"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Flex>
        </Card>
        <Card
          size="3"
          className="w-full p-8 bg-white shadow-xl rounded-lg border border-blue-100 relative z-10"
        >
          <Flex direction={"column"} justify={"start"} align={"start"} gap="2">
            <Text size={"4"} weight={"bold"} align={"center"}>
              Top Category Lending
            </Text>
            <Flex
              direction={"row"}
              gap={"3"}
              align={"center"}
              justify={"start"}
            >
              <Text size={"1"}>Data Year : </Text>
              <CustomYearPicker
                disabled={isLoadingTopCategoryLending}
                onYearChange={setYear3}
                year={year3}
              />
              {isLoadingTopCategoryLending ? <Spinner /> : null}
            </Flex>
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="min-w-full min-h-80"
            >
              <BarChart
                data={dataTopCategoryLending?.data}
                margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  interval={0}
                  dataKey="name"
                  type="category"
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "10px",
                  }}
                  formatter={(value: number) => `${value} times`}
                />
                <Legend
                  align="right"
                  verticalAlign="top"
                  wrapperStyle={{ paddingBottom: "20px" }}
                />

                <Bar
                  dataKey="count"
                  name="Lending Count"
                  fill="blue"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Flex>
        </Card>
      </div>
    </Flex>
  );
}
