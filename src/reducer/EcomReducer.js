import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: { id: "", name: "", email: "", userImage: "", userType: "" },
  product: [],
  snackbar: { isOpen: false, message: "" },
  carts: [],
};

const EcomReducer = createSlice({
  name: "ecomStore",
  initialState,
  reducers: {
    UserData(state, action) {
      state.user = {
        id: action.payload.id,
        name: action.payload.name,
        email: action.payload.email,
        userImage: action.payload.userImage,
        userType: action.payload.userType,
      };
    },
    AddProductData(state, action) {
      state.product = action.payload;
    },
    Snackbarhandle(state, action) {
      state.snackbar = {
        isOpen: action.payload.isOpen,
        message: action.payload.message,
      };
    },

    AddCartData(state, { payload }) {
      const existingIndex = state.carts.findIndex(
        (item) => item.id === payload.cartManageData._id
      );
      const newCartItem = {
        id: payload.cartManageData._id,
        productName: payload.cartManageData.productName,
        productDescription: payload.cartManageData.productDescription,
        productPrice: payload.cartManageData.productPrice,
        productImages: payload.cartManageData.productImages,
        productQuantity: payload.quantity,
        totalProductQuantity: payload.cartManageData.productQuantity,
        productColor: payload.cartManageData.productColor,
      };

      if (existingIndex !== -1) {
        // Replace existing product
        state.carts[existingIndex] = newCartItem;
      } else {
        // Add product to carts
        state.carts.push(newCartItem);
      }
    },
    removeItemFromCart(state, action) {
      state.carts = state.carts.filter((cart) => cart.id !== action.payload);
    },
    ClearStore() {
      return initialState;
    },
  },
});

export const {
  UserData,
  AddProductData,
  GetProductDetails,
  Snackbarhandle,
  AddCartData,
  ClearStore,
  incrementQuantity,
  decrementQuantity,
  removeItemFromCart,
} = EcomReducer.actions;
export default EcomReducer.reducer;
