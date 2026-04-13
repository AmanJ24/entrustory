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
          background: '#131313',
          color: '#e5e5e5',
          border: '1px solid #262626',
          borderRadius: '12px',
          fontSize: '14px',
          padding: '12px 16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#131313' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#131313' },
        },
      }}
    />
    <App />
  </StrictMode>,
)
