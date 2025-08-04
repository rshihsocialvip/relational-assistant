import { AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/AppLayout';

const Index = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;