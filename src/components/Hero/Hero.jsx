import React from 'react';
import Container from '../Container/Container';
import Button from '../Button/Button';
import { HERO, REGISTER_ANCHOR } from '../../data/content';
import styles from './Hero.module.css';

export default function Hero() {
  const {
    eyebrow, headingLines, body, cta, image,
  } = HERO;

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <Container className={styles.grid}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="hero-heading" className={styles.heading}>
            {headingLines.map((line) => (
              <span key={line} className={styles.line}>{line}</span>
            ))}
          </h1>
          <p className={styles.body}>{body}</p>
          <Button href={REGISTER_ANCHOR}>{cta}</Button>
        </div>
        <img
          className={styles.image}
          src={image.src}
          width={image.width}
          height={image.height}
          alt={image.alt}
          decoding="async"
        />
      </Container>
    </section>
  );
}
