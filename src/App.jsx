import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";
import Routes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <Routes />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
