import { SnackbarProvider } from 'notistack';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from './Dashboard';
import TradeHistory from './TradeHistory';
import About from './About';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    children: [
      {
        index: true,
        element: <TradeHistory />,
      },
      {
        path: "trades",
        element: <TradeHistory />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },
]);

function App() {
  return (
    <SnackbarProvider>
      <RouterProvider router={router} />
    </SnackbarProvider>
  );
}

export default App;
