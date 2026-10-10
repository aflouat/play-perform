'use client';

import { useSyncExternalStore } from 'react';
import { getBankVersion, isBankReady, subscribeBank } from './question-bank-overlay';

/** Re-renders when the database questions load, so lists and counters pick them up. */
export function useQuestionBankVersion(): number {
  return useSyncExternalStore(subscribeBank, getBankVersion, getBankVersion);
}

/** True once the database layer answered (or failed); quiz sessions wait for it. */
export function useQuestionBankReady(): boolean {
  return useSyncExternalStore(subscribeBank, isBankReady, () => false);
}
