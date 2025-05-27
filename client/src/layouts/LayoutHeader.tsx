// LayoutNoHeader.tsx
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LayoutHeader() {
  return (
    
    <div className="flex-column justify-flex-start min-100-vh space-y-6">
        <Header/>
        <div className="px-4">
            <Outlet />
        </div>
        <Footer />
    </div>
  );
}