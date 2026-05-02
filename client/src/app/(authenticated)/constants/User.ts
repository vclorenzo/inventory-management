import { UserSetting } from "@/types/pages/User";

export const mockAccountSettings: UserSetting[] = [
  { label: "Username", value: "john_doe", type: "text" },
  { label: "Email", value: "john.doe@example.com", type: "text" },
];
export const mockChangePAsswordSettings: UserSetting[] = [
  { label: "Old Password", value: "", type: "text" },
  { label: "New Password", value: "", type: "text" },
  { label: "Confirm New Password", value: "", type: "text" },
];
export const mockProfileSettings: UserSetting[] = [
  { label: "Username", value: "john_doe", type: "text" },
  { label: "Email", value: "john.doe@example.com", type: "text" },
  { label: "Country", value: "Philippines", type: "text" },
  { label: "Region", value: "Metro Manila", type: "text" },
  { label: "City", value: "Pasig City", type: "text" },
];
export const mockPreferencesSettings: UserSetting[] = [
  {
    label: "Notification",
    value: true,
    type: "toggle",
  },

  {
    label: "Dark Mode",
    value: true,
    type: "toggle",
  },

  {
    label: "Language",
    value: "English",
    type: "text",
  },
];

export const breadcrumbItems = (productId: string) => {
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Products", href: "/products" },
    { label: productId },
  ];
};

export const roleOptions = [
  {
    value: "admin",
    label: "admin",
    disabled: false,
  },
  {
    value: "guest",
    label: "guest",
    disabled: false,
  },
  {
    value: "user",
    label: "user",
    disabled: false,
  },
];
