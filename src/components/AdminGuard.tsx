import { useState, useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Simple local storage persistence so you don't have to type it on every refresh during a session
  useEffect(() => {
    const savedSession = sessionStorage.getItem('admin_zone_auth');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Using a hardcoded password for the single-admin setup as requested.
    // In production, this can be moved to an env variable.
    if (password === 'cultifAdmin2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_zone_auth', 'true');
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#141414', padding: '3rem', borderRadius: '16px', border: '1px solid #333',
        width: '100%', maxWidth: '400px', textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>Restricted Zone</h2>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.9rem' }}>Enter admin password to continue.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Caps matter..."
            style={{
              padding: '1rem', borderRadius: '8px', border: error ? '1px solid #ff4444' : '1px solid #333',
              background: '#0a0a0a', color: 'white', fontSize: '1rem', outline: 'none'
            }}
            autoFocus
          />
          {error && <span style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'left' }}>Incorrect password</span>}
          <button 
            type="submit"
            style={{
              padding: '1rem', borderRadius: '8px', background: '#20b2aa', color: 'white',
              border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem'
            }}
          >
            Enter CMS
          </button>
        </form>
      </div>
    </div>
  );
}
