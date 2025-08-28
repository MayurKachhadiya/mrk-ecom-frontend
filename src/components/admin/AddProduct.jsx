import { FormProvider, useForm } from "react-hook-form";
import NavBar from "../NavBar";
import { Button, Grid, Stack, Typography } from "@mui/material";
import FormInput from "../DynamicFormField/FormInput";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbarhandle } from "../../reducer/EcomReducer";
import { useDispatch } from "react-redux";

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      productName: "",
      productDescription: "",
      productPrice: "",
      productColor: "",
      productQuantity: "",
      productImages: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data) => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    const formData = new FormData();
    formData.append("productName", data.productName);
    formData.append("productDescription", data.productDescription);
    formData.append("productPrice", data.productPrice);
    formData.append("productColor", data.productColor);
    formData.append("productQuantity", data.productQuantity);
    
    const files = data.productImages;
    for (let i = 0; i < files.length; i++) {
      formData.append("productImages", files[i]);
    }

    axios
      .post("https://mrk-com-backend.onrender.com/product/add", formData, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
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
      <FormProvider {...methods}>
        <Grid
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "78vh" }}
        >
          <Grid
            size={{ xs: 12, sm: 10, md: 6, lg: 4 }}
            sx={{ m: 2, p: 3, border: "1px solid #ccc", borderRadius: 2 }}
          >
            <Typography variant="h4" gutterBottom>
              Add Product
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
                rules={{
                  required: "Product Description is required",
                }}
              />
              <FormInput
                name="productPrice"
                label="Product Price"
                type="number"
                rules={{
                  required: "Product Price is required",
                  min: {
                    value: 0,
                    message: "Please enter minimum 0",
                  },
                }}
              />
              <FormInput
                name="productColor"
                label="Product Color"
                rules={{
                  required: "Product Color is required",
                }}
              />
              <FormInput
                name="productQuantity"
                label="Product Quantity"
                type="number"
                rules={{
                  required: "Product Quantity is required",
                  min: {
                    value: 0,
                    message: "Please enter minimum 0",
                  },
                }}
              />
              <FormInput
                name="productImages"
                label="Product Images"
                type="file"
                inputProps={{ accept: "image/*", multiple: true }}
                rules={{
                  required: "Product Image is required",
                  validate: {
                    maxLength: (files) =>
                      (files && files.length <= 5) ||
                      "You can upload up to 5 images only",
                    isImage: (files) => {
                      return (
                        [...files].every((file) =>
                          file.type.startsWith("image/")
                        ) || "Only image files are allowed"
                      );
                    },
                  },
                }}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={methods.handleSubmit(onSubmit)}
                >
                  Submit
                </Button>
                <Button
                  type="button"
                  onClick={() => methods.reset()}
                  variant="outlined"
                >
                  Reset
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};
export default AddProduct;
