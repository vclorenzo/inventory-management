import { useAppSelector } from '@/app/redux';
import { setIsDarkMode } from '../state';

//FUNCTIONS
export const toggleDarkMode = (dispatch: any, isDarkMode: boolean) => {
	dispatch(setIsDarkMode(!isDarkMode));
};

//
export const useIsDarkModeVisible = () =>
	useAppSelector((state) => state.global.isDarkModeVisible);

export const useIsNotificationVisible = () =>
	useAppSelector((state) => state.global.isNotificationVisible);
