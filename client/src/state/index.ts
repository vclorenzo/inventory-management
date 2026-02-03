import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InitialStateTypes {
	isSidebarCollapsed: boolean;
	isDropdownExpanded: boolean;
	isDarkMode: boolean;
	isNotificationVisible: boolean;
	isDarkModeVisible: boolean;
}

const initialState: InitialStateTypes = {
	isSidebarCollapsed: false,
	isDropdownExpanded: false,
	isDarkMode: false,
	isNotificationVisible: true,
	isDarkModeVisible: true,
};

export const globalSlice = createSlice({
	name: 'global',
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
		setIsNotificationVisible: (state, action: PayloadAction<boolean>) => {
			state.isNotificationVisible = action.payload;
		},
		setIsDarkModeVisible: (state, action: PayloadAction<boolean>) => {
			state.isDarkModeVisible = action.payload;
		},
	},
});

export const {
	setIsSidebarCollapsed,
	setIsDropdownExpanded,
	setIsDarkMode,
	setIsNotificationVisible,
	setIsDarkModeVisible,
} = globalSlice.actions;

export default globalSlice.reducer;
