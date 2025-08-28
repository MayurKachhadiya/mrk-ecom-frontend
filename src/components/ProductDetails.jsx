import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  CardMedia,
  Stack,
  IconButton,
  Rating,
  LinearProgress,
  Button,
  Tooltip,
  Avatar,
  Chip,
  LinearProgress as MuiLinearProgress,
  Skeleton,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import axios from "axios";
import { AddCartData, Snackbarhandle } from "../reducer/EcomReducer";
import NavBar from "./NavBar";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddReview from "./AddReview";
import EditIcon from "@mui/icons-material/EditSquare";
import DeleteDialog from "./DeleteDialog";
import { debounce } from "lodash";

const StarRow = ({ star, percent, count }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography variant="body2" sx={{ minWidth: 28 }}>
      {star}★
    </Typography>
    <Box sx={{ flex: 1 }}>
      <MuiLinearProgress
        variant="determinate"
        value={percent}
        sx={{ height: 8, borderRadius: 6 }}
      />
    </Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ minWidth: 40, textAlign: "right" }}
    >
      {count}
    </Typography>
  </Stack>
);

const ProductDetails = () => {
  const { pid } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddToCard, setIsAddToCard] = useState(true);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [isEdit, setIsEdit] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const UserDataToken = localStorage.getItem("user-token");
  const resUserData = jwtDecode(UserDataToken);
  const [deletedReviewId, setDeletedReviewId] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(1); // track current page
  const [hasMore, setHasMore] = useState(true); // whether more data available
  const [reviewloading, setReviewLoading] = useState(false);
  const [allReview, setAllReview] = useState([]);
  // ✅ Ref for scroll container
  const containerRef = useRef(null);

  useEffect(() => {
    getProductDetails(1);
  }, []);

  const getProductDetails = async (pageNo = 1) => {
    if (reviewloading) return; // prevent double fire
    setReviewLoading(true);

    try {
      const res = await axios.post(
        `https://mrk-com-backend.onrender.com/product/details/${pid}?page=${pageNo}&limit=10`,
        { userId: resUserData.id },
        { headers: { Authorization: `Bearer ${UserDataToken}` } }
      );

      const { product, productQuantity, reviews, allReviews } = jwtDecode(
        res.data.token
      );

      if (reviews.length === 0) {
        setHasMore(false);
      } else {
        setProductReviews((prev) => [...prev, ...reviews]);
        setAllReview(allReviews);
      }

      if (pageNo === 1) {
        setProduct(product);
        setMainImage(product.productImages[0]);
        setQuantity(productQuantity);
        setIsAddToCard(productQuantity === 0);
        setLoading(false);
      }
    } catch (err) {
      dispatch(
        Snackbarhandle({ isOpen: true, message: err.response.data.message })
      );
      if (err.response.data.message === "Invalid token") {
        localStorage.removeItem("user-token");
        navigate("/signin");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const cartManage = (cartManageData) => {
    dispatch(AddCartData({ cartManageData, quantity }));
    navigate("/cart");
  };

  const AddToCart = (newQty) => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
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
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      )
      .then((res) => {
        if (res.data.singleItem.quantity === 0) {
          setIsAddToCard(true);
        }
        setQuantity(res.data.singleItem.quantity);
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
    setIsAddToCard(false);
  };

  const handleDeleteConfirm = () => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    axios
      .delete(`https://mrk-com-backend.onrender.com/review/delete/${deletedReviewId}`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      })
      .then((res) => {
        setPage(1);
        dispatch(Snackbarhandle({ isOpen: true, message: res.data.message }));
        setProductReviews([]);
        getProductDetails(1);
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({ isOpen: true, message: err.response.data.message })
        );
        if (err.response.data.message === "Invalid token") {
          localStorage.removeItem("user-token");
          navigate("/signin");
        }
      })
      .finally(() => {
        setOpenDialog(false);
        setDeletedReviewId(null);
      });
  };
  /** -------- Derived UI Data -------- */
  const reviewStats = useMemo(() => {
    const total = productReviews[0]?.totalReviews;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    for (const r of allReview) {
      const rating = Math.round(r.rating || 0);
      if (counts[rating] !== undefined) counts[rating] += 1;
      sum += r.rating || 0;
    }
    const avg = total ? Number((sum / total).toFixed(1)) : 0;
    const rows = [5, 4, 3, 2, 1].map((s) => ({
      star: s,
      count: counts[s],
      percent: total ? (counts[s] / total) * 100 : 0,
    }));
    // If backend provides avgRating in first item, prefer that:
    const beAvg = productReviews?.[0]?.avgRating;
    return { avg: beAvg ?? avg, total, rows };
  }, [productReviews]);

  const toggleShowMore = (event) => {
    event.stopPropagation(); // Prevent triggering CardActionArea click
    setShowMore((prev) => !prev);
  };

  // ✅ Scroll handler
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || reviewloading || !hasMore) return;
    if (
      container.scrollTop + container.clientHeight >=
      container.scrollHeight - 50
    ) {
      setPage((prev) => prev + 1);
    }
  };

  const inStock = product?.productQuantity > 0;

  // Fetch when page changes
  useEffect(() => {
    if (page > 1 && !reviewloading) {
      getProductDetails(page);
    }
  }, [page]);

  return (
    <>
      <NavBar />
      {loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <AddReview
            openDialog={reviewDialog}
            closeDialog={() => {
              setPage(1);
              setProductReviews([]);
              getProductDetails(1);
              setReviewDialog(false);
              setHasMore(true);
            }}
            handleEdit={isEdit}
          />
          <DeleteDialog
            openReviewDialog={openDialog}
            closeDialog={() => {
              setOpenDialog(false);
            }}
            confirmDelete={handleDeleteConfirm}
          />
          <Box p={3}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
              <Grid container spacing={4}>
                {/* LEFT: Images */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={mainImage}
                      alt={product?.productName || "Product image"}
                      sx={{
                        width: "100%",
                        height: { xs: 300, sm: 380, md: 420 },
                        objectFit: "cover",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: 2,
                        transition: "transform .35s ease",
                        "&:hover": { transform: "scale(1.02)" },
                      }}
                    />
                    {/* Floating badge if needed */}
                    {inStock ? (
                      <Chip
                        size="small"
                        label="In Stock"
                        color="success"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          borderRadius: 2,
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Out of Stock"
                        color="error"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </Box>

                  {/* Thumbnails */}
                  <Box
                    mt={2}
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      overflowX: "auto",
                      pb: 0.5,
                    }}
                  >
                    {(product?.productImages || []).map((img, idx) => {
                      const isActive = mainImage === img;
                      return (
                        <IconButton
                          key={idx}
                          onClick={() => setMainImage(img)}
                          sx={{
                            p: 0,
                            borderRadius: 2,
                            width: 82,
                            height: 82,
                            flex: "0 0 auto",
                            overflow: "hidden",
                            border: "2px solid",
                            borderColor: isActive ? "primary.main" : "divider",
                            boxShadow: isActive ? 3 : 1,
                            transition: "all .25s",
                            "&:hover": { boxShadow: 3 },
                          }}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </IconButton>
                      );
                    })}
                  </Box>
                </Grid>

                {/* RIGHT: Details */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2}>
                    <Typography variant="h4" color="text.secondary">
                      {product.productName}
                    </Typography>
                    {/* <Divider /> */}
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #f7f9fc, #eef3fb)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="primary"
                        fontWeight={800}
                        sx={{ mb: { xs: 2 } }}
                      >
                        ₹ {product.productPrice.toLocaleString()}
                      </Typography>
                      <Box>
                        <Grid container spacing={2} display="flex">
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Rating
                              name="half-rating-read"
                              value={productReviews[0]?.avgRating}
                              precision={0.5}
                              readOnly
                            />
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              ml={1}
                            >
                              {productReviews[0]?.avgRating
                                ? `${productReviews[0]?.avgRating} / 5`
                                : "No ratings"}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }} sx={{ mt: { md: 1 } }}>
                            {product?.productQuantity > 0 ? (
                              <Chip
                                size="small"
                                color="success"
                                label="Available"
                              />
                            ) : (
                              <Chip
                                size="small"
                                color="error"
                                label="Unavailable"
                              />
                            )}
                          </Grid>
                          <Grid
                            size={{ xs: 12, sm: 4 }}
                            sx={{ mt: { md: 1 } }}
                            display="flex"
                            justifyContent="center"
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              <strong>Colors: </strong>
                            </Typography>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                bgcolor: product.productColor,
                                border: "1px solid #ccc",
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {showMore
                        ? product.productDescription
                        : product.productDescription.slice(0, 400) + "... "}
                      {product.productDescription.length > 400 && (
                        <Link
                          component="button"
                          type="button"
                          onClick={toggleShowMore}
                          sx={{ ml: 1 }}
                        >
                          {showMore ? " Read Less" : "Read More"}
                        </Link>
                      )}
                    </Typography>

                    {isAddToCard ? (
                      <Tooltip
                        title={
                          !product?.productQuantity ||
                          product.productQuantity == 0
                            ? "Out of stock"
                            : ""
                        }
                      >
                        <span>
                          <Button
                            disabled={
                              !product?.productQuantity ||
                              product.productQuantity == 0
                            }
                            onClick={() => AddToCart(1)}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          >
                            Add To Cart
                          </Button>
                        </span>
                      </Tooltip>
                    ) : (
                      <>
                        <Grid container justifyContent="center">
                          <Grid size={{ xs: 12, sm: 6 }} mb={1}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                justifyContent: "center",
                              }}
                            >
                              {quantity === 1 ? (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setIsAddToCard(true);
                                    AddToCart(0);
                                  }}
                                  sx={{
                                    border: "1px solid #1976D2",
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    color: "#1976D2",
                                    "&:hover": {
                                      backgroundColor: "#eee",
                                    },
                                  }}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              ) : (
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    const newQty = quantity - 1;
                                    if (quantity > 0) {
                                      setQuantity(newQty);
                                      AddToCart(newQty);
                                    } else {
                                      setQuantity(quantity);
                                    }
                                  }}
                                  sx={{
                                    border: "1px solid #1976D2",
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    color: "#1976D2",
                                    "&:hover": {
                                      backgroundColor: "#eee",
                                    },
                                  }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                              )}
                              <Box
                                sx={{
                                  width: 48,
                                  height: 36,
                                  border: "1px solid #1976D2",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Typography variant="body1">
                                  {quantity}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const newQty = quantity + 1;
                                  if (product?.productQuantity > quantity) {
                                    setQuantity(newQty);
                                    AddToCart(newQty);
                                  } else {
                                    setQuantity(quantity);
                                  }
                                }}
                                sx={{
                                  border: "1px solid #1976D2",
                                  width: 36,
                                  height: 36,
                                  borderRadius: "50%",
                                  color: "#1976D2",
                                  "&:hover": {
                                    backgroundColor: "#eee",
                                  },
                                }}
                                disabled={quantity >= product?.productQuantity}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                            {product?.productQuantity == quantity && (
                              <Typography
                                variant="caption"
                                color="error"
                                sx={{ mt: 1 }}
                              >
                                {`Only ${product?.productQuantity} in stock.`}
                              </Typography>
                            )}
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <Button
                              onClick={() => {
                                cartManage(product);
                              }}
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            >
                              Go to Cart
                            </Button>
                          </Grid>
                        </Grid>
                      </>
                    )}
                    <Divider sx={{ my: 2 }} />

                    {/* Review Summary */}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2.5, borderRadius: 3 }}
                        >
                          <Stack alignItems="center" spacing={0.5}>
                            <Typography variant="h3" fontWeight={800}>
                              {reviewStats.avg || "0.0"}
                            </Typography>
                            <Rating
                              value={reviewStats.avg}
                              precision={0.1}
                              readOnly
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {reviewStats.total}{" "}
                              {reviewStats.total === 1
                                ? "review"
                                : !reviewStats.total
                                ? "0 reviews"
                                : "reviews"}
                            </Typography>
                          </Stack>
                        </Paper>
                      </Grid>
                      <Grid size={{ xs: 12, md: 7 }}>
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 3 }}
                        >
                          <Stack spacing={1}>
                            {reviewStats.rows.map((r) => (
                              <StarRow
                                key={r.star}
                                star={r.star}
                                percent={r.percent}
                                count={r.count}
                              />
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ mb: 1 }} />

                  {/* Header */}
                  <Grid
                    container
                    alignItems="center"
                    justifyContent="space-between"
                    flexWrap="wrap"
                    sx={{ mb: 1 }}
                  >
                    <Grid
                      size={{ xs: 12, sm: 8 }}
                      display="flex"
                      justifyContent={{ xs: "center", sm: "flex-start" }}
                      mb={{ xs: 1, sm: 0 }}
                    >
                      <Typography
                        variant="h5"
                        color="text.secondary"
                        textAlign="center"
                      >
                        Product Reviews
                      </Typography>
                    </Grid>

                    <Grid
                      size={{ xs: 12, sm: 4 }}
                      display="flex"
                      justifyContent={{ xs: "center", sm: "flex-end" }}
                    >
                      <Button
                        disabled={
                          !product?.productQuantity ||
                          product.productQuantity === 0 ||
                          resUserData.userType === "admin"
                        }
                        variant="outlined"
                        sx={{ borderRadius: 2 }}
                        onClick={() => {
                          setReviewDialog(true);
                          setIsEdit({});
                        }}
                      >
                        Add Review
                      </Button>
                    </Grid>
                  </Grid>

                  {/* Reviews list with scroll */}
                  <Box
                    ref={containerRef}
                    onScroll={handleScroll}
                    sx={{
                      maxHeight: 500,
                      overflowY: "auto",
                      pr: 1,
                    }}
                  >
                    <Grid container spacing={2} m={1} justifyContent="center">
                      {productReviews.length === 0 && !reviewloading && (
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap", m: 2 }}
                          color="text.secondary"
                        >
                          No reviews
                        </Typography>
                      )}

                      {productReviews.map((review) => (
                        <Grid key={review._id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper
                            elevation={6}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              height: "100%",
                            }}
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  src={
                                    review.user.userImage || "/dummy-image.jpg"
                                  }
                                  alt={review.user.name}
                                />
                                <Box>
                                  <Typography variant="subtitle1">
                                    {review.user.name}
                                  </Typography>
                                  <Rating
                                    value={review.rating}
                                    precision={0.5}
                                    readOnly
                                    size="small"
                                  />
                                </Box>
                              </Stack>

                              {review.user._id === resUserData.id && (
                                <Box>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => {
                                      setReviewDialog(true);
                                      setIsEdit(review);
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      setOpenDialog(true);
                                      setDeletedReviewId(review._id);
                                    }}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Reviewed on {review.reviewDate}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, wordBreak: "break-word" }}
                            >
                              {review.comment}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>

                    {reviewloading && (
                      <Box p={3}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                          <Grid container spacing={4}>
                            {/* Reviews skeleton */}
                            <Grid item xs={12}>
                              <Divider sx={{ mb: 2 }} />
                              <Typography variant="h6" sx={{ mb: 2 }}>
                                Product Reviews
                              </Typography>
                              <Grid container spacing={2}>
                                {[1, 2, 3].map((i) => (
                                  <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                                      <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                      >
                                        <Skeleton
                                          variant="circular"
                                          width={40}
                                          height={40}
                                        />
                                        <Box>
                                          <Skeleton
                                            variant="text"
                                            width={100}
                                          />
                                          <Skeleton variant="text" width={60} />
                                        </Box>
                                      </Stack>
                                      <Skeleton
                                        variant="text"
                                        width="80%"
                                        sx={{ mt: 2 }}
                                      />
                                      <Skeleton variant="text" width="90%" />
                                      <Skeleton variant="text" width="70%" />
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
};

export default ProductDetails;
