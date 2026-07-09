export const MIN_PASSWORD_LENGTH = 6;

export type AuthValidationField = 'email' | 'password';

export interface AuthValidationError {
  field: AuthValidationField;
  message: string;
}

export interface AuthValidationResult {
  isValid: boolean;
  normalizedEmail: string;
  errors: AuthValidationError[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAuthEmail(email: string): string {
  return email.trim();
}

export function validateAuthCredentials(
  email: string,
  password: string,
): AuthValidationResult {
  const normalizedEmail = normalizeAuthEmail(email);
  const errors: AuthValidationError[] = [];

  if (normalizedEmail.length === 0) {
    errors.push({ field: 'email', message: 'Email is required.' });
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.push({ field: 'email', message: 'Enter a valid email address.' });
  }

  if (password.length === 0) {
    errors.push({ field: 'password', message: 'Password is required.' });
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  }

  return {
    isValid: errors.length === 0,
    normalizedEmail,
    errors,
  };
}
