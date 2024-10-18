import {
  isProductionEnvironment,
  padNumber
} from './debug.helper';

describe('debug helper', () => {
  describe('padNumber', () => {
    it('should return string with correct length', () => {
      expect(padNumber(1)).toBe('01');
      expect(padNumber(25)).toBe('25');
      expect(padNumber(1, 3)).toBe('001');
      expect(padNumber(25, 3)).toBe('025');
      expect(padNumber(253, 3)).toBe('253');
      expect(padNumber(253, 2)).toBe('253');
    });
  });

  describe('isProductionEnvironment', () => {
    it('should return true as environment is production', () => {
      const document = { body: { dataset: { bootstrapconfig: '{"environment": "prod"}' } } };

      expect(isProductionEnvironment(document.body.dataset)).toBeTruthy();
    });

    it('should return false if environment is not production', () => {
      const document = { body: { dataset: { bootstrapconfig: '{"environment": "dev"}' } } };

      expect(isProductionEnvironment(document.body.dataset)).toBeFalsy();
    });

    it('should return false if no bootstrapconfig', () => {
      const document = { body: { dataset: {} } };

      expect(isProductionEnvironment(document.body.dataset)).toBeFalsy();
    });
  });
});
