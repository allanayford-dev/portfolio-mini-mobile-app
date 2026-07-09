import {
  MIN_PASSWORD_LENGTH,
  normalizeAuthEmail,
  validateAuthCredentials,
  type AuthValidationError,
} from '../app/authValidation';

interface TestCase {
  name: string;
  run: () => void;
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}\nExpected: ${String(expected)}\nReceived: ${String(actual)}`);
  }
}

function assertErrors(
  actual: AuthValidationError[],
  expected: AuthValidationError[],
  message: string,
): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nReceived: ${actualJson}`);
  }
}

const tests: TestCase[] = [
  {
    name: 'accepts a valid email and password',
    run: () => {
      const result = validateAuthCredentials('allan@example.com', 'secret1');

      assertEqual(result.isValid, true, 'Expected credentials to be valid.');
      assertEqual(result.normalizedEmail, 'allan@example.com', 'Expected email to remain unchanged.');
      assertErrors(result.errors, [], 'Expected no validation errors.');
    },
  },
  {
    name: 'trims surrounding email whitespace',
    run: () => {
      assertEqual(
        normalizeAuthEmail('  allan@example.com  '),
        'allan@example.com',
        'Expected surrounding whitespace to be removed.',
      );

      const result = validateAuthCredentials('  allan@example.com  ', 'secret1');
      assertEqual(result.isValid, true, 'Expected trimmed credentials to be valid.');
      assertEqual(result.normalizedEmail, 'allan@example.com', 'Expected normalized email.');
    },
  },
  {
    name: 'rejects a blank email',
    run: () => {
      const result = validateAuthCredentials('   ', 'secret1');

      assertEqual(result.isValid, false, 'Expected credentials to be invalid.');
      assertErrors(
        result.errors,
        [{ field: 'email', message: 'Email is required.' }],
        'Expected an email-required error.',
      );
    },
  },
  {
    name: 'rejects a malformed email',
    run: () => {
      const result = validateAuthCredentials('allan.example.com', 'secret1');

      assertEqual(result.isValid, false, 'Expected credentials to be invalid.');
      assertErrors(
        result.errors,
        [{ field: 'email', message: 'Enter a valid email address.' }],
        'Expected an invalid-email error.',
      );
    },
  },
  {
    name: 'rejects a blank password',
    run: () => {
      const result = validateAuthCredentials('allan@example.com', '');

      assertEqual(result.isValid, false, 'Expected credentials to be invalid.');
      assertErrors(
        result.errors,
        [{ field: 'password', message: 'Password is required.' }],
        'Expected a password-required error.',
      );
    },
  },
  {
    name: 'rejects a password shorter than the Firebase minimum',
    run: () => {
      const result = validateAuthCredentials('allan@example.com', '12345');

      assertEqual(result.isValid, false, 'Expected credentials to be invalid.');
      assertErrors(
        result.errors,
        [
          {
            field: 'password',
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
          },
        ],
        'Expected a password-length error.',
      );
    },
  },
  {
    name: 'accepts a password exactly at the minimum length',
    run: () => {
      const result = validateAuthCredentials('allan@example.com', '123456');

      assertEqual(result.isValid, true, 'Expected a six-character password to be valid.');
      assertErrors(result.errors, [], 'Expected no validation errors.');
    },
  },
  {
    name: 'returns email and password errors together',
    run: () => {
      const result = validateAuthCredentials('invalid', '123');

      assertEqual(result.isValid, false, 'Expected credentials to be invalid.');
      assertErrors(
        result.errors,
        [
          { field: 'email', message: 'Enter a valid email address.' },
          {
            field: 'password',
            message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
          },
        ],
        'Expected both validation errors.',
      );
    },
  },
];

let failedTests = 0;

for (const test of tests) {
  try {
    test.run();
    console.log(`PASS ${test.name}`);
  } catch (error) {
    failedTests += 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL ${test.name}\n${message}`);
  }
}

if (failedTests > 0) {
  throw new Error(`${failedTests} validation test${failedTests === 1 ? '' : 's'} failed.`);
}

console.log(`\n${tests.length} validation tests passed.`);
