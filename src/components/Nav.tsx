"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/i18n/LanguageProvider";

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { translations: t } = useTranslation();
  const pageTitleByPath: Record<string, string> = {
    "/": t.nav.pages.home,
    "/log": t.nav.pages.log,
    "/check-in": t.nav.pages.checkIn,
    "/workout": t.nav.pages.workout,
    "/settings": t.nav.pages.settings
  };
  const pageTitle = pageTitleByPath[pathname] ?? t.nav.brandName;

  return (
    <header className="topbar-wrap">
      <nav className="topbar" aria-label={t.nav.mainNavigationLabel}>
        <strong className="topbar-brand">{t.nav.brandName}</strong>
        <strong className="topbar-page-title" aria-live="polite">
          {pageTitle}
        </strong>
        <button
          className="topbar-menu-button"
          type="button"
          aria-label={t.nav.menuOpenLabel}
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
            {t.nav.pages.home}
          </Link>
          <Link className="topbar-menu-link" href="/log" role="menuitem" onClick={() => setMenuOpen(false)}>
            {t.nav.pages.log}
          </Link>
          <Link className="topbar-menu-link" href="/check-in" role="menuitem" onClick={() => setMenuOpen(false)}>
            {t.nav.pages.checkIn}
          </Link>
          <Link className="topbar-menu-link" href="/workout" role="menuitem" onClick={() => setMenuOpen(false)}>
            {t.nav.pages.workout}
          </Link>
          <Link className="topbar-menu-link" href="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
            {t.nav.pages.settings}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
