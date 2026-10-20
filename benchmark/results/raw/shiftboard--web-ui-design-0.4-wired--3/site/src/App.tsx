import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components';
import { Schedule } from './pages/Schedule';
import { Staff } from './pages/Staff';
import { TimeOff } from './pages/TimeOff';

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Schedule />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/time-off" element={<TimeOff />} />
        <Route path="*" element={<Schedule />} />
      </Routes>
    </AppShell>
  );
}
