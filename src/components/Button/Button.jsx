import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/** Renders a link when `href` is given, otherwise a native button. */
export default function Button({
  children,
  href = undefined,
  type = 'button',
  size = 'large',
  fullWidth = false,
  onClick = undefined,
  disabled = false,
}) {
  const className = [styles.button, styles[size], fullWidth ? styles.fullWidth : '']
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button className={className} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  href: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit']),
  size: PropTypes.oneOf(['small', 'large']),
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
};
