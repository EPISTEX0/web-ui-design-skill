import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components';
import { Schedule } from './pages/Schedule';
import { Staff } from './pages/Staff';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Schedule />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="*" element={<Schedule />} />
      </Routes>
    </AppShell>
  );
}
