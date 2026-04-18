"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitleByPath: Record<string, string> = {
  "/": "Dashboard",
  "/log": "Log Today",
  "/check-in": "Check-in",
  "/settings": "Settings"
};

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = pageTitleByPath[pathname] ?? "Health tracker";

  return (
    <header className="topbar-wrap">
      <nav className="topbar" aria-label="Main navigation">
        <strong className="topbar-brand">Health tracker</strong>
        <strong className="topbar-page-title" aria-live="polite">
          {pageTitle}
        </strong>
        <button
          className="topbar-menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="main-menu-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </nav>

      {menuOpen ? (
        <div id="main-menu-panel" className="topbar-menu-panel" role="menu">
          <Link className="topbar-menu-link" href="/" role="menuitem" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link className="topbar-menu-link" href="/log" role="menuitem" onClick={() => setMenuOpen(false)}>
            Log Today
          </Link>
          <Link className="topbar-menu-link" href="/check-in" role="menuitem" onClick={() => setMenuOpen(false)}>
            Check-in
          </Link>
          <Link className="topbar-menu-link" href="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
            Settings
          </Link>
        </div>
      ) : null}
    </header>
  );
}
