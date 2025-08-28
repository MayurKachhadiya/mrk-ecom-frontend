import {
  Box,
  Button,
  CardMedia,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "./NavBar";
import { removeItemFromCart, Snackbarhandle } from "../reducer/EcomReducer";
import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const CartDetails = () => {
  const navigate = useNavigate();
  const [carts, setCarts] = useState();
  const [loading, setLoading] = useState();
  const dispatch = useDispatch();

  useEffect(() => {
    const UserDataToken = localStorage.getItem("user-token");
    let resUserData;
    if (UserDataToken) {
      resUserData = jwtDecode(UserDataToken);
    }
    axios
      .get(`https://mrk-com-backend.onrender.com/cart/details/${resUserData.id}`, {
        headers: {
          Authorization: `Bearer ${UserDataToken}`,
        },
      })
      .then((res) => {
        const { cart } = jwtDecode(res.data.token);
        setCarts(cart);
        setLoading(false);
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({
            isOpen: true,
            message: err.response?.data?.message || "Something went wrong",
          })
        );
        if (err.response?.data?.message === "Invalid token") {
          localStorage.removeItem("user-token");
          navigate("/signin");
        }
      });
  }, []);

  const AddToCart = (newQty, pid) => {
    const UserDataToken = localStorage.getItem("user-token");
    let resUserData;
    if (UserDataToken) {
      resUserData = jwtDecode(UserDataToken);
    }
    axios
      .post(
        "https://mrk-com-backend.onrender.com/cart/add",
        {
          UserId: resUserData.id,
          ProductId: pid,
          quantity: newQty,
        },
        {
          headers: {
            Authorization: `Bearer ${UserDataToken}`,
          },
        }
      )
      .then((res) => {
        const updatedcarts = carts.map((citem) => {
          const match = res.data.cart.items.find(
            (item) => item.product === citem.product._id
          );
          return {
            ...citem,
            quantity: match ? match.quantity : citem.quantity,
          };
        });
        setCarts(updatedcarts);
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({
            isOpen: true,
            message: err.response?.data?.message || "Something went wrong",
          })
        );
        if (err.response?.data?.message === "Invalid token") {
          localStorage.removeItem("user-token");
          navigate("/signin");
        }
      });
  };

  const deleteCart = (pid) => {
    const UserDataToken = localStorage.getItem("user-token");
    let resUserData;
    if (UserDataToken) {
      resUserData = jwtDecode(UserDataToken);
    }
    axios
      .post(
        "https://mrk-com-backend.onrender.com/cart/delete",
        {
          UserId: resUserData.id,
          ProductId: pid,
        },
        {
          headers: {
            Authorization: `Bearer ${UserDataToken}`,
          },
        }
      )
      .then((res) => {
        const { productDetails } = jwtDecode(res.data.token);
        setCarts(productDetails);
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({
            isOpen: true,
            message: err.response?.data?.message || "Something went wrong",
          })
        );
        if (err.response?.data?.message === "Invalid token") {
          localStorage.removeItem("user-token");
          navigate("/signin");
        }
      });
  };

  return (
    <>
      <NavBar />
      {loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <NavBar />
          <Box sx={{ p: 2, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Box sx={{ backgroundColor: "#fff", p: 2, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom>
                Shopping Cart
              </Typography>
              <Divider sx={{ my: 2 }} />
              {!carts || carts?.length === 0 ? (
                <>
                  <Typography variant="subtitle1" fontWeight="bold">
                    No products in cart
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              ) : (
                <>
                  {carts?.map((cart) => (
                    <Box key={cart.product.id} sx={{ mb: 2 }}>
                      <Grid container spacing={2}>
                        {/* Image */}
                        <Grid size={{ xs: 12, sm: 2 }}>
                          <CardMedia
                            component="img"
                            height="140"
                            src={cart.productImages?.[0]}
                            alt={cart.productName}
                          />
                        </Grid>

                        {/* Details */}
                        <Grid size={{ xs: 12, sm: 7 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {cart.product.productName}
                          </Typography>
                          {cart.quantity === cart.product.productQuantity ? (
                            <Typography variant="caption" color="error">
                              {`Only ${cart?.quantity} in stock.`}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="success.main">
                              In Stock
                            </Typography>
                          )}
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            mt={1}
                          >
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newQty = cart.quantity - 1;
                                if (cart.quantity > 0) {
                                  AddToCart(newQty, cart.product._id);
                                }
                              }}
                              sx={{
                                border: "1px solid #1976D2",
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                color: "#1976D2",
                                "&:hover": {
                                  backgroundColor: "#eee",
                                },
                              }}
                              disabled={cart.quantity === 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Box
                              sx={{
                                width: 48,
                                height: 28,
                                border: "1px solid #1976D2",
                                borderRadius: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                m: 1,
                              }}
                            >
                              <Typography variant="body1">
                                {cart.quantity}
                              </Typography>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const newQty = cart.quantity + 1;
                                if (newQty <= cart.product.productQuantity) {
                                  AddToCart(newQty, cart.product._id);
                                }
                              }}
                              sx={{
                                border: "1px solid #1976D2",
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                color: "#1976D2",
                                "&:hover": {
                                  backgroundColor: "#eee",
                                },
                              }}
                              disabled={
                                cart.quantity >= cart.product?.productQuantity
                              }
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>

                          {/* Actions */}
                          <Box mt={1}>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => {
                                deleteCart(cart.product._id);
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Grid>

                        {/* Price */}
                        <Grid
                          size={{ xs: 12, sm: 3 }}
                          textAlign={{ xs: "center", sm: "right" }}
                        >
                          <Typography variant="h6" fontWeight="bold">
                            ₹
                            {(
                              cart.product.productPrice * cart.quantity
                            ).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  ))}
                </>
              )}
              <Box textAlign={{ xs: "center", sm: "right" }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Total ({carts?.length} item
                  {carts?.length > 1 ? "'s" : ""}): ₹
                  {(
                    carts?.reduce(
                      (total, item) =>
                        total +
                        Number(item.product.productPrice) * item.quantity,
                      0
                    ) || 0
                  ).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </>
  );
};

export default CartDetails;
