import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { ClearStore, UserData } from "../reducer/EcomReducer";
import InputBase from "@mui/material/InputBase";
import { styled, alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useMemo } from "react";
import { Avatar, Menu, MenuItem, Tooltip } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LogoutIcon from "@mui/icons-material/Logout";
const drawerWidth = 240;

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      width: "20ch",
    },
  },
}));

function NavBar(props) {
  const { window, setSearchValue } = props;
  const dispatch = useDispatch();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { userType, userImage } = useSelector((state) => state.ecomStore.user);
  const { pathname } = useLocation();
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  useEffect(() => {
    const UserDataToken = localStorage.getItem("user-token");
    if (UserDataToken) {
      const resUserData = jwtDecode(UserDataToken);
      dispatch(UserData(resUserData));
    }
  }, [dispatch]);

  useMemo(() => {
    if (setSearchValue) {
      setSearchValue(searchText);
    }
  }, [searchText, setSearchValue]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("user-token");
    dispatch(ClearStore());
    navigate("/signin");
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          textAlign: "center",
          backgroundColor: "#1976d2",
          color: "#fff",
          py: 2,
        }}
      >
        <Typography variant="h6">MRK-ECOM</Typography>
      </Box>

      <Divider />

      {/* Menu List */}
      <List sx={{ flex: 1, backgroundColor: "#fff" }}>
        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/"
            sx={{
              justifyContent: "center",
              gap: 1,
              color: "#1976d2",
              m: 1,
              border: 1,
              borderRadius: 1,
            }}
          >
            <HomeIcon />
            <ListItemText primary="Home" sx={{ textAlign: "center" }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/cart"
            sx={{
              justifyContent: "center",
              gap: 1,
              color: "#1976d2",
              m: 1,
              border: 1,
              borderRadius: 1,
            }}
          >
            <ShoppingCartIcon />
            <ListItemText primary="Cart" sx={{ textAlign: "center" }} />
          </ListItemButton>
        </ListItem>

        {userType === "admin" && (
          <ListItem disablePadding>
            <ListItemButton
              component={NavLink}
              to="/addproduct"
              sx={{
                justifyContent: "center",
                gap: 1,
                color: "#1976d2",
                m: 1,
                border: 1,
                borderRadius: 1,
              }}
            >
              <AddBoxIcon />
              <ListItemText
                primary="Add Product"
                sx={{ textAlign: "center" }}
              />
            </ListItemButton>
          </ListItem>
        )}

        <ListItem disablePadding>
          <ListItemButton
            component={NavLink}
            to="/profile"
            sx={{
              justifyContent: "center",
              gap: 1,
              color: "#1976d2",
              m: 1,
              border: 1,
              borderRadius: 1,
            }}
          >
            {/* <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}> */}
            <Avatar src={userImage || "/dummy-image.jpg"} />
            {/* </IconButton> */}
            {/* <ShoppingCartIcon /> */}
            <ListItemText primary="Profile" sx={{ textAlign: "center" }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              justifyContent: "center",
              gap: 1,
              color: "#1976d2",
              m: 1,
              mt: 55,
              border: 1,
              borderRadius: 1,
            }}
          >
            <LogoutIcon />
            <ListItemText primary="Logout" sx={{ textAlign: "center" }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            {pathname === "/" && (
              <Box sx={{ display: { xs: "flex", sm: "none" } }}>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="Search Product"
                    inputProps={{ "aria-label": "search" }}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  {searchText && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchText("")}
                      sx={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "inherit",
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Search>
              </Box>
            )}
            <Typography
              variant="h6"
              component="div"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              MRK-ECOM
            </Typography>
          </Box>

          <Box
            sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}
          >
            {pathname === "/" && (
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Search Product…"
                  inputProps={{ "aria-label": "search" }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                {searchText && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchText("")}
                    sx={{
                      position: "absolute",
                      right: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "inherit",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Search>
            )}
            <NavLink to="/">
              {({ isActive }) => (
                <Button
                  sx={{
                    fontWeight: isActive ? "bold" : "normal",
                    color: "white",
                  }}
                >
                  Home
                </Button>
              )}
            </NavLink>
            {userType === "admin" && (
              <NavLink to="/addproduct">
                {({ isActive }) => (
                  <Button
                    sx={{
                      fontWeight: isActive ? "bold" : "normal",
                      color: "white",
                    }}
                  >
                    Add Product
                  </Button>
                )}
              </NavLink>
            )}

            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar src={userImage || "/dummy-image.jpg"} />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography
                  sx={{ textAlign: "center" }}
                  onClick={() => {
                    navigate("/profile");
                  }}
                >
                  Profile
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography
                  sx={{ textAlign: "center" }}
                  onClick={() => {
                    navigate("/cart");
                  }}
                >
                  Cart
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography sx={{ textAlign: "center" }} onClick={handleLogout}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
      <Box component="main" sx={{ p: 3 }} />
    </Box>
  );
}

NavBar.propTypes = {
  window: PropTypes.func,
  setSearchValue: PropTypes.func.isRequired,
};

export default NavBar;
