import {
  getCategoriesFromDocText,
  getRestrictionKeysFromDocText,
  getWidgetInformationFromDocComment,
} from './config-doc';

describe('config doc', () => {
  describe('getWidgetInformationFromDocComment', () => {
    it('should get the widget information', () => {
      const widgetInfo = getWidgetInformationFromDocComment(`
        /**
         * @o3rWidget widgetType
         * @o3rWidgetParam param1 "value1"
         */
      `);
      expect(widgetInfo).toEqual({
        type: 'widgetType',
        parameters: {
          param1: 'value1'
        }
      });
    });

    it('should not have any widget parameters information', () => {
      const widgetInfo = getWidgetInformationFromDocComment(`
        /**
         * @o3rWidget widgetType
         */
      `);
      expect(widgetInfo).toBeDefined();
      expect(widgetInfo.parameters).toBeUndefined();
    });

    it('should not find any widget information', () => {
      const widgetInfo = getWidgetInformationFromDocComment(`
        /**
         * Doc without o3r widget tag
         */
      `);
      expect(widgetInfo).toBeUndefined();
    });

    it('should throw if param value in not a valid JSON value', () => {
      expect(() => getWidgetInformationFromDocComment(`
        /**
         * @o3rWidget widgetType
         * @o3rWidgetParam param1 invalid-value
         */
      `)).toThrow();
    });
  });
  describe('getCategoriesFromDocText', () => {
    it('should get the categories information', () => {
      const categoriesInfo = getCategoriesFromDocText(`
        /**
         * @o3rCategories test1 description of test 1
         * @o3rCategories test2
         */
      `);
      expect(categoriesInfo).toEqual([
        {
          name: 'test1',
          label: 'description of test 1'
        },
        {
          name: 'test2',
          label: 'Test2'
        }
      ]);
    });
  });
  describe('getRestrictionKeysFromDocText', () => {
    it('should get the valid restriction keys', () => {
      const restrictionKeys = getRestrictionKeysFromDocText(`
        /**
         * @o3rRestrictionKey valid
         * @o3rRestrictionKey valid_1
         * @o3rRestrictionKey invalid-2
         * @o3rRestrictionKey "valid-3"
         * @o3rRestrictionKey 'valid 4'
         * @o3rRestrictionKey invalid 5
         * @o3rRestrictionKey "invalid quote'
         * @o3rRestrictionKey 'another invalid quote"
         * @o3rRestrictionKey "valid 'quote'"
         * @o3rRestrictionKey 'another valid "quote"'
         */
      `);
      expect(restrictionKeys).toEqual([
        'valid', 'valid_1', 'valid-3', 'valid 4', "valid 'quote'", 'another valid "quote"'
      ]);
    });
  });
});
