import React from "react";
import LanguageSelector from "../../pages/login/components/LanguageSelector";
import Icon from "../AppIcon";
import { useAuthContext } from '../../context/AuthContext';

const TopBar = () => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Leaf" size={20} color="var(--color-primary)" />
          <span className="font-semibold text-card-foreground">AgriSmart</span>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSelector />
          {/* Logout button */}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default TopBar;

const LogoutButton = () => {
  const { logout } = useAuthContext();
  return (
    <button
      onClick={() => logout()}
      className="ml-2 inline-flex items-center px-3 py-1 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-agricultural"
    >
      <Icon name="LogOut" size={14} color="white" />
      <span className="ml-2 text-sm">Logout</span>
    </button>
  );
};


