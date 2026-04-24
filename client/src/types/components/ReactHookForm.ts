import { FieldPath, FieldValues, RegisterOptions } from "react-hook-form";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ReusableFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "date"
  | "textarea"
  | "select"
  | "checkbox";

export type ReusableFieldConfig<TFormValues extends FieldValues> = {
  name: FieldPath<TFormValues>;
  label: string;
  type: ReusableFieldType;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  options?: SelectOption[];
  rules?: RegisterOptions<TFormValues, FieldPath<TFormValues>>;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  className?: string;
};
