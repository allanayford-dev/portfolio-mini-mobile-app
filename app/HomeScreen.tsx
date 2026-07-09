import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { signOut } from 'firebase/auth';

import { PortfolioSummaryCard } from '../components/PortfolioSummaryCard';
import type { HoldingInput, PortfolioHolding } from '../types/portfolio';
import { formatCurrency } from '../utils/formatCurrency';
import {
  addHolding,
  deleteHolding,
  ensureSeedHoldings,
  subscribeToHoldings,
  updateHolding,
} from './holdingsRepository';
import { getHoldingMarketValue } from './portfolioCalculations';
import { auth, db } from './firebase';

type HomeScreenProps = {
  userEmail: string | null;
  userId: string;
};

type HoldingFormState = {
  ticker: string;
  name: string;
  quantity: string;
  averagePurchasePrice: string;
  currentPrice: string;
  notes: string;
};

const blankForm: HoldingFormState = {
  ticker: '',
  name: '',
  quantity: '',
  averagePurchasePrice: '',
  currentPrice: '',
  notes: '',
};

function formFromHolding(holding: PortfolioHolding): HoldingFormState {
  return {
    ticker: holding.ticker,
    name: holding.name,
    quantity: String(holding.quantity),
    averagePurchasePrice: String(holding.averagePurchasePrice),
    currentPrice: String(holding.currentPrice),
    notes: holding.notes ?? '',
  };
}

function parsePositiveNumber(value: string): number | null {
  const normalizedValue = Number(value.replace(',', '.'));
  return Number.isFinite(normalizedValue) && normalizedValue >= 0 ? normalizedValue : null;
}

