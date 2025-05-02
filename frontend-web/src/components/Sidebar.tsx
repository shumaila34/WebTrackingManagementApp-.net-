import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Dashboard,
  Assignment,
  Menu as MenuIcon,
  ChevronLeft,
} from "@mui/icons-material";

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <div className="flex">
      <Drawer
        variant="permanent"
        open={open}
        PaperProps={{
          sx: {
            backgroundColor: "#e0f2fe", // light blue background
            color: "#1e40af", // dark blue text
            width: open ? 240 : 70,
            transition: "width 0.3s",
            overflowX: "hidden",
            borderRight: "1px solid #cbd5e1",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        {/* Top Section - Menu */}
        <div>
          {/* Toggle Button */}
          <div className="flex justify-end p-2">
            <IconButton onClick={toggleSidebar}>
              {open ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
          </div>

          {/* Menu Items */}
          <List>
            {/* Dashboard */}
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to="/dashboard"
                selected={location.pathname === "/dashboard"}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  color:
                    location.pathname === "/dashboard" ? "#2563eb" : "inherit",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <Dashboard />
                </ListItemIcon>
                <ListItemText
                  primary="Dashboard"
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>

            {/* Tasks */}
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                component={Link}
                to="/tasks"
                selected={location.pathname === "/tasks"}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                  color: location.pathname === "/tasks" ? "#2563eb" : "inherit",
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 2 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="Tasks" sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </div>

        {/* Bottom Section - Profile Avatar */}
        <div className="flex justify-center p-4">
          <Tooltip title="Profile" placement="top">
            <IconButton>
              <Avatar sx={{ bgcolor: "#1e40af" }}>A</Avatar>{" "}
              {/* First letter of user name for now */}
            </IconButton>
          </Tooltip>
        </div>
      </Drawer>
    </div>
  );
};

export default Sidebar;
