import React from 'react';
import PropTypes from 'prop-types';
import styles from './Container.module.css';

export default function Container({ children, className = '' }) {
  return <div className={[styles.container, className].filter(Boolean).join(' ')}>{children}</div>;
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
