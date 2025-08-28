import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  LinearProgress,
  TablePagination,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Navbar from "./NavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AddProductData, Snackbarhandle } from "../reducer/EcomReducer";
import { jwtDecode } from "jwt-decode";
import { NavLink, useNavigate } from "react-router-dom";
import DeleteDialog from "./DeleteDialog";

const HomePage = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // check screen size

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true); // NEW
  const [totalRecord, setTotalRecord] = useState(0);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const navigate = useNavigate();

  const [newProducts, setProducts] = useState();
  const dispatch = useDispatch();
  const { userType } = useSelector((state) => state.ecomStore.user);

  useEffect(() => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    axios
      .post(
        `http://localhost:5000/product/search?pname=${searchValue}`,
        {
          currentPage: page,
          rowPerPage: rowsPerPage,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      )
      .then((res) => {
        setProducts(res.data.filteredProducts);
        setTotalRecord(res.data.totalRecords);
        setLoading(false);
        dispatch(AddProductData(res.data.filteredProducts));
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({ isOpen: true, message: err.response.data.message })
        );
        if (err.response.data.message === "Invalid token") {
          localStorage.removeItem("user-token");
          navigate("/signin");
        }
      });
  }, [searchValue, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [searchValue, rowsPerPage]);

  const handleEditClick = (pid) => {
    navigate(`/editproduct/${pid}`);
  };

  const handleDeleteClick = (pid) => {
    setSelectedProductId(pid);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    axios
      .delete(`http://localhost:5000/product/delete/${selectedProductId}`, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      })
      .then((res) => {
        const { products } = jwtDecode(res.data.token);
        setProducts(products);
        dispatch(AddProductData(products));
        dispatch(Snackbarhandle({ isOpen: true, message: res.data.message }));
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
        setSelectedProductId(null);
      });
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedProductId(null);
  };

  return (
    <>
      <Navbar setSearchValue={setSearchValue} />
      <br />

      <DeleteDialog
        openDialog={openDialog}
        closeDialog={handleClose}
        confirmDelete={handleDeleteConfirm}
      />
      {loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
              gap: 2,
              p: 1,
              mb: 9,
            }}
          >
            {newProducts?.length === 0 ? (
              <Box sx={{ gridColumn: "1 / -1", textAlign: "center" }}>
                <h1>No Product Found</h1>
              </Box>
            ) : (
              newProducts?.map((product, index) => (
                <Card
                  key={product._id || index}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="140"
                      image={product.productImages[0]}
                      alt={product.productImages[0]}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.productName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {product.productDescription.length > 30
                          ? `${product.productDescription.slice(0, 30)}...`
                          : product.productDescription}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: "center" }}>
                    <NavLink to={`/product/${product?._id}`}>
                      <Button size="small" color="primary">
                        Show
                      </Button>
                    </NavLink>
                    {userType === "admin" && (
                      <>
                        <Button
                          size="small"
                          color="warning"
                          onClick={() => handleEditClick(product._id)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(product._id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              ))
            )}
          </Box>
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: "white",
              boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
              [`& .MuiTablePagination-toolbar`]: {
                flexWrap: "wrap",
                justifyContent: isMobile?"center":"flex-end",
              },
            }}
          >
            <TablePagination
              component="div"
              count={totalRecord || 0}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              labelRowsPerPage="Rows per page"
            />
          </Box>
        </>
      )}
    </>
  );
};
export default HomePage;
