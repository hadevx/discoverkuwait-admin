import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { setupListeners } from "@reduxjs/toolkit/query";
import ToastWrapper from "./ToastWrapper";

setupListeners(store.dispatch);

const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastWrapper>
          <App />
        </ToastWrapper>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
