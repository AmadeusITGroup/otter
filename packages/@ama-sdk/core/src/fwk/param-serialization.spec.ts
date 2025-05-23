import {
  getPropertiesFromData,
} from './api.helpers';
import {
  utils,
} from './date';
import {
  serializePathParams,
  serializeQueryParams,
} from './param-serialization';

describe('Serialize parameters', () => {
  const mockData = {
    idPrimitive: '5',
    idArray: ['3', '4', '5'],
    idObject: { role: 'admin', firstName: 'Alex' }
  };

  it('should correctly serialize query parameters', () => {
    const mockPrimitiveQueryParams = getPropertiesFromData(mockData, ['idPrimitive']);
    const mockArrayQueryParams = getPropertiesFromData(mockData, ['idArray']);
    const mockObjectQueryParams = getPropertiesFromData(mockData, ['idObject']);
    const mockMultipleQueryParams = getPropertiesFromData(mockData, ['idArray', 'idPrimitive']);

    // value = primitive, explode = true, style = form
    expect(serializeQueryParams(mockPrimitiveQueryParams, { idPrimitive: { explode: true, style: 'form' } })).toEqual({ idPrimitive: 'idPrimitive=5' });
    // value = primitive, explode = false, style = form
    expect(serializeQueryParams(mockPrimitiveQueryParams, { idPrimitive: { explode: false, style: 'form' } })).toEqual({ idPrimitive: 'idPrimitive=5' });
    // value = array, explode = true, style = form
    expect(serializeQueryParams(mockArrayQueryParams, { idArray: { explode: true, style: 'form' } })).toEqual({ idArray: 'idArray=3&idArray=4&idArray=5' });
    // value = array, explode = false, style = form
    expect(serializeQueryParams(mockArrayQueryParams, { idArray: { explode: false, style: 'form' } })).toEqual({ idArray: 'idArray=3,4,5' });
    // value = array, explode = true, style = spaceDelimited --> not supported
    expect(() => serializeQueryParams(mockArrayQueryParams, { idArray: { explode: true, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idArray since the combination explode=true and style='spaceDelimited' is not supported.`);
    // value = array, explode = false, style = spaceDelimited
    expect(serializeQueryParams(mockArrayQueryParams, { idArray: { explode: false, style: 'spaceDelimited' } })).toEqual({ idArray: 'idArray=3%204%205' });
    // value = array, explode = true, style = pipeDelimited --> not supported
    expect(() => serializeQueryParams(mockArrayQueryParams, { idArray: { explode: true, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idArray since the combination explode=true and style='pipeDelimited' is not supported.`);
    // value = array, explode = false, style = pipeDelimited
    expect(serializeQueryParams(mockArrayQueryParams, { idArray: { explode: false, style: 'pipeDelimited' } })).toEqual({ idArray: 'idArray=3%7C4%7C5' });
    // value = object, explode = true, style = form
    expect(serializeQueryParams(mockObjectQueryParams, { idObject: { explode: true, style: 'form' } })).toEqual({ idObject: 'role=admin&firstName=Alex' });
    // value = object, explode = false, style = form
    expect(serializeQueryParams(mockObjectQueryParams, { idObject: { explode: false, style: 'form' } })).toEqual({ idObject: 'idObject=role,admin,firstName,Alex' });
    // value = object, explode = true, style = spaceDelimited --> not supported
    expect(() => serializeQueryParams(mockObjectQueryParams, { idObject: { explode: true, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idObject since the combination explode=true and style='spaceDelimited' is not supported.`);
    // value = object, explode = false, style = spaceDelimited
    expect(serializeQueryParams(mockObjectQueryParams, { idObject: { explode: false, style: 'spaceDelimited' } })).toEqual({ idObject: 'idObject=role%20admin%20firstName%20Alex' });
    // value = object, explode = true, style = pipeDelimited --> not supported
    expect(() => serializeQueryParams(mockObjectQueryParams, { idObject: { explode: true, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idObject since the combination explode=true and style='pipeDelimited' is not supported.`);
    // value = object, explode = false, style = pipeDelimited
    expect(serializeQueryParams(mockObjectQueryParams, { idObject: { explode: false, style: 'pipeDelimited' } })).toEqual({ idObject: 'idObject=role%7Cadmin%7CfirstName%7CAlex' });
    // value = object, explode = true, style = deepObject
    expect(serializeQueryParams(mockObjectQueryParams, { idObject: { explode: true, style: 'deepObject' } })).toEqual({ idObject: 'idObject%5Brole%5D=admin&idObject%5BfirstName%5D=Alex' });
    // value = object, explode = false, style = deepObject --> not supported
    expect(() => serializeQueryParams(mockObjectQueryParams, { idObject: { explode: false, style: 'deepObject' } }))
      .toThrow(`Unable to serialize query parameter idObject since the combination explode=false and style='deepObject' is not supported.`);
    // multiple parameters
    expect(serializeQueryParams(mockMultipleQueryParams, { idArray: { explode: false, style: 'form' }, idPrimitive: { explode: true, style: 'form' } }))
      .toEqual({ idArray: 'idArray=3,4,5', idPrimitive: 'idPrimitive=5' });
  });

  it('should correctly serialize query parameters with undefined or null values', () => {
    // empty array
    expect(serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: true, style: 'form' } })).toEqual({ idEmptyArray: 'idEmptyArray=' });
    expect(serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: false, style: 'form' } })).toEqual({ idEmptyArray: 'idEmptyArray=' });
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: true, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=true and style='spaceDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: false, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=false and style='spaceDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: true, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=true and style='pipeDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: false, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=false and style='pipeDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: true, style: 'deepObject' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=true and style='deepObject' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyArray: [] }, { idEmptyArray: { explode: false, style: 'deepObject' } }))
      .toThrow(`Unable to serialize query parameter idEmptyArray since the combination explode=false and style='deepObject' is not supported.`);
    // array with undefined values
    expect(serializeQueryParams({ idArrayUndefinedValues: ['value1', undefined, null, 'value2'] }, { idArrayUndefinedValues: { explode: true, style: 'form' } }))
      .toEqual({ idArrayUndefinedValues: 'idArrayUndefinedValues=value1&idArrayUndefinedValues=value2' });
    expect(serializeQueryParams({ idArrayUndefinedValues: ['value1', undefined, null, 'value2'] }, { idArrayUndefinedValues: { explode: false, style: 'form' } }))
      .toEqual({ idArrayUndefinedValues: 'idArrayUndefinedValues=value1,value2' });
    // empty object
    expect(serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: true, style: 'form' } })).toEqual({ idEmptyObject: 'idEmptyObject=' });
    expect(serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: false, style: 'form' } })).toEqual({ idEmptyObject: 'idEmptyObject=' });
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: true, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=true and style='spaceDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: false, style: 'spaceDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=false and style='spaceDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: true, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=true and style='pipeDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: false, style: 'pipeDelimited' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=false and style='pipeDelimited' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: true, style: 'deepObject' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=true and style='deepObject' is not supported.`);
    expect(() => serializeQueryParams({ idEmptyObject: {} }, { idEmptyObject: { explode: false, style: 'deepObject' } }))
      .toThrow(`Unable to serialize query parameter idEmptyObject since the combination explode=false and style='deepObject' is not supported.`);
    // object with undefined values
    expect(serializeQueryParams({ idObjectUndefinedValues: { property1: undefined, property2: 'value2' } }, { idObjectUndefinedValues: { explode: true, style: 'form' } }))
      .toEqual({ idObjectUndefinedValues: 'property2=value2' });
    expect(serializeQueryParams({ idObjectUndefinedValues: { property1: undefined, property2: 'value2' } }, { idObjectUndefinedValues: { explode: false, style: 'form' } }))
      .toEqual({ idObjectUndefinedValues: 'idObjectUndefinedValues=property2,value2' });
  });

  it('should correctly serialize path parameters', () => {
    const pathParametersSimpleExplode = serializePathParams(mockData, {
      idPrimitive: { explode: true, style: 'simple' },
      idArray: { explode: true, style: 'simple' },
      idObject: { explode: true, style: 'simple' }
    });
    expect(pathParametersSimpleExplode.idPrimitive).toEqual('5');
    expect(pathParametersSimpleExplode.idArray).toEqual('3,4,5');
    expect(pathParametersSimpleExplode.idObject).toEqual('role=admin,firstName=Alex');

    const pathParametersSimple = serializePathParams(mockData, {
      idPrimitive: { explode: false, style: 'simple' },
      idArray: { explode: false, style: 'simple' },
      idObject: { explode: false, style: 'simple' }
    });
    expect(pathParametersSimple.idPrimitive).toEqual('5');
    expect(pathParametersSimple.idArray).toEqual('3,4,5');
    expect(pathParametersSimple.idObject).toEqual('role,admin,firstName,Alex');

    const pathParametersLabelExplode = serializePathParams(mockData, {
      idPrimitive: { explode: true, style: 'label' },
      idArray: { explode: true, style: 'label' },
      idObject: { explode: true, style: 'label' }
    });
    expect(pathParametersLabelExplode.idPrimitive).toEqual('.5');
    expect(pathParametersLabelExplode.idArray).toEqual('.3.4.5');
    expect(pathParametersLabelExplode.idObject).toEqual('.role=admin.firstName=Alex');

    const pathParametersLabel = serializePathParams(mockData, {
      idPrimitive: { explode: false, style: 'label' },
      idArray: { explode: false, style: 'label' },
      idObject: { explode: false, style: 'label' }
    });
    expect(pathParametersLabel.idPrimitive).toEqual('.5');
    expect(pathParametersLabel.idArray).toEqual('.3,4,5');
    expect(pathParametersLabel.idObject).toEqual('.role,admin,firstName,Alex');

    const pathParametersMatrixExplode = serializePathParams(mockData, {
      idPrimitive: { explode: true, style: 'matrix' },
      idArray: { explode: true, style: 'matrix' },
      idObject: { explode: true, style: 'matrix' }
    });
    expect(pathParametersMatrixExplode.idPrimitive).toEqual(';idPrimitive=5');
    expect(pathParametersMatrixExplode.idArray).toEqual(';idArray=3;idArray=4;idArray=5');
    expect(pathParametersMatrixExplode.idObject).toEqual(';role=admin;firstName=Alex');

    const pathParametersMatrix = serializePathParams(mockData, {
      idPrimitive: { explode: false, style: 'matrix' },
      idArray: { explode: false, style: 'matrix' },
      idObject: { explode: false, style: 'matrix' }
    });
    expect(pathParametersMatrix.idPrimitive).toEqual(';idPrimitive=5');
    expect(pathParametersMatrix.idArray).toEqual(';idArray=3,4,5');
    expect(pathParametersMatrix.idObject).toEqual(';idObject=role,admin,firstName,Alex');
  });

  it('should correctly serialize path parameters with undefined or null values', () => {
    const mockArrayData = {
      idEmptyArray: [],
      idArrayToFilter: ['value1', undefined, null, 'value2']
    };

    // value = empty array, explode = true, style = simple
    expect(() => serializePathParams(
      { idEmptyArray: [] },
      { idEmptyArray: { explode: true, style: 'simple' } }
    )).toThrow(`Unable to serialize path parameter idEmptyArray since an empty array of style='simple' is not supported.`);

    // value = empty array, explode = false, style = simple
    expect(() => serializePathParams(
      { idEmptyArray: [] },
      { idEmptyArray: { explode: false, style: 'simple' } }
    )).toThrow(`Unable to serialize path parameter idEmptyArray since an empty array of style='simple' is not supported.`);

    const filterArrayPathParametersSimpleExplode = serializePathParams(
      { idArrayToFilter: ['value1', undefined, null, 'value2'] },
      { idArrayToFilter: { explode: true, style: 'simple' } }
    );
    expect(filterArrayPathParametersSimpleExplode.idArrayToFilter).toEqual('value1,value2');

    const filterArrayPathParametersSimple = serializePathParams(
      { idArrayToFilter: ['value1', undefined, null, 'value2'] },
      { idArrayToFilter: { explode: false, style: 'simple' } }
    );
    expect(filterArrayPathParametersSimple.idArrayToFilter).toEqual('value1,value2');

    const emptyArrayPathParametersLabelExplode = serializePathParams(mockArrayData, {
      idEmptyArray: { explode: true, style: 'label' },
      idArrayToFilter: { explode: true, style: 'label' }
    });
    expect(emptyArrayPathParametersLabelExplode.idEmptyArray).toEqual('.');
    expect(emptyArrayPathParametersLabelExplode.idArrayToFilter).toEqual('.value1.value2');

    const emptyArrayPathParametersLabel = serializePathParams(mockArrayData, {
      idEmptyArray: { explode: false, style: 'label' },
      idArrayToFilter: { explode: false, style: 'label' }
    });
    expect(emptyArrayPathParametersLabel.idEmptyArray).toEqual('.');
    expect(emptyArrayPathParametersLabel.idArrayToFilter).toEqual('.value1,value2');

    const emptyArrayPathParametersMatrixExplode = serializePathParams(mockArrayData, {
      idEmptyArray: { explode: true, style: 'matrix' },
      idArrayToFilter: { explode: true, style: 'matrix' }
    });
    expect(emptyArrayPathParametersMatrixExplode.idEmptyArray).toEqual(';idEmptyArray');
    expect(emptyArrayPathParametersMatrixExplode.idArrayToFilter).toEqual(';idArrayToFilter=value1;idArrayToFilter=value2');

    const emptyArrayPathParametersMatrix = serializePathParams(mockArrayData, {
      idEmptyArray: { explode: false, style: 'matrix' },
      idArrayToFilter: { explode: false, style: 'matrix' }
    });
    expect(emptyArrayPathParametersMatrix.idEmptyArray).toEqual(';idEmptyArray');
    expect(emptyArrayPathParametersMatrix.idArrayToFilter).toEqual(';idArrayToFilter=value1,value2');
  });

  it('should correctly serialize parameters of type date', () => {
    const currentDate = new Date();
    const mockDateData = {
      idDate: currentDate,
      idUtilsDate: new utils.Date(new Date('2025-01-01T00:00:00')),
      idUtilsDateTime: new utils.DateTime(new Date('2025-01-01T00:00:00'))
    };
    const mockDateParams = getPropertiesFromData(mockDateData, ['idDate']);
    const mockUtilsDateParams = getPropertiesFromData(mockDateData, ['idUtilsDate']);
    const mockUtilsDateTimeParams = getPropertiesFromData(mockDateData, ['idUtilsDateTime']);

    expect(serializeQueryParams(mockDateParams, { idDate: { explode: true, style: 'form' } })).toEqual({ idDate: `idDate=${currentDate.toJSON()}` });
    expect(serializeQueryParams(mockUtilsDateParams, { idUtilsDate: { explode: true, style: 'form' } })).toEqual({ idUtilsDate: 'idUtilsDate=2025-01-01' });
    expect(serializeQueryParams(mockUtilsDateTimeParams, { idUtilsDateTime: { explode: true, style: 'form' } })).toEqual({ idUtilsDateTime: 'idUtilsDateTime=2025-01-01T00:00:00.000' });

    expect(serializePathParams(mockDateParams, { idDate: { explode: true, style: 'simple' } })).toEqual({ idDate: `${currentDate.toJSON()}` });
    expect(serializePathParams(mockUtilsDateParams, { idUtilsDate: { explode: true, style: 'simple' } })).toEqual({ idUtilsDate: '2025-01-01' });
    expect(serializePathParams(mockUtilsDateTimeParams, { idUtilsDateTime: { explode: true, style: 'simple' } })).toEqual({ idUtilsDateTime: '2025-01-01T00:00:00.000' });
  });
});
