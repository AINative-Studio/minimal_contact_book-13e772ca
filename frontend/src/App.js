import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import LoginPage from './components/LoginPage';
import ContactManagementPage from './components/ContactManagementPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('ainative_token') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
    } else {
      // Optionally, verify the token here before setting loading to false
      setLoading(false);
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      const data = await response.json();
      localStorage.setItem('ainative_token', data.access_token);
      setToken(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setToken('');
  };

  if (loading) {
    return (
      <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <p>Loading...</p>
        </div>
      </AINativeProvider>
    );
  }

  if (error) {
    return (
      <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
        <div className="flex justify-center items-center h-screen bg-gray-100">
          <p className="text-red-500">{error}</p>
        </div>
      </AINativeProvider>
    );
  }

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <header className="bg-dark-navy text-white flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Minimal Contact Book</h1>
          <nav>
            <ul className="flex space-x-4">
              {token ? (
                <>
                  <li>
                    <Link to="/contacts" className="hover:text-blue-300">Contacts</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="hover:text-blue-300">Login</Link>
                </li>
              )}
            </ul>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/login" element={token ? <Navigate to="/contacts" /> : <LoginPage onLogin={handleLogin} />} />
            <Route path="/contacts" element={token ? <ContactManagementPage /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={token ? "/contacts" : "/login"} />} />
          </Routes>
        </main>
      </Router>
    </AINativeProvider>
  );
}

export default App;