// LayoutNoHeader.tsx
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';

export default function LayoutNoHeader() {
  return (
    <div className="flex-column justify-flex-start min-100-vh">
      <div className="container">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}