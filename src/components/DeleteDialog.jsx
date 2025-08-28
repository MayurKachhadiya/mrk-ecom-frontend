import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, Fragment } from "react";

const DeleteDialog = ({
  openDialog,
  closeDialog,
  confirmDelete,
  openReviewDialog,
}) => {
  return (
    <Dialog
      open={openDialog || openReviewDialog}
      onClose={closeDialog}
      aria-labelledby="responsive-dialog-title"
    >
      <DialogTitle id="responsive-dialog-title">
        Delete {openReviewDialog ? "Review" : "Product"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this{" "}
          {openReviewDialog ? "Review" : "Product"}?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} autoFocus>
          Cancel
        </Button>
        <Button onClick={confirmDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteDialog;
