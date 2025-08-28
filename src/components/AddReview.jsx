import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Rating,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { useState, useEffect } from "react";
import FormInput from "./DynamicFormField/FormInput";
import { FormProvider, useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Snackbarhandle } from "../reducer/EcomReducer";

const AddReview = ({ openDialog, closeDialog, handleEdit }) => {
  const { pid } = useParams();
  const { id } = useSelector((state) => state.ecomStore.user);
  const [newRatingVal, setNewRatingVal] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      productComment: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (handleEdit?.comment) {
      methods.reset({
        productComment: handleEdit?.comment,
      });
    }
    return () => {
      methods.reset({
        productComment: "",
      });
      setNewRatingVal(0);
    };
  }, [handleEdit]);

  const handleSubmit = methods.handleSubmit(({ productComment }) => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    const currentDate = new Date();

    axios
      .post(
        "http://localhost:5000/review/add",
        {
          rating: newRatingVal,
          comment: productComment,
          reviewDate: currentDate.toDateString(),
          pid: pid,
          userId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      )
      .then((res) => {
        closeDialog();
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
    methods.reset();
    setNewRatingVal(0);
  });

  const handleUpdate = methods.handleSubmit(({ productComment }) => {
    const BEARER_TOKEN = localStorage.getItem("user-token");
    const currentDate = new Date();

    axios
      .post(
        `http://localhost:5000/review/update/${handleEdit._id}`,
        {
          rating: newRatingVal,
          comment: productComment,
          reviewDate: currentDate.toDateString(),
          pid: pid,
          userId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${BEARER_TOKEN}`,
          },
        }
      )
      .then((res) => {
        closeDialog();
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
    methods.reset();
    setNewRatingVal(0);
  });

  return (
    <Dialog
      open={openDialog}
      onClose={closeDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 1.5 },
      }}
    >
      <FormProvider {...methods}>
        <DialogTitle
          id="responsive-dialog-title"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "1.5rem",
            pb: 0,
          }}
        >
          {handleEdit?.comment ? "Update Your Review" : "Add Your Review"}
        </DialogTitle>

        <DialogContent>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="subtitle1" fontWeight="500">
                  Product Rating:
                </Typography>
                <Rating
                  name="product-rating"
                  defaultValue={handleEdit?.rating}
                  // value={newRatingVal}
                  precision={0.5}
                  size="large"
                  onChange={(e, val) => setNewRatingVal(val)}
                />
              </Stack>

              <FormInput
                name="productComment"
                label="Your Comment"
                rules={{ required: "Product Comment is required" }}
                multiline
                rows={4}
                fullWidth
              />
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={closeDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEdit?.comment ? handleUpdate : handleSubmit}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, px: 3 }}
          >
            {handleEdit?.comment ? "Update Review" : "Submit Review"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};

export default AddReview;
