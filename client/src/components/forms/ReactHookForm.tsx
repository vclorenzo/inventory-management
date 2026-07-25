import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import { ChevronDown } from "lucide-react";
import React, { ReactNode } from "react";
import type {
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";
import Link from "next/link";

type Props<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>;
  fields: ReusableFieldConfig<TFormValues>[];
  onSubmit: (values: TFormValues) => void | Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  link?: string;
  linkText?: string;
  children?: ReactNode;
  renderAs?: "form" | "div";
  showSubmit?: boolean;
};

function getErrorMessage(err: unknown) {
  if (!err || typeof err !== "object") return undefined;
  // react-hook-form error has: { message?: string }
  const message = (err as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

const ReactHookForm = <TFormValues extends FieldValues>({
  form,
  fields,
  onSubmit,
  submitLabel = "Save",
  isSubmitting,
  className,
  link,
  linkText,
  children,
  renderAs = "form",
  showSubmit = true,
}: Props<TFormValues>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const Wrapper = renderAs === "form" ? "form" : "div";

  return (
    <Wrapper
      className={className ?? "flex flex-col gap-3"}
      {...(renderAs === "form"
        ? { onSubmit: handleSubmit(onSubmit) }
        : {})}
    >
      {fields.map((field) => {
        const fieldError = getErrorMessage(errors[field.name]);

        if (field.type === "checkbox") {
          const checkboxRegister = register(field.name, field.rules);

          return (
            <div
              key={field.name}
              className={field.className ?? "flex flex-row items-center gap-3"}
            >
              <input
                id={field.name}
                type="checkbox"
                disabled={field.disabled}
                {...checkboxRegister}
                onChange={(e) => {
                  checkboxRegister.onChange(e);
                  field.onChange?.(e);
                }}
                className="h-4 w-4"
              />
              <label htmlFor={field.name} className="text-sm text-gray-700">
                {field.label}
              </label>
              {fieldError ? (
                <div className="text-sm text-red-600">{fieldError}</div>
              ) : null}
            </div>
          );
        }

        return (
          <div
            key={field.name}
            className={field.className ?? "justify-start items-center"}
          >
            <label htmlFor={field.name} className="min-w-[200px] font-bold">
              {field.label}
            </label>

            <div className="flex flex-col min-w-[336px]">
              {field.type === "select" ? (
                (() => {
                  const selectRegister = register(field.name, field.rules);

                  return (
                    <div className="relative w-full">
                      <select
                        id={field.name}
                        disabled={field.disabled}
                        {...selectRegister}
                        onChange={(e) => {
                          selectRegister.onChange(e);
                          field.onChange?.(e);
                        }}
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-9 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                      >
                        <option value="">
                          {field.placeholder ?? "Select"}
                        </option>
                        {field.options?.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={opt.disabled}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                        aria-hidden
                      />
                    </div>
                  );
                })()
              ) : field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  {...register(field.name, field.rules)}
                  className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                  rows={4}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  disabled={field.disabled}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  {...register(field.name, field.rules)}
                  className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
                />
              )}

              {fieldError ? (
                <div className="mt-1 text-sm text-red-600">{fieldError}</div>
              ) : null}
            </div>
          </div>
        );
      })}

      {children}

      {showSubmit ? (
        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-2 px-4 py-2 rounded w-[150px] h-[50px] ${
            isSubmitting
              ? "bg-blue-300 text-white cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-700"
          }`}
        >
          {submitLabel}
        </button>
      ) : null}
      {link && linkText && (
        <p className="text-xs text-gray-500">
          {linkText}{" "}
          <Link className="text-blue-600 hover:underline" href={`${link}`}>
            here
          </Link>
        </p>
      )}
    </Wrapper>
  );
};

export default ReactHookForm;
