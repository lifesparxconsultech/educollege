import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import React from 'react';
import { ContentProvider } from './contexts/ContentContext.tsx';

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ContentProvider>
            <App />
        </ContentProvider>
    </React.StrictMode>,



);
