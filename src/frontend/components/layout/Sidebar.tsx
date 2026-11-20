import React from "react";

export interface SidebarProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ title, children, className = "" }) => {
  return (
    <aside className={`w-64 shrink-0 border-r border-border bg-surface ${className}`}>
      {title && <div className="px-4 py-3 border-b border-border text-sm font-semibold text-text">{title}</div>}
      <div className="p-3">{children}</div>
    </aside>
  );
};

export default Sidebar;