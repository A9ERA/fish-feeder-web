import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Feed as FeedIcon,
  Air as AirIcon,
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import '../styles/Layout.scss';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Feed Control', icon: <FeedIcon />, path: '/feed-control' },
  { text: 'Fan & Humidity Control', icon: <AirIcon />, path: '/fan-humidity' },
  { text: 'Motor & PWM Settings', icon: <SpeedIcon />, path: '/motor-settings' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const drawerContent = (
    <>
      {!isMobile && (
        <Box className="drawer-header">
          {open && (
            <Typography variant="h6" noWrap component="div">
              Fish Feeder
            </Typography>
          )}
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}
      <List className={`navigation-list ${isMobile ? 'mobile' : ''}`}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding 
            className={`navigation-item ${isMobile ? 'mobile' : ''}`}
          >
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              className={`navigation-button ${isMobile ? 'mobile' : ''} ${!open ? 'collapsed' : ''}`}
            >
              <ListItemIcon
                className={`navigation-icon ${isMobile ? 'mobile' : ''} ${!open ? 'collapsed' : ''}`}
              >
                {item.icon}
              </ListItemIcon>
              {(!isMobile && open) && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box className={`layout-container ${isMobile ? 'mobile' : ''}`}>
      {isMobile ? (
        <Box
          component="main"
          className="main-content mobile"
        >
          {children}
        </Box>
      ) : (
        <Drawer
          variant="permanent"
          className={`side-drawer ${!open ? 'collapsed' : ''}`}
          classes={{
            paper: `drawer-paper ${!open ? 'collapsed' : ''}`
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          variant="permanent"
          anchor="bottom"
          className="bottom-drawer"
          classes={{
            paper: 'drawer-paper'
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {!isMobile && (
        <Box
          component="main"
          className={`main-content ${!open ? 'collapsed' : ''}`}
        >
          {children}
        </Box>
      )}
    </Box>
  );
};

export default Layout; 