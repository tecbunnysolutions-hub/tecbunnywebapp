import { describe, it, expect } from 'vitest';
import {
  resolveIndianStateInfo,
  resolveIndianStateFromText,
  formatPlaceOfSupply,
  TECBUNNY_REGISTERED_STATE,
} from './indian-tax';

describe('Indian Tax State Resolvers', () => {
  describe('resolveIndianStateInfo', () => {
    it('should return null for non-string values', () => {
      expect(resolveIndianStateInfo(null)).toBeNull();
      expect(resolveIndianStateInfo(undefined)).toBeNull();
      expect(resolveIndianStateInfo(123)).toBeNull();
      expect(resolveIndianStateInfo({})).toBeNull();
    });

    it('should return null for empty or whitespace-only strings', () => {
      expect(resolveIndianStateInfo('')).toBeNull();
      expect(resolveIndianStateInfo('   ')).toBeNull();
    });

    it('should resolve state from its exact 2-digit code', () => {
      expect(resolveIndianStateInfo('30')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('07')).toEqual({ code: '07', name: 'Delhi' });
    });

    it('should return null for invalid 2-digit codes', () => {
      expect(resolveIndianStateInfo('99')).toBeNull();
      expect(resolveIndianStateInfo('00')).toBeNull();
    });

    it('should resolve state from its name case-insensitively', () => {
      expect(resolveIndianStateInfo('goa')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('GOA')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateInfo('West Bengal')).toEqual({ code: '19', name: 'West Bengal' });
      expect(resolveIndianStateInfo('WEST BENGAL')).toEqual({ code: '19', name: 'West Bengal' });
    });

    it('should handle aliases and minor spacing/dot variations', () => {
      expect(resolveIndianStateInfo('andhrapradesh')).toEqual({ code: '37', name: 'Andhra Pradesh' });
      expect(resolveIndianStateInfo('andhra pradesh')).toEqual({ code: '37', name: 'Andhra Pradesh' });
      expect(resolveIndianStateInfo('tamilnadu')).toEqual({ code: '33', name: 'Tamil Nadu' });
      expect(resolveIndianStateInfo('tamil nadu')).toEqual({ code: '33', name: 'Tamil Nadu' });
    });
  });

  describe('resolveIndianStateFromText', () => {
    it('should return null for non-string or empty input', () => {
      expect(resolveIndianStateFromText(null)).toBeNull();
      expect(resolveIndianStateFromText('')).toBeNull();
      expect(resolveIndianStateFromText('   ')).toBeNull();
    });

    it('should extract state name from address text', () => {
      expect(resolveIndianStateFromText('123, MG Road, Goa, India')).toEqual({ code: '30', name: 'Goa' });
      expect(resolveIndianStateFromText('Connaught Place, New Delhi 110001')).toEqual({ code: '07', name: 'Delhi' });
      expect(resolveIndianStateFromText('Near Marine Drive, Mumbai, Maharashtra')).toEqual({ code: '27', name: 'Maharashtra' });
    });

    it('should return null if no known state alias is in the text', () => {
      expect(resolveIndianStateFromText('123, Unknown Street, Paris, France')).toBeNull();
    });
  });

  describe('formatPlaceOfSupply', () => {
    it('should format properly when stateInfo is provided', () => {
      const stateInfo = { code: '30', name: 'Goa' };
      expect(formatPlaceOfSupply(stateInfo)).toBe('30 - Goa');
    });

    it('should use fallback state if stateInfo is null', () => {
      expect(formatPlaceOfSupply(null, 'Karnataka')).toBe('Karnataka');
      expect(formatPlaceOfSupply(null, '  Karnataka  ')).toBe('Karnataka');
    });

    it('should return "Not captured" if both stateInfo and fallbackState are absent', () => {
      expect(formatPlaceOfSupply(null)).toBe('Not captured');
      expect(formatPlaceOfSupply(null, null)).toBe('Not captured');
      expect(formatPlaceOfSupply(null, '')).toBe('Not captured');
    });
  });

  describe('TECBUNNY_REGISTERED_STATE', () => {
    it('should match Goa registration state', () => {
      expect(TECBUNNY_REGISTERED_STATE).toEqual({ code: '30', name: 'Goa' });
    });
  });
});
