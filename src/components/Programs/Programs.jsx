import React from 'react';
import PropTypes from 'prop-types';
import Container from '../Container/Container';
import SectionHeader from '../SectionHeader/SectionHeader';
import ProgramCard from './ProgramCard';
import { PROGRAMS } from '../../data/content';
import styles from './Programs.module.css';

export default function Programs({ onSelectProgram }) {
  return (
    <section id="programs" className={styles.section} aria-labelledby="programs-heading">
      <Container>
        <SectionHeader id="programs-heading" heading={PROGRAMS.heading} intro={PROGRAMS.intro} />
        <ul className={styles.list}>
          {PROGRAMS.items.map((program) => (
            <li key={program.id}>
              <ProgramCard program={program} onSelect={onSelectProgram} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

Programs.propTypes = {
  onSelectProgram: PropTypes.func.isRequired,
};
