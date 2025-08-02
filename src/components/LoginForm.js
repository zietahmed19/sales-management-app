import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin users list
  const adminUsers = ['mohcenacid', 'djalili', 'houcemacid'];
  const adminPassword = 'admin1234';

  // Demo delegate credentials
  const delegateCredentials = [
    { username: 'ahmed', password: '123456', territory: 'Algiers' },
    { username: 'fatima', password: '123456', territory: 'Oran' },
    { username: 'karim', password: '123456', territory: 'Constantine' },
    { username: 'sara', password: '123456', territory: 'Annaba' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let isValidLogin = false;
      let userRole = 'delegate';
      let territory = '';

      if (isAdminLogin) {
        // Admin login validation
        if (adminUsers.includes(username) && password === adminPassword) {
          isValidLogin = true;
          userRole = 'admin';
          territory = 'All Regions';
        }
      } else {
        // Delegate login validation
        const delegate = delegateCredentials.find(
          d => d.username === username && d.password === password
        );
        if (delegate) {
          isValidLogin = true;
          userRole = 'delegate';
          territory = delegate.territory;
        }
      }

      if (isValidLogin) {
        // Store user data
        localStorage.setItem('username', username);
        localStorage.setItem('userRole', userRole);
        localStorage.setItem('territory', territory);
        localStorage.setItem('token', 'demo-token-' + Date.now());

        // Call onLogin callback
        if (onLogin) {
          onLogin({
            username,
            role: userRole,
            territory,
            token: 'demo-token-' + Date.now()
          });
        }

        // Redirect based on role
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(isAdminLogin ? t('invalidAdminCredentials') : t('invalidCredentials'));
      }
    } catch (err) {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title text-center mb-4">
          {isAdminLogin ? t('adminLogin') : t('login')}
        </h3>

        {/* Login Type Switcher */}
        <div className="mb-3">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={`btn ${!isAdminLogin ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setIsAdminLogin(false)}
            >
              {t('delegateLogin')}
            </button>
            <button
              type="button"
              className={`btn ${isAdminLogin ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setIsAdminLogin(true)}
            >
              {t('adminLogin')}
            </button>
          </div>
        </div>

        {/* Credentials Helper */}
        <div className="alert alert-info small">
          <strong>{isAdminLogin ? t('adminCredentials') : t('delegateCredentials')}:</strong>
          <br />
          {isAdminLogin ? (
            <>
              {t('username')}: mohcenacid / djalili / houcemacid<br />
              {t('password')}: admin1234
            </>
          ) : (
            <>
              {t('username')}: ahmed / fatima / karim / sara<br />
              {t('password')}: 123456
            </>
          )}
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              {t('username')}
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={isAdminLogin ? "mohcenacid" : "ahmed"}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              {t('password')}
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isAdminLogin ? "admin1234" : "123456"}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? t('loading') : (isAdminLogin ? t('loginAsAdmin') : t('loginButton'))}
          </button>
        </form>

        {/* Quick Access Buttons */}
        <div className="mt-3">
          <small className="text-muted d-block text-center mb-2">
            {t('quickAccess')}:
          </small>
          <div className="d-grid gap-2">
            {isAdminLogin ? (
              adminUsers.map(admin => (
                <button
                  key={admin}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setUsername(admin);
                    setPassword(adminPassword);
                  }}
                >
                  {admin}
                </button>
              ))
            ) : (
              delegateCredentials.map(delegate => (
                <button
                  key={delegate.username}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setUsername(delegate.username);
                    setPassword(delegate.password);
                  }}
                >
                  {delegate.username} ({delegate.territory})
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
