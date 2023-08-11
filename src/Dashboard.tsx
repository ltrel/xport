import {
  Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemText,
} from '@mui/material';
import TradeHistory from './TradeHistory';

export default function Dashboard() {
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
        <List>
          {['My Portfolio', 'Trade History', 'Settings'].map((text) => (
            <ListItem key={text} disablePadding>
              <ListItemButton>
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
        <TradeHistory />
      </Box>
    </Box>
  );
}
