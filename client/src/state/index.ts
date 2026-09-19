import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isDropdownExpanded: boolean;
  isDarkMode: boolean;
  isNotificationBubbleEnabled: boolean;
}

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isDropdownExpanded: false,
  isDarkMode: false,
  isNotificationBubbleEnabled: true,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDropdownExpanded: (state, action: PayloadAction<boolean>) => {
      state.isDropdownExpanded = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setIsNotificationBubbleEnabled: (state, action: PayloadAction<boolean>) => {
      state.isNotificationBubbleEnabled = action.payload;
    },
  },
});

export const {
  setIsSidebarCollapsed,
  setIsDropdownExpanded,
  setIsDarkMode,
  setIsNotificationBubbleEnabled,
} = globalSlice.actions;

export default globalSlice.reducer;
