import React from 'react';
import PropTypes from 'prop-types';
import styles from './SectionHeader.module.css';

export default function SectionHeader({ id, heading, intro = '' }) {
  return (
    <div className={styles.header}>
      <h2 id={id} className={styles.heading}>{heading}</h2>
      {intro && <p className={styles.intro}>{intro}</p>}
    </div>
  );
}

SectionHeader.propTypes = {
  id: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  intro: PropTypes.string,
};
