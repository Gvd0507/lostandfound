import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  AccountCircle,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, signout } = useAuth();
  const { unreadCount, markAllNotificationsAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async () => {
    // Mark all notifications as read when clicking the bell
    if (unreadCount > 0) {
      await markAllNotificationsAsRead();
    }
    navigate('/matches');
  };

  const handleLogout = async () => {
    try {
      await signout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Campus Lost & Found
        </Typography>

        {currentUser && (
          <>
            <Button
              color="inherit"
              startIcon={<SearchIcon />}
              onClick={() => navigate('/browse')}
            >
              Browse
            </Button>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => navigate('/report')}
            >
              Report
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/my-reports')}
            >
              My Reports
            </Button>
            <Button
              color="inherit"
              onClick={handleNotificationClick}
            >
              Matches
            </Button>

            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/matches')}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              aria-label="account"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {currentUser.photoURL ? (
                <Avatar src={currentUser.photoURL} alt={currentUser.displayName} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {currentUser.email}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
