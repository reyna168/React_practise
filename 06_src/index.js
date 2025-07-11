import React from "react";
import ReactDOM from "react-dom/client";  // 👈 注意這裡是 'react-dom/client'

import App from "./App";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
