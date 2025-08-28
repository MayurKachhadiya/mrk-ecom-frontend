import { FormProvider, useForm } from "react-hook-form";
import NavBar from "../NavBar";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import FormInput from "../DynamicFormField/FormInput";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Snackbarhandle } from "../../reducer/EcomReducer";
import { useDispatch } from "react-redux";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";

const EditProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const pid = params.pid;

  const [productDetails, setProductDetails] = useState(null);
  const [oldImages, setOldImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [deletedOldImageIndexes, setDeletedOldImageIndexes] = useState(
    new Set()
  );
  const [deletedNewImageIndexes, setDeletedNewImageIndexes] = useState(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  const UserDataToken = localStorage.getItem("user-token"); // assuming token
  const resUserData = jwtDecode(UserDataToken); // assuming user info is in token

  // Fetch product details on page load
  const getProductDetails = async () => {
    try {
      const res = await axios.post(
        `https://mrk-com-backend.onrender.com/product/details/${pid}?page=1&limit=10`,
        { userId: resUserData.id },
        { headers: { Authorization: `Bearer ${UserDataToken}` } }
      );

      const { product } = jwtDecode(res.data.token);

      setProductDetails(product);
      setOldImages(product.productImages || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      dispatch(
        Snackbarhandle({ isOpen: true, message: "Failed to fetch product." })
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    getProductDetails();
  }, [pid]);

  const validOldImages = useMemo(
    () => oldImages.filter((_, index) => !deletedOldImageIndexes.has(index)),
    [oldImages, deletedOldImageIndexes]
  );

  const validNewImages = useMemo(
    () =>
      newImagePreviews.filter((_, index) => !deletedNewImageIndexes.has(index)),
    [newImagePreviews, deletedNewImageIndexes]
  );

  const handleImageDelete = (type, index) => {
    if (type === "old")
      setDeletedOldImageIndexes((prev) => new Set(prev).add(index));
    if (type === "new")
      setDeletedNewImageIndexes((prev) => new Set(prev).add(index));
  };

  const methods = useForm({
    defaultValues: {
      productName: productDetails?.productName || "",
      productDescription: productDetails?.productDescription || "",
      productPrice: productDetails?.productPrice || "",
      productColor: productDetails?.productColor || "",
      productQuantity: productDetails?.productQuantity || "",
      oldImages: null,
    },
    mode: "onBlur",
  });
  useEffect(() => {
    methods.reset({
      productName: productDetails?.productName || "",
      productDescription: productDetails?.productDescription || "",
      productPrice: productDetails?.productPrice || "",
      productColor: productDetails?.productColor || "",
      productQuantity: productDetails?.productQuantity || "",
      oldImages: null,
    });
  }, [productDetails]);

  const watchFiles = methods.watch("oldImages");
  useEffect(() => {
    if (watchFiles && watchFiles.length > 0) {
      const previews = Array.from(watchFiles)
        .filter((file) => file instanceof File)
        .map((file) => URL.createObjectURL(file));
      setNewImagePreviews(previews);
    } else {
      setNewImagePreviews([]);
    }
  }, [watchFiles]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("productDescription", data.productDescription);
    formData.append("productPrice", data.productPrice);
    formData.append("productColor", data.productColor);
    formData.append("productQuantity", data.productQuantity);

    // Only add new uploaded files
    if (data.oldImages && data.oldImages.length > 0) {
      Array.from(data.oldImages).forEach((file, index) => {
        if (file instanceof File && !deletedNewImageIndexes.has(index)) {
          formData.append("productImages", file);
        }
      });
    }

    // Send deleted old images by name
    const deletedImages = oldImages
      .filter((_, index) => deletedOldImageIndexes.has(index))
      .map((url) => url.split("/").pop());

    formData.append("deletedImages", JSON.stringify(deletedImages));

    axios
      .post(`https://mrk-com-backend.onrender.com/product/update/${pid}`, formData, {
        headers: {
          Authorization: `Bearer ${UserDataToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        methods.reset();
        dispatch(Snackbarhandle({ isOpen: true, message: res.data.message }));
        navigate("/");
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
  };

  return (
    <>
      <NavBar />
      <br />

      {loading ? (
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "78vh", p: 1 }}
        >
          <Grid
            size={{ xs: 12, sm: 10, md: 6, lg: 4 }}
            sx={{ m: 2, p: 3, border: "1px solid #ccc", borderRadius: 2 }}
          >
            <Stack spacing={2}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="rectangular" height={56} /> {/* productName */}
              <Skeleton variant="rectangular" height={100} />{" "}
              {/* productDescription */}
              <Skeleton variant="rectangular" height={56} />{" "}
              {/* productPrice */}
              <Skeleton variant="rectangular" height={56} />{" "}
              {/* productColor */}
              <Skeleton variant="rectangular" height={56} />{" "}
              {/* productQuantity */}
              <Skeleton variant="rectangular" height={120} />{" "}
              {/* images preview */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Skeleton variant="rectangular" width={100} height={40} />
                <Skeleton variant="rectangular" width={100} height={40} />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      ) : (
        <FormProvider {...methods}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "78vh", p: 1 }}
          >
            <Grid
              size={{ xs: 12, sm: 10, md: 6, lg: 4 }}
              sx={{ m: 2, p: 3, border: "1px solid #ccc", borderRadius: 2 }}
            >
              <Typography variant="h4" sx={{ pb: 2 }} gutterBottom>
                Update Product
              </Typography>

              <Stack spacing={2}>
                <FormInput
                  name="productName"
                  label="Product Name"
                  rules={{ required: "Product Name is required" }}
                />
                <FormInput
                  name="productDescription"
                  label="Product Description"
                  multiline="multiline"
                  rules={{ required: "Product Description is required" }}
                />
                <Grid container size={{ xs: 12, sm: 12 }} spacing={2}>
                  <Grid sx={{ gap: 1 }} size={{ xs: 12, sm: 6 }} spacing={2}>
                    <FormInput
                      name="productPrice"
                      label="Product Price"
                      type="number"
                      rules={{
                        required: "Product Price is required",
                        min: { value: 0, message: "Please enter minimum 0" },
                      }}
                    />
                  </Grid>
                  <Grid sx={{ gap: 1 }} size={{ xs: 12, sm: 6 }}>
                    <FormInput
                      name="productColor"
                      label="Product Color"
                      rules={{ required: "Product Color is required" }}
                    />
                  </Grid>
                  <Grid sx={{ gap: 1 }} size={{ xs: 12, sm: 6 }}>
                    <FormInput
                      name="productQuantity"
                      label="Product Quantity"
                      type="number"
                      rules={{
                        required: "Product Quantity is required",
                        min: { value: 0, message: "Please enter minimum 0" },
                      }}
                    />
                  </Grid>
                </Grid>
                {/* Images */}
                <Grid
                  sx={{
                    display: "flex",
                    gap: 1,
                    p: 1,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {[
                    ...oldImages.map((img, index) => ({
                      src: img,
                      type: "old",
                      index,
                      hidden: deletedOldImageIndexes.has(index),
                    })),
                    ...newImagePreviews.map((img, index) => ({
                      src: img,
                      type: "new",
                      index,
                      hidden: deletedNewImageIndexes.has(index),
                    })),
                  ]
                    .filter((img) => !img.hidden)
                    .map((imgObj, i) => (
                      <Card
                        key={`img-${imgObj.type}-${imgObj.index}`}
                        sx={{
                          width: 150,
                          height: 100,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                        }}
                      >
                        <CardActionArea sx={{ width: "100%", height: "100%" }}>
                          <CardMedia
                            component="img"
                            image={imgObj.src}
                            alt={`Product image ${i + 1}`}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </CardActionArea>
                        <DeleteOutlineIcon
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            cursor: "pointer",
                            color: "#ffffff",
                          }}
                          onClick={() =>
                            handleImageDelete(imgObj.type, imgObj.index)
                          }
                        />
                      </Card>
                    ))}
                </Grid>

                <FormInput
                  name="oldImages"
                  label="Product Images"
                  type="file"
                  inputProps={{ accept: "image/*", multiple: true }}
                  rules={{
                    validate: {
                      minLength: (files) => {
                        const validOld = oldImages.filter(
                          (_, index) => !deletedOldImageIndexes.has(index)
                        );
                        const validNew = Array.from(files || []).filter(
                          (_, index) => !deletedNewImageIndexes.has(index)
                        );
                        const total = validOld.length + validNew.length;
                        return total > 0 || "You must upload at least 1 image.";
                      },
                      maxLength: (files) => {
                        const validOld = oldImages.filter(
                          (_, index) => !deletedOldImageIndexes.has(index)
                        );
                        const validNew = Array.from(files || []).filter(
                          (_, index) => !deletedNewImageIndexes.has(index)
                        );
                        const total = validOld.length + validNew.length;
                        return (
                          total <= 5 || "You can upload up to 5 images only."
                        );
                      },
                      isImage: (files) => {
                        const fileArray = Array.from(files || []);
                        const hasInvalid = fileArray.some((file, index) => {
                          // Skip deleted new files
                          if (deletedNewImageIndexes.has(index)) return false;
                          return !(
                            file instanceof File &&
                            file.type.startsWith("image/")
                          );
                        });
                        return (
                          !hasInvalid ||
                          "Only image (jpg,png,jpeg) files are allowed."
                        );
                      },
                    },
                  }}
                />

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    Update
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      methods.reset();
                      navigate("/");
                    }}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </FormProvider>
      )}
    </>
  );
};

export default EditProduct;
