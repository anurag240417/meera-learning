import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import Container from '../Container/Container';
import Button from '../Button/Button';
import { NAV_LINKS, REGISTER_ANCHOR } from '../../data/content';
import styles from './Header.module.css';

const DESKTOP_QUERY = '(min-width: 768px)';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef(null);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const desktop = window.matchMedia(DESKTOP_QUERY);
    const handleViewportChange = (event) => {
      if (event.matches) setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleViewportChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleViewportChange);
    };
  }, [isOpen]);

  return (
    <header className={styles.header}>
      <Container className={styles.bar}>
        <a className={styles.brand} href="#top">
          <img
            src="/assets/logo.svg"
            width="340"
            height="70"
            alt="Meera Verma Learning Studio, back to top"
          />
        </a>

        <button
          ref={menuButtonRef}
          type="button"
          className={styles.menuButton}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          <span className={styles.menuIcon} aria-hidden="true" data-open={isOpen} />
          <span className={styles.menuLabel}>{isOpen ? 'Close menu' : 'Menu'}</span>
        </button>

        <nav
          id="site-navigation"
          className={styles.nav}
          data-open={isOpen}
          aria-label="Main"
        >
          <ul className={styles.list}>
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <a className={styles.link} href={href} onClick={closeMenu}>{label}</a>
              </li>
            ))}
            <li className={styles.ctaItem}>
              <Button href={REGISTER_ANCHOR} size="small" onClick={closeMenu}>
                Reserve a call
              </Button>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
