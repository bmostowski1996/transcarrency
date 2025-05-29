import { useLocation, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <footer style={{
      width: '100%',
      padding: '2rem 1rem',
      marginTop: 'auto',
      background: 'linear-gradient(120deg, #1ec6f7 5%, #000 22.4%, #000 42%, #000 35%, #1ec6f7 125%)',
      color: '#fff',
    }}>
      <div style={{ textAlign: 'center' }}>
        {location.pathname !== '/' && (
          <button
            onClick={handleGoBack}
            style={{
              background: 'none',
              color: '#00e6e6',
              border: 'none',
              fontSize: '1.2rem',
              marginBottom: '1rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            ← Go Back
          </button>
        )}
        <div style={{ fontSize: '1rem', color: '#ccc' }}>
          © {new Date().getFullYear()} - <span style={{ color: '#00e6e6' }}>TransCarrency</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
