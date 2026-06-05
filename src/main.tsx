import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import ToastWrapper from "./ToastWrapper";

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
