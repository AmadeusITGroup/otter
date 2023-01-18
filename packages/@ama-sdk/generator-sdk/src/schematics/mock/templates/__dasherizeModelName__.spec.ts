import {combine<%= apiModels %>, create<%= apiModel %>, <%= apiModel %>Repository} from './<%= dasherizeModelName %>.mock';

describe('[MockFactory] <%= apiModel %>', () => {
  describe('CreateFactory', () => {
    it('should create a default object', () => {
      const result = create<%= apiModel %>();

      expect(result).toEqual(<%= apiModel %>Repository.DEFAULT);<% if (identified) { %>
      expect(result.id).toBe('<%= dasherizeAndCapitalizeModelName %>-0-MOCK');<% } %>
    });
  });

  describe('CombineFactory', () => {
    it('should combine only the default object', () => {
      const result = combine<%= apiModels %>();

      expect(result.items.length).toBe(1);
      expect(result.items).toEqual([<%= apiModel %>Repository.DEFAULT]);
    });<% if (identified) { %>

    let results: <%= apiModel %>[];
    let lastId: number | undefined;

    beforeAll(() => {
      const combination = combine<%= apiModels %>([
        <%= apiModel %>Repository.DEFAULT,
        <%= apiModel %>Repository.DEFAULT,
        <%= apiModel %>Repository.DEFAULT
      ]);
      results = combination.items;
      lastId = combination.lastId;
    });

    it('should return the correct lastId', () => {
      expect(lastId).toEqual(2);
    });

    it('should set the ids incrementally', () => {
      expect(results[0].id).toEqual('<%= dasherizeAndCapitalizeModelName %>-0-MOCK');
      expect(results[1].id).toEqual('<%= dasherizeAndCapitalizeModelName %>-1-MOCK');
      expect(results[2].id).toEqual('<%= dasherizeAndCapitalizeModelName %>-2-MOCK');
    });

    it('should use lastId config', () => {
      const {items, lastId: thisLastId} = combine<%= apiModels %>([<%= apiModel %>Repository.DEFAULT], {lastId: 100});

      expect(items[0].id).toEqual('<%= dasherizeAndCapitalizeModelName %>-101-MOCK');
      expect(thisLastId).toEqual(101);
    });<% } %>
  });
});
