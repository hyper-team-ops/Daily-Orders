import { Navigate, useParams } from 'react-router-dom';
import { DayOrdersBoard } from '@/pages/orders/orders-page';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function DayDetailsPage() {
  const { date } = useParams();

  if (!date || !DATE_REGEX.test(date)) {
    return <Navigate to="/days" replace />;
  }

  return <DayOrdersBoard dateKey={date} />;
}
