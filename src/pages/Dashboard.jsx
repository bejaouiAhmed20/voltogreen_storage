import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/voltogreenlogo_withoutbg.png";

import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Chip,
  Avatar,
  Fade,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { People, Build, Assignment, BarChart, Settings, Logout, AccountCircle, Assessment, Work } from "@mui/icons-material";

const drawerWidth = 260;

const menuItems = [
  { text: "Statistiques", icon: <BarChart />, path: "/dashboard/stats" },
  { text: "Utilisateurs", icon: <People />, path: "/dashboard/users" },
  { text: "Projets", icon: <Work />, path: "/dashboard/projects" },
  { text: "Outils", icon: <Build />, path: "/dashboard/tools" },
  { text: "Prêts", icon: <Assignment />, path: "/dashboard/loan" },
  { text: "Activité", icon: <Assessment />, path: "/dashboard/activity" },
  { text: "Maintenance", icon: <Settings />, path: "/dashboard/maintenance" },
];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <Box className="flex min-h-screen bg-gray-50">
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1201,
          backgroundColor: "white",
          boxShadow: "0 1px 10px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Toolbar className="flex justify-between px-6">
          {/* Logo Section */}
          <Box className="flex items-center ">
           <Box className="flex items-center justify-center">
  <img
    src={logo}  
    alt="Voltogreen Logo"
    style={{
      width: 60,
      height: 60,
      objectFit: "contain",
    }}
  />
</Box>

            <Box>
              <Typography variant="h5" className="font-bold text-gray-900">
                Voltogreen
              </Typography>
            
            </Box>
          </Box>

          {/* User Menu */}
          <Box className="flex items-center space-x-3">
            <IconButton
              onClick={handleMenu}
              sx={{
                padding: "8px",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36,
                  backgroundColor: "#10b981",
                  fontSize: "0.875rem",
                  fontWeight: "bold",
                }}
              >
                A
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                elevation: 2,
                sx: {
                  mt: 1,
                  minWidth: 160,
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                }
              }}
            >
              <MenuItem onClick={() => {navigate("/dashboard/profile")}} className="flex items-center space-x-2">
                <AccountCircle sx={{ fontSize: 20, color: "#6b7280" }} />
                <Typography variant="body2" className="text-gray-700">
                  Mon Profil
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} className="flex items-center space-x-2">
                <Logout sx={{ fontSize: 20, color: "#6b7280" }} />
                <Typography variant="body2" className="text-gray-700">
                  Déconnexion
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            marginTop: "76px",
            backgroundColor: "white",
            borderRight: "1px solid #e5e7eb",
            boxShadow: "none",
          },
        }}
      >
        {/* Navigation Header */}
        {/* <Box className="p-6 pb-4">
          <Typography 
            variant="subtitle2" 
            className="font-semibold text-gray-500 uppercase tracking-wider text-xs"
          >
            Navigation
          </Typography>
        </Box> */}

        {/* Menu Items */}
        <List className="px-3 space-y-1">
          {menuItems.map((item, index) => (
            <Fade in={true} timeout={200 + index * 80} key={item.text}>
              <ListItem
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: "10px",
                  marginBottom: "4px",
                  backgroundColor: location.pathname === item.path ? "#ecfdf5" : "transparent",
                  color: location.pathname === item.path ? "#065f46" : "#4b5563",
                  border: location.pathname === item.path ? "1px solid #d1fae5" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: location.pathname === item.path ? "#ecfdf5" : "#f9fafb",
                    border: "1px solid #e5e7eb",
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: location.pathname === item.path ? "#059669" : "#6b7280",
                    minWidth: "44px",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? "600" : "500",
                    fontSize: "0.9rem",
                  }}
                />
              </ListItem>
            </Fade>
          ))}
        </List>

        {/* Sidebar Footer */}
        <Box className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
          <Box className="flex items-center justify-center space-x-2">
            <Box 
              className="w-6 h-6 rounded flex items-center justify-center"
              sx={{ 
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              }}
            >
              <Typography variant="caption" className="text-white font-bold text-xs">
                V
              </Typography>
            </Box>
            <Typography 
              variant="caption" 
              className="text-gray-400 text-center"
            >
              Voltogreen v1.0
            </Typography>
          </Box>
        </Box>
      </Drawer>
      
      {/* Main Content */}
      <Fade in={true} timeout={300}>
  <Box sx={{ px: 4, py: 10 }}>
    <Outlet />
  </Box>
</Fade>



    </Box>
  );
}