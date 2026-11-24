import React from 'react';
import Container from '../Container/Container';
import SectionHeader from '../SectionHeader/SectionHeader';
import { BENEFITS } from '../../data/content';
import styles from './Benefits.module.css';

export default function Benefits() {
  return (
    <section id="why-us" className={styles.section} aria-labelledby="why-us-heading">
      <Container>
        <SectionHeader id="why-us-heading" heading={BENEFITS.heading} intro={BENEFITS.intro} />
        <ol className={styles.list}>
          {BENEFITS.items.map(({ title, text }, index) => (
            <li key={title} className={styles.card}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.text}>{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
