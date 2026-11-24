import React from 'react';
import PropTypes from 'prop-types';
import { REGISTER_ANCHOR } from '../../data/content';
import styles from './ProgramCard.module.css';

export default function ProgramCard({ program, onSelect }) {
  const {
    id, title, meta, text, image,
  } = program;

  return (
    <article className={styles.card} aria-labelledby={`program-${id}`}>
      <img
        className={styles.image}
        src={image.src}
        width="640"
        height="420"
        alt={image.alt}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.body}>
        <h3 id={`program-${id}`} className={styles.title}>{title}</h3>
        <p className={styles.meta}>{meta}</p>
        <p className={styles.text}>{text}</p>
        <a className={styles.link} href={REGISTER_ANCHOR} onClick={() => onSelect(id)}>
          View program
          <span className={styles.visuallyHidden}>{`: ${title}`}</span>
          <span aria-hidden="true">&nbsp;&rarr;</span>
        </a>
      </div>
    </article>
  );
}

ProgramCard.propTypes = {
  program: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    meta: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    image: PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
};
