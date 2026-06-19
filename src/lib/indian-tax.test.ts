import { describe, expect, it } from 'vitest';
import {
  resolveIndianStateInfo,
  resolveIndianStateFromText,
  formatPlaceOfSupply,
  TECBUNNY_REGISTERED_STATE,
} from './indian-tax';

describe('Indian Tax State Utilities', () => {
  describe('resolveIndianStateInfo', () => {
    it('should return null for non-string inputs', () => {
      expect(resolveIndianStateInfo(null)).toBeNull();
      expect(resolveIndianStateInfo(undefined)).toBeNull();
      expect(resolveIndianStateInfo(123)).toBeNull();
      expect(resolveIndianStateInfo({})).toBeNull();
    });

    it('should return null for empty or whitespace strings', () => {
      expect(resolveIndianStateInfo('')).toBeNull();
      expect(resolveIndianStateInfo('   ')).toBeNull();
    });

    it('should resolve states by exact state code', () => {
      expect(resolveIndianStateInfo('30')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('27')).toEqual({ code: '27', name: 'Maharashtra' });
      expect(resolveIndianStateInfo('07')).toEqual({ code: '07', name: 'Delhi' });
    });

    it('should return null for invalid 2-digit codes', () => {
      expect(resolveIndianStateInfo('99')).toBeNull();
    });

    it('should resolve states by case-insensitive name', () => {
      expect(resolveIndianStateInfo('Goa')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('goa')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('GOA')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('maharashtra')).toEqual({ code: '27', name: 'Maharashtra' });
    });

    it('should resolve states with spaces and dots normalized', () => {
      expect(resolveIndianStateInfo('  uttar pradesh  ')).toEqual({ code: '09', name: 'Uttar Pradesh' });
      expect(resolveIndianStateInfo('andhrapradesh')).toEqual({ code: '37', name: 'Andhra Pradesh' });
      expect(resolveIndianStateInfo('new delhi')).toEqual({ code: '07', name: 'Delhi' });
      expect(resolveIndianStateInfo('pondicherry')).toEqual({ code: '34', name: 'Puducherry' });
    });

    it('should return null for unknown state names', () => {
      expect(resolveIndianStateInfo('California')).toBeNull();
      expect(resolveIndianStateInfo('London')).toBeNull();
    });
  });

  describe('resolveIndianStateFromText', () => {
    it('should return null for non-string or empty inputs', () => {
      expect(resolveIndianStateFromText(null)).toBeNull();
      expect(resolveIndianStateFromText('')).toBeNull();
    });

    it('should extract state from embedded text', () => {
      expect(resolveIndianStateFromText('Shipped to Panjim, Goa - 403001')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateFromText('Mumbai, Maharashtra, India')).toEqual({ code: '27', name: 'Maharashtra' });
      expect(resolveIndianStateFromText('New Delhi district office')).toEqual({ code: '07', name: 'Delhi' });
    });

    it('should respect word boundaries and not match substrings within larger words', () => {
      // E.g., "Chicagoas" contains "goa", but it shouldn't match "Goa" due to word boundaries
      expect(resolveIndianStateFromText('Chicagoas')).toBeNull();
      expect(resolveIndianStateFromText('goahead')).toBeNull();
    });

    it('should resolve alias names embedded in text', () => {
      expect(resolveIndianStateFromText('Address in Pondicherry')).toEqual({ code: '34', name: 'Puducherry' });
      expect(resolveIndianStateFromText('Live in orissa state')).toEqual({ code: '21', name: 'Odisha' });
    });
  });

  describe('formatPlaceOfSupply', () => {
    it('should format place of supply correctly when stateInfo is provided', () => {
      const stateInfo = { code: '30', name: 'Goa' };
      expect(formatPlaceOfSupply(stateInfo)).toBe('30 - Goa');
      expect(formatPlaceOfSupply({ code: '27', name: 'Maharashtra' })).toBe('27 - Maharashtra');
    });

    it('should return fallbackState if stateInfo is null', () => {
      expect(formatPlaceOfSupply(null, 'Karnataka')).toBe('Karnataka');
      expect(formatPlaceOfSupply(null, '  Karnataka  ')).toBe('Karnataka');
    });

    it('should return "Not captured" if stateInfo is null and no fallbackState is provided', () => {
      expect(formatPlaceOfSupply(null)).toBe('Not captured');
      expect(formatPlaceOfSupply(null, null)).toBe('Not captured');
      expect(formatPlaceOfSupply(null, '')).toBe('Not captured');
    });
  });

  describe('TECBUNNY_REGISTERED_STATE', () => {
    it('should be configured to Goa (code 30)', () => {
      expect(TECBUNNY_REGISTERED_STATE).toEqual({ code: '30', name: 'Goa' });
    });
  });
});
