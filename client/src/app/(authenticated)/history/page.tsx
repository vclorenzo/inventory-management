"use client";
import Header from "@/components/Header";
import ProductsCatalog from "@/components/ProductsCatalog";
import Reviews from "@/components/Reviews";
import Tabs from "@/components/Tabs";
import { useGetExpensesByCategoryQuery } from "@/state/internal/expensesApi";
import { ExpenseByCategorySummary } from "@/types/pages/DashboardMetrics";
import { AggregatedData, AggregatedDataItem } from "@/types/pages/Expenses";
import { CircularProgress } from "@mui/material";
import React, { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Props = {};

const History = (props: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery();

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const amount = parseInt(data.amount);
        if (!acc[data.category]) {
          acc[data.category] = { name: data.category, amount: 0 };
          acc[data.category].color = `#${Math.floor(
            Math.random() * 16777215,
          ).toString(16)}`;
          acc[data.category].amount += amount;
        }
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate]);

  const classNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !expensesData) {
    return (
      <div className="text-center text-red-500 py-4">
        Failed to fetch expenses
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <Header name="History" />
        <Tabs
          tabs={[
            {
              label: "Bids",
              content: (
                <>
                  {/* {isLoading ? (
                    <>
                      <CircularProgress />
                    </>
                  ) : (
                    <ProductsCatalog />
                  )} */}
                </>
              ),
            },
            {
              label: "Purchases",
              content: (
                <></>
                // <div className={`filter-panel mb-24`}>
                //   {/* <Reviews reviews={[]} userId={""} /> */}
                // </div>
              ),
            },
          ]}
        />
        <p className="text-sm text-gray-500">
          A visual representation of expenses over time.
        </p>
      </div>
      {/* FILTERS */}
      {/* // HERE */}
    </div>
  );
};

export default History;
