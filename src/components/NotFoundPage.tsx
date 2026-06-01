import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';

export const NotFoundPage: FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: 48,
        textAlign: 'center',
      }}
    >
      <h1>Page not found</h1>
      <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>The page you are looking for does not exist.</p>
      <button
        onClick={() => {
          navigate({ to: '/home' });
        }}
        type="button"
      >
        Go home
      </button>
    </div>
  );
};
