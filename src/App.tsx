import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SharedLayout } from '@/layout/SharedLayout';
import { DayDetailsPage } from '@/pages/days/day-details-page';
import { DaysPage } from '@/pages/days/days-page';
import { OrdersPage } from '@/pages/orders/orders-page';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<SharedLayout />}>
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/days" element={<DaysPage />} />
          <Route path="/days/:date" element={<DayDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Routes>
    </HashRouter>
  );
}
