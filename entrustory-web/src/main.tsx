import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster 
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111722',
          color: '#e2e8f0',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#111722' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#111722' },
        },
      }}
    />
    <App />
  </StrictMode>,
)
