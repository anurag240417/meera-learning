import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Container from '../Container/Container';
import SectionHeader from '../SectionHeader/SectionHeader';
import Button from '../Button/Button';
import { PROGRAMS, REGISTRATION } from '../../data/content';
import {
  EMAIL_MAX, FIELD_ORDER, NAME_MAX, validateField, validateRegistration,
} from '../../lib/validation';
import {
  isRegistrationApiConfigured,
  RegistrationNetworkError,
  submitRegistration,
} from '../../lib/registrationApi';
import styles from './RegistrationForm.module.css';

const INITIAL_VALUES = {
  fullName: '',
  email: '',
  programInterest: '',
  consent: false,
};

const STATUS_MESSAGES = {
  400: 'Some details were not accepted. Check the form and try again.',
  429: 'Too many requests. Please wait a minute and try again.',
  default: 'Something went wrong on our side. Your details are still here, so please try again.',
  network: 'We could not reach the registration service. Check your connection and try again. Your details are still here.',
  notConfigured: 'Online registration is not connected on this preview site, so nothing was sent. Your details are still here.',
};

function errorId(name) {
  return `register-${name}-error`;
}

export default function RegistrationForm({ programRequest = null }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fieldRefs = useRef({});
  const feedbackRef = useRef(null);

  // A "View program" link preselects that program without clearing other fields.
  useEffect(() => {
    if (!programRequest) return;
    setValues((current) => ({ ...current, programInterest: programRequest.id }));
    setErrors((current) => ({ ...current, programInterest: '' }));
  }, [programRequest]);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
  }, [feedback]);

  const registerField = (name) => (element) => {
    fieldRefs.current[name] = element;
  };

  const handleChange = (event) => {
    const {
      name, type, value, checked,
    } = event.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    if (touched[name] || errors[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, next) }));
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, values) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setTouched(FIELD_ORDER.reduce((all, name) => ({ ...all, [name]: true }), {}));

    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      setFeedback(null);
      fieldRefs.current[firstInvalid]?.focus();
      return;
    }

    if (!isRegistrationApiConfigured) {
      setFeedback({ type: 'error', message: STATUS_MESSAGES.notConfigured });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const result = await submitRegistration({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        programInterest: values.programInterest,
        consent: values.consent,
      });

      if (result.ok) {
        setValues(INITIAL_VALUES);
        setTouched({});
        setFeedback({
          type: 'success',
          message: `${result.message || 'Your request has been received.'} We will be in touch soon.`,
          reference: result.reference,
        });
      } else {
        const fallback = STATUS_MESSAGES[result.status] || STATUS_MESSAGES.default;
        const message = result.status === 400 && result.message
          ? `${result.message} ${STATUS_MESSAGES[400]}`
          : fallback;
        setFeedback({ type: 'error', message });
      }
    } catch (error) {
      const message = error instanceof RegistrationNetworkError
        ? STATUS_MESSAGES.network
        : STATUS_MESSAGES.default;
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const describedBy = (name) => (errors[name] ? errorId(name) : undefined);

  const renderError = (name) => (errors[name] ? (
    <p id={errorId(name)} className={styles.error}>{errors[name]}</p>
  ) : null);

  return (
    <section id="register" className={styles.section} aria-labelledby="register-heading">
      <Container>
        <SectionHeader
          id="register-heading"
          heading={REGISTRATION.heading}
          intro={REGISTRATION.intro}
        />

        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-describedby="register-privacy"
          aria-busy={isSubmitting}
        >
          <p className={styles.requiredNote}>All fields are required.</p>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-fullName">
                <span className={styles.labelText}>Full name</span>
                <input
                  id="register-fullName"
                  name="fullName"
                  ref={registerField('fullName')}
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  placeholder="Your name"
                  required
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={describedBy('fullName')}
                />
              </label>
              {renderError('fullName')}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-email">
                <span className={styles.labelText}>Email address</span>
                <input
                  id="register-email"
                  name="email"
                  ref={registerField('email')}
                  className={styles.input}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  spellCheck={false}
                  maxLength={EMAIL_MAX}
                  placeholder="name@example.com"
                  required
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy('email')}
                />
              </label>
              {renderError('email')}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="register-programInterest">
                <span className={styles.labelText}>Program interest</span>
                <select
                  id="register-programInterest"
                  name="programInterest"
                  ref={registerField('programInterest')}
                  className={`${styles.input} ${styles.select}`}
                  required
                  value={values.programInterest}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.programInterest)}
                  aria-describedby={describedBy('programInterest')}
                >
                  <option value="" disabled>Select a program</option>
                  {PROGRAMS.items.map(({ id, title }) => (
                    <option key={id} value={id}>{title}</option>
                  ))}
                </select>
              </label>
              {renderError('programInterest')}
            </div>
          </div>

          <div className={styles.actions}>
            <div className={styles.consent}>
              <label className={styles.checkboxRow} htmlFor="register-consent">
                <input
                  id="register-consent"
                  name="consent"
                  ref={registerField('consent')}
                  className={styles.checkbox}
                  type="checkbox"
                  required
                  checked={values.consent}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={Boolean(errors.consent)}
                  aria-describedby={describedBy('consent')}
                />
                <span>{REGISTRATION.consentLabel}</span>
              </label>
              {renderError('consent')}
            </div>

            <div className={styles.submit}>
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting && <span className={styles.spinner} aria-hidden="true" />}
                {isSubmitting ? 'Sending request…' : REGISTRATION.cta}
              </Button>
            </div>
          </div>

          {feedback && (
            <div
              ref={feedbackRef}
              tabIndex={-1}
              role={feedback.type === 'success' ? 'status' : 'alert'}
              className={`${styles.feedback} ${feedback.type === 'success' ? styles.success : styles.failure}`}
            >
              <p>{feedback.message}</p>
              {feedback.reference && (
                <p className={styles.reference}>
                  {'Reference: '}
                  <span className={styles.referenceCode}>{feedback.reference}</span>
                </p>
              )}
            </div>
          )}

          <p id="register-privacy" className={styles.privacy}>{REGISTRATION.privacy}</p>
        </form>
      </Container>
    </section>
  );
}

RegistrationForm.propTypes = {
  programRequest: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nonce: PropTypes.number.isRequired,
  }),
};
