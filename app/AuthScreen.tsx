import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { validateAuthCredentials } from './authValidation';
import { auth, isFirebaseConfigured, missingFirebaseConfigKeys } from './firebase';

type AuthMode = 'sign-in' | 'sign-up';

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace('Firebase: ', '');
  }

  return 'Authentication failed. Please try again.';
}

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === 'sign-up';
  const validation = validateAuthCredentials(email, password);
  const canSubmit = Boolean(auth) && validation.isValid;

  async function handleSubmit() {
    const validationResult = validateAuthCredentials(email, password);

    if (!auth || !validationResult.isValid) {
      if (auth) {
        setErrorMessage(validationResult.errors[0]?.message ?? null);
      }

      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(
          auth,
          validationResult.normalizedEmail,
          password,
        );
      } else {
        await signInWithEmailAndPassword(auth, validationResult.normalizedEmail, password);
      }
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>PORTFOLIO MINI</Text>
            <Text style={styles.title}>{isSignUp ? 'Create your account.' : 'Welcome back.'}</Text>
            <Text style={styles.subtitle}>
              Sign in with email and password to view your portfolio snapshot.
            </Text>
          </View>

          {!isFirebaseConfigured ? (
            <View style={styles.configWarning}>
              <Text style={styles.configTitle}>Firebase config required</Text>
              <Text style={styles.configText}>
                Add the missing Expo public Firebase values before using authentication:
              </Text>
              <Text style={styles.configKeys}>{missingFirebaseConfigKeys.join(', ')}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting && Boolean(auth)}
              inputMode="email"
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor="#839088"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
            />
            <TextInput
              editable={!isSubmitting && Boolean(auth)}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#839088"
              secureTextEntry
              style={styles.input}
              textContentType={isSignUp ? 'newPassword' : 'password'}
              value={password}
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              disabled={!canSubmit || isSubmitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                (!canSubmit || isSubmitting) && styles.disabledButton,
                pressed && canSubmit ? styles.pressedButton : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>{isSignUp ? 'Sign up' : 'Sign in'}</Text>
              )}
            </Pressable>
          </View>

          <Pressable
            disabled={isSubmitting}
            onPress={() => {
              setErrorMessage(null);
              setMode(isSignUp ? 'sign-in' : 'sign-up');
            }}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F2',
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 28,
  },
  eyebrow: {
    marginBottom: 12,
    color: '#41644A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  title: {
    maxWidth: 320,
    color: '#142018',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    maxWidth: 340,
    marginTop: 14,
    color: '#607067',
    fontSize: 16,
    lineHeight: 24,
  },
  configWarning: {
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#B45309',
    backgroundColor: '#FFF7ED',
    padding: 14,
  },
  configTitle: {
    color: '#7C2D12',
    fontSize: 15,
    fontWeight: '700',
  },
  configText: {
    marginTop: 6,
    color: '#9A3412',
    fontSize: 14,
    lineHeight: 20,
  },
  configKeys: {
    marginTop: 6,
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  form: {
    gap: 12,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#CAD3CB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    color: '#142018',
    fontSize: 16,
  },
  errorText: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#41644A',
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.86,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  switchButton: {
    alignSelf: 'center',
    marginTop: 24,
    padding: 8,
  },
  switchText: {
    color: '#41644A',
    fontSize: 15,
    fontWeight: '700',
  },
});
