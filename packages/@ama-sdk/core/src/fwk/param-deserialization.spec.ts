import {
  deserializePathParams,
  deserializeQueryParams,
} from './param-deserialization';

describe('Deserialize parameters', () => {
  it('should correctly deserialize query parameters of type primitive', () => {
    expect(deserializeQueryParams({ idPrimitive: 'idPrimitive=5' }, { idPrimitive: { explode: true, style: 'form', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializeQueryParams({ idPrimitive: 'idPrimitive=5' }, { idPrimitive: { explode: false, style: 'form', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
  });

  it('should correctly deserialize query parameters of type array', () => {
    expect(deserializeQueryParams({ idArray: 'idArray=3&idArray=4&idArray=5' }, { idArray: { explode: true, style: 'form', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializeQueryParams({ idArray: 'idArray=3,4,5' }, { idArray: { explode: false, style: 'form', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(() => deserializeQueryParams({ idArray: 'should-not-work' }, { idArray: { explode: true, style: 'spaceDelimited', paramType: 'array' } }))
      .toThrow(`Unable to deserialize query parameter idArray since the combination explode=true and style='spaceDelimited' is not supported.`);
    expect(deserializeQueryParams({ idArray: 'idArray=3%204%205' }, { idArray: { explode: false, style: 'spaceDelimited', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(() => deserializeQueryParams({ idArray: 'should-not-work' }, { idArray: { explode: true, style: 'pipeDelimited', paramType: 'array' } }))
      .toThrow(`Unable to deserialize query parameter idArray since the combination explode=true and style='pipeDelimited' is not supported.`);
    expect(deserializeQueryParams({ idArray: 'idArray=3%7C4%7C5' }, { idArray: { explode: false, style: 'pipeDelimited', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
  });

  it('should correctly deserialize query parameters of type object', () => {
    expect(deserializeQueryParams({ idObject: 'role=admin&firstName=Alex' }, { idObject: { explode: true, style: 'form', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializeQueryParams({ idObject: 'idObject=role,admin,firstName,Alex' }, { idObject: { explode: false, style: 'form', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(() => deserializeQueryParams({ idObject: 'should-not-work' }, { idObject: { explode: true, style: 'spaceDelimited', paramType: 'object' } }))
      .toThrow(`Unable to deserialize query parameter idObject since the combination explode=true and style='spaceDelimited' is not supported.`);
    expect(deserializeQueryParams({ idObject: 'idObject=role%20admin%20firstName%20Alex' }, { idObject: { explode: false, style: 'spaceDelimited', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(() => deserializeQueryParams({ idObject: 'should-not-work' }, { idObject: { explode: true, style: 'pipeDelimited', paramType: 'object' } }))
      .toThrow(`Unable to deserialize query parameter idObject since the combination explode=true and style='pipeDelimited' is not supported.`);
    expect(deserializeQueryParams({ idObject: 'idObject=role%7Cadmin%7CfirstName%7CAlex' }, { idObject: { explode: false, style: 'pipeDelimited', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializeQueryParams({ idObject: 'idObject%5Brole%5D=admin&idObject%5BfirstName%5D=Alex' }, { idObject: { explode: true, style: 'deepObject', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(() => deserializeQueryParams({ idObject: 'should-not-work' }, { idObject: { explode: false, style: 'deepObject', paramType: 'object' } }))
      .toThrow(`Unable to deserialize query parameter idObject since the combination explode=false and style='deepObject' is not supported.`);
  });

  it('should correctly deserialize path parameters of type primitive', () => {
    expect(deserializePathParams({ idPrimitive: '5' }, { idPrimitive: { explode: true, style: 'simple', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializePathParams({ idPrimitive: '5' }, { idPrimitive: { explode: false, style: 'simple', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializePathParams({ idPrimitive: '.5' }, { idPrimitive: { explode: true, style: 'label', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializePathParams({ idPrimitive: '.5' }, { idPrimitive: { explode: false, style: 'label', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializePathParams({ idPrimitive: ';idPrimitive=5' }, { idPrimitive: { explode: true, style: 'matrix', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
    expect(deserializePathParams({ idPrimitive: ';idPrimitive=5' }, { idPrimitive: { explode: false, style: 'matrix', paramType: 'primitive' } })).toEqual({ idPrimitive: '5' });
  });

  it('should correctly deserialize path parameters of type array', () => {
    expect(deserializePathParams({ idArray: '3,4,5' }, { idArray: { explode: true, style: 'simple', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializePathParams({ idArray: '3,4,5' }, { idArray: { explode: false, style: 'simple', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializePathParams({ idArray: '.3.4.5' }, { idArray: { explode: true, style: 'label', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializePathParams({ idArray: '.3,4,5' }, { idArray: { explode: false, style: 'label', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializePathParams({ idArray: ';idArray=3;idArray=4;idArray=5' }, { idArray: { explode: true, style: 'matrix', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
    expect(deserializePathParams({ idArray: ';idArray=3,4,5' }, { idArray: { explode: false, style: 'matrix', paramType: 'array' } })).toEqual({ idArray: ['3', '4', '5'] });
  });

  it('should correctly deserialize path parameters of type object', () => {
    expect(deserializePathParams({ idObject: 'role=admin,firstName=Alex' }, { idObject: { explode: true, style: 'simple', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializePathParams({ idObject: 'role,admin,firstName,Alex' }, { idObject: { explode: false, style: 'simple', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializePathParams({ idObject: '.role=admin.firstName=Alex' }, { idObject: { explode: true, style: 'label', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializePathParams({ idObject: '.role,admin,firstName,Alex' }, { idObject: { explode: false, style: 'label', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializePathParams({ idObject: ';role=admin;firstName=Alex' }, { idObject: { explode: true, style: 'matrix', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
    expect(deserializePathParams({ idObject: ';idObject=role,admin,firstName,Alex' }, { idObject: { explode: false, style: 'matrix', paramType: 'object' } }))
      .toEqual({ idObject: { role: 'admin', firstName: 'Alex' } });
  });
});
