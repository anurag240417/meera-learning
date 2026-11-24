import React from 'react';
import Container from '../Container/Container';
import SectionHeader from '../SectionHeader/SectionHeader';
import { FAQ } from '../../data/content';
import styles from './Faq.module.css';

export default function Faq() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-heading">
      <Container>
        <SectionHeader id="faq-heading" heading={FAQ.heading} />
        <dl className={styles.list}>
          {FAQ.items.map(({ question, answer }) => (
            <div key={question} className={styles.item}>
              <dt className={styles.question}>{question}</dt>
              <dd className={styles.answer}>{answer}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
