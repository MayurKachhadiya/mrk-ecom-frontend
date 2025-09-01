
import { configureStore } from "@reduxjs/toolkit";
import EcomReducer from "../reducer/EcomReducer";

export const store = configureStore({
  reducer: {
    ecomStore: EcomReducer,
  }
});