function buildHoldingInput(form: HoldingFormState): HoldingInput | null {
  const quantity = parsePositiveNumber(form.quantity);
  const averagePurchasePrice = parsePositiveNumber(form.averagePurchasePrice);
  const currentPrice = parsePositiveNumber(form.currentPrice);
  const ticker = form.ticker.trim().toUpperCase();
  const name = form.name.trim();
  const notes = form.notes.trim();

  if (!ticker || !name || quantity === null || averagePurchasePrice === null || currentPrice === null) {
    return null;
  }

  return {
    ticker,
    name,
    quantity,
    averagePurchasePrice,
    currentPrice,
    notes: notes || undefined,
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function HomeScreen({ userEmail, userId }: HomeScreenProps) {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [form, setForm] = useState<HoldingFormState>(blankForm);
  const [editingHoldingId, setEditingHoldingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingHoldings, setIsLoadingHoldings] = useState(Boolean(db));
  const [isSavingHolding, setIsSavingHolding] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const formTitle = editingHoldingId ? 'Edit holding' : 'Add holding';
  const selectedHolding = useMemo(
    () => holdings.find((holding) => holding.id === editingHoldingId) ?? null,
    [editingHoldingId, holdings],
  );

  useEffect(() => {
    if (!db) {
      setIsLoadingHoldings(false);
      setErrorMessage('Firestore config is required before holdings can load.');
      return undefined;
    }

    setIsLoadingHoldings(true);

    ensureSeedHoldings(db, userId).catch((error) => {
      setErrorMessage(getErrorMessage(error, 'Could not seed holdings.'));
      setIsLoadingHoldings(false);
    });

    return subscribeToHoldings(
      db,
      userId,
      (nextHoldings) => {
        setHoldings(nextHoldings);
        setIsLoadingHoldings(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setIsLoadingHoldings(false);
      },
    );
  }, [userId]);

  async function handleSignOut() {
    if (!auth) {
      return;
    }

    setErrorMessage(null);
    setIsSigningOut(true);

    try {
      await signOut(auth);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Sign-out failed.'));
      setIsSigningOut(false);
    }
  }

  async function handleSaveHolding() {
    if (!db || isSavingHolding) {
      return;
    }

    const input = buildHoldingInput(form);

    if (!input) {
      setErrorMessage('Enter a ticker, name, quantity, average price, and current price.');
      return;
    }

    setErrorMessage(null);
    setIsSavingHolding(true);

    try {
      if (editingHoldingId) {
        await updateHolding(db, userId, editingHoldingId, input);
      } else {
        await addHolding(db, userId, input);
      }

      setForm(blankForm);
      setEditingHoldingId(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not save holding.'));
    } finally {
      setIsSavingHolding(false);
    }
  }

  async function handleDeleteHolding(holdingId: string) {
    if (!db) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteHolding(db, userId, holdingId);

      if (editingHoldingId === holdingId) {
        setEditingHoldingId(null);
        setForm(blankForm);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not delete holding.'));
    }
  }

  function handleEditHolding(holding: PortfolioHolding) {
    setEditingHoldingId(holding.id);
    setForm(formFromHolding(holding));
    setErrorMessage(null);
  }

  function handleCancelEdit() {
    setEditingHoldingId(null);
    setForm(blankForm);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>PORTFOLIO MINI</Text>
            {userEmail ? <Text style={styles.accountText}>{userEmail}</Text> : null}
          </View>
          <Pressable
            disabled={isSigningOut}
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              isSigningOut && styles.disabledButton,
              pressed && !isSigningOut ? styles.pressedButton : null,
            ]}
          >
            <Text style={styles.signOutText}>{isSigningOut ? 'Signing out...' : 'Sign out'}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Your investments, at a glance.</Text>
          <Text style={styles.subtitle}>
            A simple snapshot for your signed-in account.
          </Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {isLoadingHoldings ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color="#41644A" />
            <Text style={styles.loadingText}>Loading holdings</Text>
          </View>
        ) : (
          <PortfolioSummaryCard holdings={holdings} />
        )}

        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.sectionTitle}>{formTitle}</Text>
            {selectedHolding ? (
              <Text style={styles.formHeaderValue}>
                {formatCurrency(getHoldingMarketValue(selectedHolding))}
              </Text>
            ) : null}
          </View>

          <TextInput
            autoCapitalize="characters"
            editable={!isSavingHolding}
            onChangeText={(ticker) => setForm((current) => ({ ...current, ticker }))}
            placeholder="Ticker, e.g. JSE:OMU"
            placeholderTextColor="#839088"
            style={styles.input}
            value={form.ticker}
          />
          <TextInput
            editable={!isSavingHolding}
            onChangeText={(name) => setForm((current) => ({ ...current, name }))}
            placeholder="Name"
            placeholderTextColor="#839088"
            style={styles.input}
            value={form.name}
          />
          <View style={styles.inputRow}>
            <TextInput
              editable={!isSavingHolding}
              inputMode="decimal"
              onChangeText={(quantity) => setForm((current) => ({ ...current, quantity }))}
              placeholder="Quantity"
              placeholderTextColor="#839088"
              style={[styles.input, styles.rowInput]}
              value={form.quantity}
            />
            <TextInput
              editable={!isSavingHolding}
              inputMode="decimal"
              onChangeText={(currentPrice) => setForm((current) => ({ ...current, currentPrice }))}
              placeholder="Current price"
              placeholderTextColor="#839088"
              style={[styles.input, styles.rowInput]}
              value={form.currentPrice}
            />
          </View>
          <TextInput
            editable={!isSavingHolding}
            inputMode="decimal"
            onChangeText={(averagePurchasePrice) =>
              setForm((current) => ({ ...current, averagePurchasePrice }))
            }
            placeholder="Average purchase price"
            placeholderTextColor="#839088"
            style={styles.input}
            value={form.averagePurchasePrice}
          />
          <TextInput
            editable={!isSavingHolding}
            onChangeText={(notes) => setForm((current) => ({ ...current, notes }))}
            placeholder="Notes"
            placeholderTextColor="#839088"
            style={styles.input}
            value={form.notes}
          />

          <View style={styles.actionRow}>
            <Pressable
              disabled={isSavingHolding || !db}
              onPress={handleSaveHolding}
              style={({ pressed }) => [
                styles.primaryButton,
                (isSavingHolding || !db) && styles.disabledButton,
                pressed && !isSavingHolding ? styles.pressedButton : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isSavingHolding ? 'Saving...' : editingHoldingId ? 'Update' : 'Add'}
              </Text>
            </Pressable>
            {editingHoldingId ? (
              <Pressable
                disabled={isSavingHolding}
                onPress={handleCancelEdit}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && !isSavingHolding ? styles.pressedButton : null,
                ]}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.holdingsList}>
          <Text style={styles.sectionTitle}>Holdings</Text>
          {holdings.map((holding) => (
            <View key={holding.id} style={styles.holdingRow}>
              <View style={styles.holdingInfo}>
                <Text style={styles.holdingTicker}>{holding.ticker}</Text>
                <Text style={styles.holdingName}>{holding.name}</Text>
              </View>
              <View style={styles.holdingActions}>
                <Pressable onPress={() => handleEditHolding(holding)} style={styles.smallButton}>
                  <Text style={styles.smallButtonText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDeleteHolding(holding.id)} style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F2',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  eyebrow: {
    color: '#41644A',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  accountText: {
    marginTop: 8,
    maxWidth: 190,
    color: '#607067',
    fontSize: 13,
    lineHeight: 18,
  },
  signOutButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#41644A',
    paddingHorizontal: 14,
  },
  signOutText: {
    color: '#41644A',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.78,
  },
  hero: {
    marginBottom: 32,
  },
  title: {
    maxWidth: 320,
    color: '#142018',
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 16,
    color: '#607067',
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    marginBottom: 16,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DCE3DC',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  loadingText: {
    color: '#607067',
    fontSize: 14,
  },
  formCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#DCE3DC',
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#142018',
    fontSize: 18,
    fontWeight: '700',
  },
  formHeaderValue: {
    color: '#41644A',
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CAD3CB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#142018',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rowInput: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#41644A',
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#41644A',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#41644A',
    fontSize: 15,
    fontWeight: '700',
  },
  holdingsList: {
    marginTop: 24,
    gap: 12,
  },
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE3DC',
    paddingVertical: 12,
    gap: 12,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingTicker: {
    color: '#142018',
    fontSize: 15,
    fontWeight: '700',
  },
  holdingName: {
    marginTop: 4,
    color: '#607067',
    fontSize: 13,
  },
  holdingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#41644A',
    paddingHorizontal: 12,
  },
  smallButtonText: {
    color: '#41644A',
    fontSize: 13,
    fontWeight: '700',
  },
  deleteButton: {
    minHeight: 36,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#B42318',
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
  },
});
