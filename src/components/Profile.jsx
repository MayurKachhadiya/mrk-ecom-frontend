import React, { useEffect } from "react";
import NavBar from "./NavBar";
import {
  Box,
  Button,
  CardMedia,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import FormInput from "./DynamicFormField/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Snackbarhandle, UserData } from "../reducer/EcomReducer";
import { jwtDecode } from "jwt-decode";
import CameraAlt from "@mui/icons-material/CameraAlt";

const Profile = () => {
  const { id, name, email, userImage } = useSelector(
    (state) => state.ecomStore.user
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const methods = useForm({
    defaultValues: {
      userName: name || "",
      userEmail: email || "",
      userImage: userImage || "",
      userPassword: "",
      userConfirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (name && email) {
      methods.reset({
        userName: name,
        userEmail: email,
        userImage: userImage,
        userPassword: "",
        userConfirmPassword: "",
      });
    }
  }, [name, email, userImage, methods]);

  const onUpdate = ({ userName, userEmail, userImage, userPassword }) => {
    const BEARER_TOKEN = localStorage.getItem("user-token");

    const formData = new FormData();
    formData.append("userName", userName);
    formData.append("userEmail", userEmail);
    formData.append("profileImages", userImage[0]);
    formData.append("userPassword", userPassword);
    axios
      .post(`https://mrk-com-backend.onrender.com/user/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        localStorage.setItem("user-token", res.data.token);
        const resUserData = jwtDecode(res.data.token);
        dispatch(UserData(resUserData));
        methods.reset();
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
      });
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      methods.setValue("userImage", [file]); // updates react-hook-form
    }
  };

  return (
    <>
      <NavBar />
      <FormProvider {...methods}>
        <Box sx={{ p: 2, backgroundColor: "#9d9191ff", minHeight: "100vh" }}>
          <Grid container justifyContent="center" sx={{ pt: 3 }}>
            <Grid
              size={{ xs: 12, md: 10, lg: 8 }}
              container
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: 3,
                overflow: "hidden",
              }}
            >
              {/* Left Side - Profile Image */}
              <Grid
                size={{ xs: 12, sm: 5 }}
                container
                justifyContent="center"
                alignItems="center"
                sx={{ backgroundColor: "#f9f9f9", p: 3 }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    src={userImage || "/dummy-image.jpg"}
                    alt="Profile image"
                    sx={{
                      width: { xs: 180, md: 280 },
                      height: { xs: 180, md: 280 },
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: 4,
                    }}
                  />
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: { xs: 10, md:20},
                      right: { xs: 10, md:20},
                      bgcolor: "white",
                      boxShadow: 2,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <CameraAlt fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>

              {/* Right Side - Form */}
              <Grid
                size={{ xs: 12, sm: 7 }}
                container
                direction="column"
                sx={{ p: 4 }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  PROFILE INFORMATION
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid sx={{ mb: 2 }}>
                  <FormInput
                    name="userName"
                    label="User Name"
                    rules={{ required: "User Name is required" }}
                  />
                </Grid>

                <Grid sx={{ mb: 2 }}>
                  <FormInput
                    name="userEmail"
                    label="User Email"
                    rules={{ required: "User Email is required" }}
                  />
                </Grid>

                <Grid sx={{ mb: 2 }}>
                  <FormInput
                    name="userPassword"
                    label="New Password"
                    type="password"
                    rules={{
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters long",
                      },
                    }}
                  />
                </Grid>

                <Grid sx={{ mb: 3 }}>
                  <FormInput
                    name="userConfirmPassword"
                    label="Confirm Password"
                    type="password"
                    rules={{
                      validate: (value) =>
                        value === methods.getValues("userPassword") ||
                        "Passwords do not match",
                    }}
                  />
                </Grid>

                {/* Action Buttons */}
                <Grid container justifyContent="center" spacing={2}>
                  <Grid>
                    <Button
                      type="button"
                      onClick={() => {
                        methods.reset({
                          userName: name,
                          userEmail: email,
                          userImage: "",
                          userPassword: "",
                          userConfirmPassword: "",
                        });
                      }}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={methods.handleSubmit(onUpdate)}
                    >
                      Update
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </>
  );
};

export default Profile;
