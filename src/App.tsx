import { Snackbar, Alert } from '@mui/material';
import { Routes, Route, useLocation } from 'react-router-dom';
import RecipesPage from '@/pages/RecipesPage';
import CreateRecipePage from '@/pages/CreateRecipePage';
import CookPage from '@/pages/CookPage';
import MiniPlayer from '@/components/MiniPlayer';
import { useAppSelector } from '../src/store/index';
import type { RootState } from '../src/store/index';
import SessionTicker from '@/components/SessionTicker';
import Navbar from '@/components/Navbar';
import Box from '@mui/material/Box';
import { useState } from 'react';

export default function App() {
  const location = useLocation();
  const activeSession = useAppSelector((s: RootState) => s.session.activeSession);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' } | null>(null);

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <SessionTicker />
      <Navbar />
      <Routes>
        <Route path="/" element={<RecipesPage setSnackbar={setSnackbar} />} />
        <Route path="/create" element={<CreateRecipePage setSnackbar={setSnackbar} />} />
        <Route path="/cook/:id" element={<CookPage />} />
      </Routes>
      {activeSession && !location.pathname.startsWith('/cook/') && (
        <MiniPlayer />
      )}
      <Snackbar
        open={!!snackbar?.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar?.severity ?? 'success'} onClose={() => setSnackbar(null)}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


