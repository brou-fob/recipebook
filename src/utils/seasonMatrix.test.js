/**
 * Saisonmatrix Firestore Utilities Tests
 */

jest.mock('../firebase', () => ({
  db: {}
}));

const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockOnSnapshot = jest.fn();
const mockDoc = jest.fn();
const mockQuery = jest.fn((...args) => args);
const mockOrderBy = jest.fn((...args) => args);

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: (...args) => mockDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  deleteDoc: (...args) => mockDeleteDoc(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  query: (...args) => mockQuery(...args),
  orderBy: (...args) => mockOrderBy(...args),
  serverTimestamp: jest.fn(() => 'mock-timestamp')
}));

jest.mock('./firestoreUtils', () => ({
  removeUndefinedFields: jest.fn((obj) => obj)
}));

import {
  subscribeToSeasonMatrix,
  addSeasonMatrixEntry,
  updateSeasonMatrixEntry,
  deleteSeasonMatrixEntry,
  computeCurrentSeasonStatus,
  CURRENT_SEASON_STATUS
} from './seasonMatrix';

const { collection: mockCollection } = jest.requireMock('firebase/firestore');
const { removeUndefinedFields: mockRemoveUndefinedFields } = jest.requireMock('./firestoreUtils');
const { serverTimestamp: mockServerTimestamp } = jest.requireMock('firebase/firestore');

describe('seasonMatrix utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.mockReturnValue('mock-season-matrix-collection');
    mockServerTimestamp.mockReturnValue('mock-timestamp');
    mockRemoveUndefinedFields.mockImplementation((obj) => obj);
    mockDoc.mockImplementation((db, col, id) => `mock-doc-ref-${id}`);
    mockSetDoc.mockResolvedValue(undefined);
    mockUpdateDoc.mockResolvedValue(undefined);
    mockDeleteDoc.mockResolvedValue(undefined);
  });

  it('subscribes and maps snapshot docs to entry list', () => {
    const callback = jest.fn();
    const unsubscribe = jest.fn();
    mockOnSnapshot.mockImplementation((queryRef, onNext) => {
      onNext({
        forEach: (handler) => {
          handler({ id: 'kartoffel', data: () => ({ name: 'Kartoffel', isActive: true }) });
        }
      });
      return unsubscribe;
    });

    const result = subscribeToSeasonMatrix(callback);

    expect(result).toBe(unsubscribe);
    expect(callback).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'kartoffel', name: 'Kartoffel', isActive: true })
    ]);
  });

  it('adds an entry with server timestamp and updatedBy', async () => {
    await addSeasonMatrixEntry(
      {
        id: 'kartoffel',
        name: 'Kartoffel',
        mainSeasonMonths: [4, 5],
        seasonScore: 90,
        isActive: true,
        region: 'DE'
      },
      'admin@example.com'
    );

    expect(mockSetDoc).toHaveBeenCalledWith(
      'mock-doc-ref-kartoffel',
      expect.objectContaining({
        id: 'kartoffel',
        updatedAt: 'mock-timestamp',
        updatedBy: 'admin@example.com'
      })
    );
  });

  it('updates an entry with server timestamp and updatedBy', async () => {
    await updateSeasonMatrixEntry(
      'kartoffel',
      { name: 'Kartoffel neu', seasonScore: 85 },
      'editor@example.com'
    );

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      'mock-doc-ref-kartoffel',
      expect.objectContaining({
        name: 'Kartoffel neu',
        seasonScore: 85,
        updatedAt: 'mock-timestamp',
        updatedBy: 'editor@example.com'
      })
    );
  });

  it('deletes an entry by id', async () => {
    await deleteSeasonMatrixEntry('kartoffel');
    expect(mockDeleteDoc).toHaveBeenCalledWith('mock-doc-ref-kartoffel');
  });
});

describe('computeCurrentSeasonStatus', () => {
  const makeEntry = (mainSeasonMonths, secondarySeasonMonths = []) => ({
    mainSeasonMonths,
    secondarySeasonMonths,
  });

  it('returns Hauptsaison when current month is in mainSeasonMonths', () => {
    const entry = makeEntry([5, 6, 7]);
    const date = new Date(2024, 4, 15); // May 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.HAUPTSAISON);
  });

  it('returns Nebensaison when current month is in secondarySeasonMonths', () => {
    const entry = makeEntry([6, 7], [4, 5]);
    const date = new Date(2024, 4, 10); // May 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.NEBENSAISON);
  });

  it('prioritises Hauptsaison over Nebensaison when both include current month', () => {
    const entry = makeEntry([5], [5]);
    const date = new Date(2024, 4, 1); // May 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.HAUPTSAISON);
  });

  it('returns Bald_Saison when a main season month starts within 7 days', () => {
    // June (month 6) is main season; today is May 25 → June 1 is 7 days away
    const entry = makeEntry([6]);
    const date = new Date(2024, 4, 25); // May 25 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.BALD_SAISON);
  });

  it('returns Keine_Saison when main season starts in more than 7 days', () => {
    // June is main season; today is May 23 → June 1 is 9 days away
    const entry = makeEntry([6]);
    const date = new Date(2024, 4, 23); // May 23 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.KEINE_SAISON);
  });

  it('returns Keine_Saison when no months match and main season is far away', () => {
    const entry = makeEntry([9, 10, 11]);
    const date = new Date(2024, 0, 15); // January 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.KEINE_SAISON);
  });

  it('handles year wrap-around: December date and January main season', () => {
    // January is main season; today is Dec 25 → Jan 1 is 7 days away
    const entry = makeEntry([1]);
    const date = new Date(2024, 11, 25); // Dec 25 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.BALD_SAISON);
  });

  it('returns Keine_Saison when entry has empty mainSeasonMonths', () => {
    const entry = makeEntry([]);
    const date = new Date(2024, 5, 1); // June 2024
    expect(computeCurrentSeasonStatus(entry, date)).toBe(CURRENT_SEASON_STATUS.KEINE_SAISON);
  });

  it('uses today as default date', () => {
    const entry = makeEntry([]);
    const result = computeCurrentSeasonStatus(entry);
    expect(result).toBe(CURRENT_SEASON_STATUS.KEINE_SAISON);
  });
});
