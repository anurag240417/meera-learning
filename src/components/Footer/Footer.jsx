import React from 'react';
import Container from '../Container/Container';
import { FOOTER } from '../../data/content';
import styles from './Footer.module.css';

export default function Footer() {
  const { name, tagline, year } = FOOTER;

  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p className={styles.name}>{name}</p>
        <p>{tagline}</p>
        <p className={styles.copyright}>
          <small>{`© ${year} ${name}`}</small>
        </p>
      </Container>
    </footer>
  );
}
