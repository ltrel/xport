import { SnackbarProvider } from 'notistack';
import Dashboard from './Dashboard';

function App() {
  return (
    <SnackbarProvider>
      <Dashboard />
    </SnackbarProvider>
  );
}

export default App;
