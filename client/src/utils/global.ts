import { useAppSelector } from "@/state/redux";
import { setIsDarkMode } from "../state";

//FUNCTIONS
export const toggleDarkMode = (dispatch: any, isDarkMode: boolean) => {
  dispatch(setIsDarkMode(!isDarkMode));
};
