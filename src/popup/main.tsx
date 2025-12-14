import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '../shared/i18n.service'; // Init i18n
import { I18nService } from '../shared/i18n.service';

I18nService.init();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
