import { ReusableFieldConfig } from "@/types/components/ReactHookForm";
import React from "react";
import type {
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormReturn,
} from "react-hook-form";

type Props<TFormValues extends FieldValues> = {
  form: UseFormReturn<TFormValues>;
  fields: ReusableFieldConfig<TFormValues>[];
  onSubmit: (values: TFormValues) => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  className?: string;
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
}: Props<TFormValues>) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <form
      className={className ?? "flex flex-col gap-3"}
      onSubmit={handleSubmit(onSubmit)}
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
            className={
              field.className ?? "flex flex-row justify-start items-center"
            }
          >
            <label htmlFor={field.name} className="min-w-[200px]">
              {field.label}
            </label>

            <div className="flex flex-col min-w-[336px]">
              {field.type === "select" ? (
                (() => {
                  const selectRegister = register(field.name, field.rules);

                  return (
                    <select
                      id={field.name}
                      disabled={field.disabled}
                      {...selectRegister}
                      onChange={(e) => {
                        selectRegister.onChange(e);
                        field.onChange?.(e);
                      }}
                      className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-400 shadow-sm focus:shadow-md appearance-none cursor-pointer"
                    >
                      <option value="">{field.placeholder ?? "Select"}</option>
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
    </form>
  );
};

export default ReactHookForm;
