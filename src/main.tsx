import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
 // your configured Redux store
import App from './App';
import { store } from './store/store';
import { createRoot } from 'react-dom/client';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);