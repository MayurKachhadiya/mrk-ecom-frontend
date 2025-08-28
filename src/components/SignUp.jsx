import { useForm, FormProvider } from "react-hook-form";
import { Typography, Stack, Button, Grid } from "@mui/material";
import FormInput from "./DynamicFormField/FormInput";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { Snackbarhandle, UserData } from "../reducer/EcomReducer";
import Notification from "./Notification";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      profileImages: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name',data.name)
    formData.append('email',data.email)
    formData.append('password',data.password)

    formData.append('profileImages',data.profileImages[0])
    axios
      .post("https://mrk-com-backend.onrender.com/user/signup", formData)
      .then((res) => {
        localStorage.setItem("user-token", res.data.token);
        const resUserData = jwtDecode(res.data.token);
        dispatch(UserData(resUserData));
        dispatch(Snackbarhandle({ isOpen: true, message: res.data.message }));
        methods.reset();
        navigate("/");
      })
      .catch((err) => {
        dispatch(
          Snackbarhandle({ isOpen: true, message: err.response.data.message })
        );
      });
  };

  return (
    <>
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
              SignUp
            </Typography>

            <Stack spacing={2}>
              <FormInput
                name="name"
                label="Full Name"
                rules={{ required: "Name is required" }}
              />
              <FormInput
                name="email"
                label="Email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email",
                  },
                }}
              />
              <FormInput
                name="password"
                label="Password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                }}
              />
              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                rules={{
                  required: "Confirm Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters long",
                  },
                  validate: (value) =>
                    value === methods.getValues("password") ||
                    "Passwords do not match",
                }}
              />
              <FormInput
                name="profileImages"
                label="Product Images"
                type="file"
                inputProps={{ accept: "image/*", multiple: true }}
                rules={{
                  validate: {
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
              <Stack direction="row" spacing={2} justifyContent="center">
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
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Already have an account? <Link to="/signin">SignIn</Link>
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
      <Notification />
    </>
  );
};
export default SignUp;
