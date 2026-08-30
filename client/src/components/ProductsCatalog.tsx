"use client";
import Cards from "@/components/Cards";
import Header from "@/components/Header";
import { useGetAuctionsQuery } from "@/state/internal/auctionsApi";
import { useGetProductsQuery } from "@/state/internal/productsApi";
import { ProductQueryParams } from "@/state/internal/productsApi";
import { Auction } from "@/types/pages/Auctions";
import { Product } from "@/types/pages/Products";
import { CircularProgress } from "@mui/material";
import { SearchIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useMe } from "@/hooks/useMe";

export type CatalogSource = "marketplace" | "auctions";

type Props = {
  userId?: string;
  excludeUserId?: string;
  source?: CatalogSource;
  heading?: string;
};

type CatalogItem = Product | Auction;

type SortPreset = "recent" | "price_high" | "price_low";

/** Unique values from API products plus any active selections (sorted). */
function uniqueSortedFromProducts(
  products: CatalogItem[],
  selectedValues: string[],
  pick: (p: CatalogItem) => string | undefined,
): string[] {
  const set = new Set<string>();
  for (const s of selectedValues) {
    const t = s.trim();
    if (t) set.add(t);
  }
  for (const p of products) {
    const t = pick(p)?.trim();
    if (t) set.add(t);
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
}

type FacetField = "condition" | "status" | "productCategory" | "brand";

/**
 * Facet options that only grow across refetches, so filtering / loading
 * empty results does not wipe checkboxes from the panel.
 */
function useAccumulatedFacetOptions(
  products: CatalogItem[],
  selectedValues: string[],
  field: FacetField,
): string[] {
  const knownRef = useRef<string[]>([]);
  return useMemo(() => {
    const next = uniqueSortedFromProducts(
      products,
      [...knownRef.current, ...selectedValues],
      (p) => p[field],
    );
    knownRef.current = next;
    return next;
  }, [products, selectedValues, field]);
}

function normFilterList(values: string[]): string[] {
  return Array.from(new Set(values.map((s) => s.trim()).filter(Boolean)));
}

function toggleString(list: string[], value: string, on: boolean): string[] {
  if (on) return list.includes(value) ? list : [...list, value];
  return list.filter((v) => v !== value);
}

type FilterCheckboxSectionProps = {
  legend: string;
  options: { label: string; value: string }[];
  selected: string[];
  onSelectedChange: (next: string[]) => void;
  emptyHint?: string;
};

function FilterCheckboxSection({
  legend,
  options,
  selected,
  onSelectedChange,
  emptyHint = "No values match yet.",
}: FilterCheckboxSectionProps) {
  const optionValues = options.map((o) => o.value);
  const allSelected =
    optionValues.length > 0 && optionValues.every((v) => selected.includes(v));

  return (
    <fieldset className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <legend className="form-section-label shrink-0">{legend}</legend>
        {options.length > 0 ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-x-2 gap-y-0.5 text-xs">
            <button
              type="button"
              className="text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              disabled={allSelected}
              onClick={() => {
                onSelectedChange(
                  normFilterList([...selected, ...optionValues]),
                );
              }}
            >
              All
            </button>
            <button
              type="button"
              className="text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
              disabled={!optionValues.some((v) => selected.includes(v))}
              onClick={() => {
                onSelectedChange(
                  selected.filter((s) => !optionValues.includes(s)),
                );
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border border-gray-200 bg-white p-2">
        {options.length === 0 ? (
          <p className="text-xs text-gray-400">{emptyHint}</p>
        ) : (
          options.map(({ label, value }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-800"
            >
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selected.includes(value)}
                onChange={(e) => {
                  onSelectedChange(
                    toggleString(selected, value, e.target.checked),
                  );
                }}
              />
              <span>{label}</span>
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

const ProductsCatalog = ({
  userId: userIdProp,
  excludeUserId,
  source,
  heading = "Products",
}: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [conditionFilters, setConditionFilters] = useState<string[]>([]);
  const [sortPreset, setSortPreset] = useState<SortPreset>("recent");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { me } = useMe();
  const fieldId = source ?? "catalog";
  const isPublicCatalog = source === "marketplace" || source === "auctions";
  const userId = isPublicCatalog
    ? userIdProp ?? ""
    : userIdProp ?? me?.data.userId ?? "";

  const queryParams = useMemo(() => {
    const sortBy: ProductQueryParams["sortBy"] =
      sortPreset === "recent" ? "relevance" : "price";
    const sortOrder: ProductQueryParams["sortOrder"] =
      sortPreset === "price_low" ? "asc" : "desc";

    const categories = normFilterList(categoryFilters);
    const brands = normFilterList(brandFilters);
    const statuses = normFilterList(statusFilters);
    const conditions = normFilterList(conditionFilters);

    const params: ProductQueryParams = {
      search: searchTerm,
      userId: userId || undefined,
      excludeUserId: excludeUserId || undefined,
      category: categories.length ? categories : undefined,
      brand: brands.length ? brands : undefined,
      status:
        isPublicCatalog
          ? undefined
          : statuses.length
            ? statuses
            : undefined,
      condition: conditions.length ? conditions : undefined,
      sortBy,
      sortOrder,
      marketplace: source === "marketplace",
      listed: source === "auctions",
    };

    if (minPrice.trim()) {
      const parsed = Number(minPrice);
      if (!Number.isNaN(parsed)) {
        params.minPrice = parsed;
      }
    }

    if (maxPrice.trim()) {
      const parsed = Number(maxPrice);
      if (!Number.isNaN(parsed)) {
        params.maxPrice = parsed;
      }
    }

    return params;
  }, [
    brandFilters,
    categoryFilters,
    conditionFilters,
    excludeUserId,
    maxPrice,
    minPrice,
    searchTerm,
    sortPreset,
    statusFilters,
    source,
    userId,
  ]);

  const isAuctions = source === "auctions";
  const productsQuery = useGetProductsQuery(queryParams, {
    skip: isAuctions,
  });
  const auctionsQuery = useGetAuctionsQuery(queryParams, {
    skip: !isAuctions,
  });
  const products = isAuctions
    ? (auctionsQuery.data ?? [])
    : (productsQuery.data ?? []);
  const isGetProductsLoading = isAuctions
    ? auctionsQuery.isLoading
    : productsQuery.isLoading;
  const isGetProductsFetching = isAuctions
    ? auctionsQuery.isFetching
    : productsQuery.isFetching;
  const hasGetProductsError = isAuctions
    ? auctionsQuery.isError
    : productsQuery.isError;

  const conditionOptions = useAccumulatedFacetOptions(
    products,
    conditionFilters,
    "condition",
  );
  const statusOptions = useAccumulatedFacetOptions(
    products,
    statusFilters,
    "status",
  );
  const categoryOptions = useAccumulatedFacetOptions(
    products,
    categoryFilters,
    "productCategory",
  );
  const brandOptions = useAccumulatedFacetOptions(
    products,
    brandFilters,
    "brand",
  );

  const showProductsLoading =
    isGetProductsLoading || (isGetProductsFetching && products.length === 0);

  return (
    <div className="mx-auto w-full pb-5">
      <div className="filter-panel mb-6">
        <label className="form-section-label" htmlFor={`${fieldId}-search`}>
          Search
        </label>
        <div className="relative mt-2">
          <SearchIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            id={`${fieldId}-search`}
            type="search"
            enterKeyHint="search"
            className="form-control placeholder:text-gray-400 py-2.5 pl-9"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-[300px] filter-panel">
          <div className="space-y-5">
            <div>
              <label className="form-section-label" htmlFor={`${fieldId}-sort`}>
                Sort
              </label>
              <select
                id={`${fieldId}-sort`}
                className="form-control mt-2"
                value={sortPreset}
                onChange={(e) => {
                  setSortPreset(e.target.value as SortPreset);
                }}
              >
                <option value="recent">Recent</option>
                <option value="price_high">Price — High to Low</option>
                <option value="price_low">Price — Low to High</option>
              </select>
            </div>
            <FilterCheckboxSection
              legend="Item condition"
              options={conditionOptions.map((value) => ({
                label: value,
                value,
              }))}
              selected={conditionFilters}
              onSelectedChange={setConditionFilters}
              emptyHint="Load products to see conditions."
            />
            {isPublicCatalog ? null : (
              <FilterCheckboxSection
                legend="Listing status"
                options={statusOptions.map((value) => ({
                  label: value,
                  value,
                }))}
                selected={statusFilters}
                onSelectedChange={setStatusFilters}
                emptyHint="Load products to see statuses."
              />
            )}
            <div>
              <p className="form-section-label">Price</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  className="form-control placeholder:text-gray-400"
                  placeholder="Min"
                  aria-label="Minimum price"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                  }}
                />
                <input
                  type="number"
                  min={0}
                  className="form-control placeholder:text-gray-400"
                  placeholder="Max"
                  aria-label="Maximum price"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                  }}
                />
              </div>
            </div>
            <FilterCheckboxSection
              legend="Category"
              options={categoryOptions.map((value) => ({
                label: value,
                value,
              }))}
              selected={categoryFilters}
              onSelectedChange={setCategoryFilters}
              emptyHint="Load products to see categories."
            />
            <FilterCheckboxSection
              legend="Brand"
              options={brandOptions.map((value) => ({ label: value, value }))}
              selected={brandFilters}
              onSelectedChange={setBrandFilters}
              emptyHint="Load products to see brands."
            />
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-6">
            <Header name={heading} />
          </div>
          {/* PRODUCTS LIST */}
          <div className="grid grid-cols-1 justify-between gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hasGetProductsError ? (
              <div className="col-span-full text-center text-red-500 py-4">
                Failed to fetch products
              </div>
            ) : showProductsLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <CircularProgress />
              </div>
            ) : (
              <Cards
                products={products}
                hrefBase={
                  source === "auctions"
                    ? "auctions"
                    : source === "marketplace"
                      ? "marketplace"
                      : "products"
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsCatalog;
