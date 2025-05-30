import { Link } from 'react-router-dom';
import tclogo from '../../assets/tclogo_simple.png';
import { type MouseEvent} from 'react';
import Auth from '../../utils/auth';

const Header = () => {
  const logout = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    Auth.logout();
  };
  return (
    <header className="bg-black shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src={tclogo} alt="TransCARrency Logo" style={{ width: '10vh' }} />
      </div>
      
      {/* Navigation */}
      <nav className="flex gap-6 text-gray-700 font-bold text-3xl">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <Link to="/forum" className="hover:text-blue-600 transition-colors">Forum</Link>
      </nav>
    </header>
  );
};

export default Header;
