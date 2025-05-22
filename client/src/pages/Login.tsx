import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';
import Auth from '../utils/auth';

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [login, { error, data }] = useMutation(LOGIN_USER);
  const navigate = useNavigate();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data } = await login({
        variables: { ...formState },
      });
      Auth.login(data.login.token);
    } catch (e) {
      console.error(e);
    }
    setFormState({
      email: '',
      password: '',
    });
  };

  return (
    <div className="login-background">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <span style={{ fontSize: '2rem', marginRight: '8px' }}>←</span> Back
      </button>
      <img src="/logo.png" alt="TransCARrency Logo" className="logo" />
      <h2 className="login-title">
        Welcome to TransCARrency! Please enter your username or email to login.
      </h2>
      {data ? (
        <div className="login-success">
          Success! You may now head <Link to="/">back to the homepage.</Link>
        </div>
      ) : (
        <form className="login-form" onSubmit={handleFormSubmit}>
          <input
            className="login-input"
            placeholder="Username or email"
            name="email"
            type="text"
            value={formState.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <input
            className="login-input"
            placeholder="Password"
            name="password"
            type="password"
            value={formState.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <button className="login-btn" type="submit">
            Log In
          </button>
        </form>
      )}
      {error && (
        <div className="login-error">
          {error.message}
        </div>
      )}
      <div className="login-google-label">Log In With Google</div>
      <button className="google-btn" type="button">
        <img src="/google-icon.svg" alt="Google" className="google-icon" /> Google Login
      </button>
    </div>
  );
};

export default Login;