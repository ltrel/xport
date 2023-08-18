import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';

const drawerItems = [
  {
    key: 'trades',
    text: 'Trade History',
    route: '/trades',
  },
  {
    key: 'about',
    text: 'About',
    route: '/about',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Typography variant="h4" sx={{ textAlign: 'center', my: 1, fontFamily: 'Monospace' }}>
          xport
        </Typography>
        <Divider />
        <List>
          {drawerItems.map(({ key, text, route }) => (
            <ListItem key={key} disablePadding>
              <ListItemButton onClick={() => navigate(route)}>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 3, overflow: 'hidden', minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
