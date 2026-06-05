import { createContext } from "react";

// Define the static store name once
const STORE_NAME = "WebSchema";

// Create the context with the default value
export const StoreContext = createContext(STORE_NAME);

// Provider component
export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  return <StoreContext.Provider value={STORE_NAME}>{children}</StoreContext.Provider>;
};
