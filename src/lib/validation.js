// Mirrors the rules in api/server.mjs so the client never sends a request the API would reject.

export const PROGRAM_IDS = ['foundations', 'focus', 'career'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;

export function validateField(name, values) {
  switch (name) {
    case 'fullName': {
      const value = values.fullName.trim();
      if (!value) return 'Enter your full name.';
      if (value.length < NAME_MIN || value.length > NAME_MAX) {
        return `Enter a name between ${NAME_MIN} and ${NAME_MAX} characters.`;
      }
      return '';
    }
    case 'email': {
      const value = values.email.trim();
      if (!value) return 'Enter your email address.';
      if (value.length > EMAIL_MAX || !EMAIL_PATTERN.test(value)) {
        return 'Enter a valid email address, like name@example.com.';
      }
      return '';
    }
    case 'programInterest':
      return PROGRAM_IDS.includes(values.programInterest) ? '' : 'Choose a program.';
    case 'consent':
      return values.consent === true ? '' : 'Tick the box to agree to be contacted.';
    default:
      return '';
  }
}

export const FIELD_ORDER = ['fullName', 'email', 'programInterest', 'consent'];

export function validateRegistration(values) {
  return FIELD_ORDER.reduce((errors, name) => {
    const message = validateField(name, values);
    return message ? { ...errors, [name]: message } : errors;
  }, {});
}
