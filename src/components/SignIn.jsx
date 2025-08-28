import { useForm, FormProvider } from "react-hook-form";
import { Typography, Stack, Button, Grid } from "@mui/material";
import FormInput from "./DynamicFormField/FormInput";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Snackbarhandle, UserData } from "../reducer/EcomReducer";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const SignIn = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (data) => {
    axios
      .post("https://mrk-com-backend.onrender.com/user/signin", {
        email: data.email,
        password: data.password,
      })
      .then((res) => {
        localStorage.setItem("user-token", res.data.token);
        const resUserData = jwtDecode(res.data.token);
        dispatch(UserData(resUserData));
        navigate("/");
        dispatch(Snackbarhandle({ isOpen: true, message: res.data.message }));
        methods.reset();
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
              SignIn
            </Typography>

            <Stack spacing={2}>
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
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={methods.handleSubmit(onSubmit)}
                >
                  SignIn
                </Button>
              </Stack>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                Already have not account? <Link to="/signup">SignUp</Link>
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
};
export default SignIn;
