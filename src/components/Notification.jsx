import { IconButton, Snackbar } from "@mui/material";
import { Fragment } from "react";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from "react-redux";
import { Snackbarhandle } from "../reducer/EcomReducer";

const Notification = () => {
  const { isOpen, message } = useSelector((state) => state.ecomStore.snackbar);
  const dispatch = useDispatch();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    dispatch(Snackbarhandle({ isOpen: false, message: '' }));
  };

  const action = (
    <Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Fragment>
  );

  return (
    <Snackbar
      open={isOpen}
      autoHideDuration={2000}
      onClose={handleClose}
      message={message}
      action={action}
    />
  );
};

export default Notification;
