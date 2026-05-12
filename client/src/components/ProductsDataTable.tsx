"use client";

import { Product } from "@/types/pages/Products";
import { useDeleteProductMutation } from "@/state/internal/productsApi";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type ProductTableSortKey =
  | "productId"
  | "name"
  | "productCategory"
  | "brand"
  | "condition"
  | "price"
  | "rating"
  | "stockQuantity"
  | "status"
  | "description";

type SortDir = "asc" | "desc";

type PageSizeOption = 5 | 10 | 15;

const PAGE_SIZE_OPTIONS: PageSizeOption[] = [5, 10, 15];

const COLUMNS: {
  key: ProductTableSortKey;
  label: string;
  align?: "right";
}[] = [
  { key: "name", label: "Name" },
  { key: "productCategory", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "condition", label: "Condition" },
  { key: "price", label: "Price", align: "right" },
  { key: "rating", label: "Rating", align: "right" },
  { key: "stockQuantity", label: "Stock", align: "right" },
  { key: "status", label: "Status" },
  { key: "description", label: "Description" },
];

function getSortValue(p: Product, key: ProductTableSortKey): string | number {
  switch (key) {
    case "price":
    case "rating":
    case "stockQuantity":
      return p[key];
    default:
      return String(p[key] ?? "");
  }
}

function compareProducts(
  a: Product,
  b: Product,
  key: ProductTableSortKey,
  dir: SortDir,
): number {
  const va = getSortValue(a, key);
  const vb = getSortValue(b, key);
  const mult = dir === "asc" ? 1 : -1;
  if (typeof va === "number" && typeof vb === "number") {
    if (va !== vb) return (va - vb) * mult;
  } else {
    const cmp = String(va).localeCompare(String(vb), undefined, {
      sensitivity: "base",
    });
    if (cmp !== 0) return cmp * mult;
  }
  return a.productId.localeCompare(b.productId);
}

/** Matches product detail page status chips for consistency. */
function statusTone(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "available") {
    return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  }
  if (normalized === "unavailable") {
    return "bg-rose-50 text-rose-800 ring-rose-200";
  }
  if (normalized === "unlisted") {
    return "bg-slate-50 text-slate-700 ring-slate-200";
  }
  return "bg-gray-50 text-gray-800 ring-gray-200";
}

export type ProductsDataTableProps = {
  products: Product[];
};

export function ProductsDataTable({ products }: ProductsDataTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSizeOption>(5);
  const [sortKey, setSortKey] = useState<ProductTableSortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [deleteProduct, { isLoading: isDeleteLoading }] =
    useDeleteProductMutation();

  const sorted = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => compareProducts(a, b, sortKey, sortDir));
    return copy;
  }, [products, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  function handleSortClick(key: ProductTableSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handlePageSizeChange(next: PageSizeOption) {
    setPageSize(next);
    setPage(1);
  }

  function ariaSortFor(
    key: ProductTableSortKey,
  ): "ascending" | "descending" | "none" {
    if (key !== sortKey) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  async function handleDeleteRow(p: Product) {
    const ok = window.confirm(`Delete "${p.name}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteProduct(p.productId).unwrap();
    } catch {
      window.alert("Could not delete this product. Please try again.");
    }
  }

  return (
    <div className="mt-5">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`whitespace-nowrap px-3 py-3 font-semibold text-gray-900 ${
                      col.align === "right" ? "text-right" : ""
                    }`}
                    aria-sort={ariaSortFor(col.key)}
                  >
                    <button
                      type="button"
                      className={`inline-flex w-full items-center gap-1 rounded px-1 py-0.5 text-left font-semibold text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        col.align === "right" ? "justify-end text-right" : ""
                      }`}
                      onClick={() => handleSortClick(col.key)}
                    >
                      <span>{col.label}</span>
                      <span className="inline-flex shrink-0 flex-col leading-none">
                        <ChevronUp
                          className={`h-3 w-3 ${
                            sortKey === col.key && sortDir === "asc"
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                          aria-hidden
                        />
                        <ChevronDown
                          className={`-mt-1 h-3 w-3 ${
                            sortKey === col.key && sortDir === "desc"
                              ? "text-blue-600"
                              : "text-gray-300"
                          }`}
                          aria-hidden
                        />
                      </span>
                    </button>
                  </th>
                ))}
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-3 text-right text-sm font-semibold text-gray-900"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={COLUMNS.length + 1}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    No products to display.
                  </td>
                </tr>
              ) : (
                pageItems.map((p, i) => (
                  <tr
                    key={p.productId}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50/80"}
                  >
                    <td className="max-w-[10rem] truncate px-3 py-2 text-gray-800">
                      {p.name}
                    </td>
                    <td className="max-w-[8rem] truncate px-3 py-2 text-gray-800">
                      {p.productCategory}
                    </td>
                    <td className="max-w-[8rem] truncate px-3 py-2 text-gray-800">
                      {p.brand}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-gray-800">
                      {p.condition}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-800">
                      {p.price}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-800">
                      {p.rating}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums text-gray-800">
                      {p.stockQuantity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`inline-flex max-w-full items-center truncate rounded-full px-3 py-1 text-xs font-medium ring-1 ${statusTone(
                          p.status,
                        )}`}
                        title={p.status}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td
                      className="max-w-xs truncate px-3 py-2 text-gray-700"
                      title={p.description}
                    >
                      {p.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">
                      <div className="inline-flex items-center justify-end gap-1">
                        <Link
                          href={`/products/${p.productId}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                          aria-label={`Edit ${p.name}`}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </Link>
                        <button
                          type="button"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-40"
                          aria-label={`Delete ${p.name}`}
                          title="Delete"
                          disabled={isDeleteLoading}
                          onClick={() => void handleDeleteRow(p)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MUI DataGrid / TablePagination-style footer toolbar */}
        <div
          className="flex min-h-[52px] flex-wrap items-center justify-end gap-x-4 gap-y-2 border-t border-gray-200 px-2 py-2 sm:gap-x-6 sm:px-3"
          role="toolbar"
          aria-label="Table pagination"
        >
          <div className="flex shrink-0 items-center gap-2 text-sm text-gray-700">
            <span id="inventory-page-size-label" className="whitespace-nowrap">
              Rows per page:
            </span>
            <select
              id="inventory-page-size"
              aria-labelledby="inventory-page-size-label"
              className="min-w-[4ch] cursor-pointer appearance-none rounded border-0 bg-transparent py-1 pl-0 pr-6 text-sm text-gray-900 underline decoration-gray-300 decoration-1 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0 center",
              }}
              value={pageSize}
              onChange={(e) =>
                handlePageSizeChange(Number(e.target.value) as PageSizeOption)
              }
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <p className="shrink-0 whitespace-nowrap text-sm tabular-nums text-gray-700">
            {rangeStart}–{rangeEnd} of {total}
          </p>

          <div className="flex shrink-0 items-center">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-30"
              disabled={page <= 1}
              aria-label="Previous page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-30"
              disabled={page >= totalPages}
              aria-label="Next page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
