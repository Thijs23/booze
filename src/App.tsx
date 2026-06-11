import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './store/DataContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { BatchList } from './pages/BatchList';
import { BatchDetail } from './pages/BatchDetail';
import { BatchForm } from './pages/BatchForm';
import { SettingsPage } from './pages/SettingsPage';
import './App.css';

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter basename="/booze">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/batches" element={<BatchList />} />
            <Route path="/batches/:id" element={<BatchDetail />} />
            <Route path="/batches/:id/edit" element={<BatchForm />} />
            <Route path="/new" element={<BatchForm />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </DataProvider>
  );
}
