import React from "react";
import { Outlet } from "react-router-dom";
import Header from "@frontend/components/layout/Header";
import Footer from "@frontend/components/layout/Footer";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[1200] focus:rounded-lg focus:bg-primary-darker focus:px-4 focus:py-2 focus:text-white"
      >
        Перейти к содержимому
      </a>
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;