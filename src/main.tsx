import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';
import "react-toggle/style.css"
import './styles/index.scss';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
