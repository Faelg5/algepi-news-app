import AppNavigation from './src/navigation';
import { QueryClient, QueryClientProvider } from 'react-query'; // Import the query client and provider
import { LogBox } from 'react-native';


LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications

const queryClient = new QueryClient(); // Create a new instance of the query client

export default function App() {
  
  return (
  <QueryClientProvider client={queryClient}>
    <AppNavigation/>
  </QueryClientProvider>
);
}


