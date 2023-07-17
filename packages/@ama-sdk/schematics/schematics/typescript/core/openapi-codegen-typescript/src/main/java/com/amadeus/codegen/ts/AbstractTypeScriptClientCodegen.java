package com.amadeus.codegen.ts;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Schema;

import org.apache.commons.lang3.StringUtils;

import org.openapitools.codegen.*;

import org.openapitools.codegen.model.*;
import org.openapitools.codegen.utils.ModelUtils;
import org.openapitools.codegen.utils.CamelizeOption;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.openapitools.codegen.utils.StringUtils.*;



/*
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005 -cp ".\target\typescriptFetch-openapi-generator-0.0.0.jar;openapi-generator-cli-5.1.1.jar" org.openapitools.codegen.OpenAPIGenerator generate -g typescriptFetch -e handlebars -i spec.yml -o . --global-property models=Acceptance
 */

public abstract class AbstractTypeScriptClientCodegen extends DefaultCodegen implements CodegenConfig {

  public final static String END_LINES = "\r\n";
  protected String modelPropertyNaming = "camelCase";
  protected Boolean supportsES6 = true;

  // Pattern to indicate which filepaths should be overwritten
  protected List<String> overwriteFilepathPatterns;
  // Pattern to indicate which filepaths should skip overwrite
  protected List<String> skipOverwriteFilepathPatterns;

  protected List<String> nonObjectModels;

  private final Logger LOGGER = LoggerFactory.getLogger(AbstractTypeScriptClientCodegen.class);

  public AbstractTypeScriptClientCodegen() {
    super();
    LOGGER.warn("Starting custom generation"
    );
    overwriteFilepathPatterns = new ArrayList<String>();
    skipOverwriteFilepathPatterns = new ArrayList<String>();
    // Holds the list of nonObjectModels (models that does not contain revivers)
    nonObjectModels = new ArrayList<String>();

    // clear import mapping (from default generator) as TS does not use it
    // at the moment
    importMapping.clear();

    supportsInheritance = true;

    // to support multiple inheritance e.g. export interface ModelC extends ModelA, ModelB
    supportsMultipleInheritance = true;

    setReservedWordsLowerCase(Arrays.asList(
      // local variable names used in API methods (endpoints)
      "varLocalPath", "queryParameters", "headerParams", "formParams", "useFormData", "varLocalDeferred",
      "requestOptions",
      // Typescript reserved words
      "abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"));

    languageSpecificPrimitives = new HashSet<String>(Arrays.asList(
      "string",
      "String",
      "boolean",
      "Boolean",
      "Double",
      "Integer",
      "Long",
      "Float",
      "Object",
      "Array",
      "Date",
      "utils.DateTime",
      "number",
      "Map",
      "any"
    ));
    instantiationTypes.put("array", "Array");

    typeMapping = new HashMap<String, String>();
    typeMapping.put("Array", "Array");
    typeMapping.put("array", "Array");
    typeMapping.put("List", "Array");
    typeMapping.put("boolean", "boolean");
    typeMapping.put("string", "string");
    typeMapping.put("int", "number");
    typeMapping.put("float", "number");
    typeMapping.put("number", "number");
    typeMapping.put("long", "number");
    typeMapping.put("short", "number");
    typeMapping.put("char", "string");
    typeMapping.put("double", "number");
    typeMapping.put("object", "any");
    typeMapping.put("integer", "number");
    typeMapping.put("Map", "any");
    typeMapping.put("DateTime", "utils.DateTime");
    typeMapping.put("Date", "utils.Date");
    //TODO binary should be mapped to byte array
    // mapped to String as a workaround
    typeMapping.put("binary", "string");
    typeMapping.put("ByteArray", "string");
    typeMapping.put("UUID", "string");
    typeMapping.put("URI", "string");

    cliOptions.add(new CliOption(CodegenConstants.MODEL_PROPERTY_NAMING, CodegenConstants.MODEL_PROPERTY_NAMING_DESC).defaultValue("camelCase"));
    cliOptions.add(new CliOption(CodegenConstants.SUPPORTS_ES6, CodegenConstants.SUPPORTS_ES6_DESC).defaultValue("false"));

    additionalProperties.put("addTabs", new LambdaHelper.AddTabs(1));
    additionalProperties.put("camelize", new CamelizeLambda(true));
    additionalProperties.put("trimComma", new LambdaHelper.TrimRightLambda(", \n\r"));
    additionalProperties.put("trimPipe", new LambdaHelper.TrimRightLambda("| \n\r"));
    additionalProperties.put("noBreakLine", new LambdaHelper.CleanBreakLineLambda());
    additionalProperties.put("noEmptyImportExport", new LambdaHelper.CleanEmptyImportExportLambda());
    additionalProperties.put("noEmptyImport", new LambdaHelper.CleanEmptyImportExportLambda("import(?:\\s+type)?"));
    additionalProperties.put("noUnusedImport", new LambdaHelper.RemoveUnusedImports());
    additionalProperties.put("noEmptyExport", new LambdaHelper.CleanEmptyImportExportLambda("export(?:\\s+type)?"));
    additionalProperties.put("noDuplicateParams", new LambdaHelper.RemoveDuplicateParams(", "));
    additionalProperties.put("noArrayInType", new LambdaHelper.CleanArraySuffix());
    additionalProperties.put("noDuplicateLine", new LambdaHelper.RemoveDuplicate(" *\\r?\\n *", System.getProperty("line.separator")));
    additionalProperties.put("simpleMath", new LambdaHelper.SimpleMathLambda());
    additionalProperties.put("uppercaseFirst", new LambdaHelper.UppercaseFirstLambda());
    additionalProperties.put("kebabCase", new LambdaHelper.KebabCaseLambda());
    additionalProperties.put("parseRegexp", new LambdaHelper.ParseRegexp());
    additionalProperties.put("plurialize", new LambdaHelper.Plurialize());
    additionalProperties.put("urlParamReplacer", new LambdaHelper.UrlParamReplacerLambda());
    additionalProperties.put("tokenizedUrlParamReplacer", new LambdaHelper.TokenizedUrlParamReplacerLambda());
    additionalProperties.put("apiFolderName", new LambdaHelper.ApiFolderName());
    additionalProperties.put("removeBrackets", new LambdaHelper.RemoveText("[]"));
    additionalProperties.put("removeFowardslash", new LambdaHelper.RemoveText("/"));
    additionalProperties.put("ignorePatchVersion", new LambdaHelper.RemoveEndText("\\.0"));
    additionalProperties.put("resourceFromPath", new LambdaHelper.ResourceFromPath());
    additionalProperties.put("areaFromPath", new LambdaHelper.AreaFromPath());
    additionalProperties.put("noEmptyLines", new LambdaHelper.RemoveEmptyLines());
    additionalProperties.put("replaceWithEmptyExportIfNeeded", new LambdaHelper.ReplaceWithTextIfEmpty("export {};"));
    additionalProperties.put("propertyDeclaration", new LambdaHelper.PropertyDeclaration());
    additionalProperties.put("propertyAccess", new LambdaHelper.PropertyAccess());
    additionalProperties.put("headerJsonMimeType", new LambdaHelper.HeaderJsonMimeType());
  }

  private static class CamelizeLambda extends LambdaHelper.CustomLambda {
    private final CamelizeOption camelizeOption;

    public CamelizeLambda(boolean lowerCaseFirst) {
      if (lowerCaseFirst) {
        this.camelizeOption = CamelizeOption.LOWERCASE_FIRST_CHAR;
      } else {
        this.camelizeOption = CamelizeOption.UPPERCASE_FIRST_CHAR;
      }
    }

    @Override
    public String formatFragment(String fragment) {
      return camelize(fragment, camelizeOption);
    }
  }

  @Override
  public void processOpts() {
    super.processOpts();

    if (additionalProperties.containsKey(CodegenConstants.MODEL_PROPERTY_NAMING)) {
      setModelPropertyNaming((String) additionalProperties.get(CodegenConstants.MODEL_PROPERTY_NAMING));
    }

    if (additionalProperties.containsKey(CodegenConstants.SUPPORTS_ES6)) {
      setSupportsES6(Boolean.valueOf((String) additionalProperties.get(CodegenConstants.SUPPORTS_ES6)));
      additionalProperties.put("supportsES6", getSupportsES6());
    }
  }


  @Override
  public CodegenType getTag() {
    return CodegenType.CLIENT;
  }

  @Override
  public String escapeReservedWord(String name) {
    return "_" + name;
  }

  @Override
  public String apiFileFolder() {
    return outputFolder + "/" + kebabCase(apiPackage());
  }

  @Override
  public String apiDocFileFolder() {
    return outputFolder + "/" + kebabCase(apiPackage());
  }

  @Override
  public String modelFileFolder() {
    return outputFolder + "/" + kebabCase(modelPackage());
  }

  @Override
  public String modelDocFileFolder() {
    return outputFolder + "/" + kebabCase(modelPackage());
  }

  @Override
  public String toParamName(String name) {
    // replace - with _ e.g. created-at => created_at
    name = name.replaceAll("-", "_");

    // if it's all uppper case, do nothing
    if (name.matches("^[A-Z_]*$"))
      return name;

    // camelize the variable name
    // pet_id => petId
    name = camelize(name, CamelizeOption.LOWERCASE_FIRST_CHAR);

    // for reserved word or word starting with number, append _
    if (isReservedWord(name) || name.matches("^\\d.*"))
      name = escapeReservedWord(name);

    return name;
  }

  @Override
  public String toVarName(String name) {
    // should be the same as variable name
    return getNameUsingModelPropertyNaming(name);
  }

  @Override
  public String toModelName(String name) {
    name = sanitizeName(name);

    // Generated model to manage an inline property in a referenced inline model ("_allOf_{{propertyName}}")
    // Does not refer to inline model generated to manage composition (cleaned during model post process) and
    // inheritance (kept as it is)
    if (name.contains("_allOf_")) {
      name = name.replace("_allOf", "");
    }

    if (!StringUtils.isEmpty(modelNamePrefix)) {
      name = modelNamePrefix + "_" + name;
    }

    if (!StringUtils.isEmpty(modelNameSuffix)) {
      name = name + "_" + modelNameSuffix;
    }

    // model name cannot use reserved keyword, e.g. return
    if (isReservedWord(name)) {
      String modelName = camelize("model_" + name);
      LOGGER.warn(name + " (reserved word) cannot be used as model name. Renamed to " + modelName);
      return modelName;
    }

    // model name starts with number
    if (name.matches("^\\d.*")) {
      String modelName = camelize("model_" + name); // e.g. 200Response => Model200Response (after camelize)
      LOGGER.warn(name + " (model name starts with number) cannot be used as model name. Renamed to " + modelName);
      return modelName;
    }

    // camelize the model name
    // phone_number => PhoneNumber
    return camelize(name);
  }

  public String apiFolderName(String name) {
    return kebabCase(toApiName(name).replaceFirst("(.*)Api$", "$1"));
  }

  @Override
  public String toApiFilename(String name) {
    String resName = kebabCase(toApiName(name));
    return apiFolderName(name) + "/" + resName;
  }

  @Override
  public String toApiDocFilename(String name) {
    // api Doc is used to generate index.ts file for each model
    return apiFolderName(name) + "/index";
  }

  @Override
  public String toModelFilename(String name) {
    // should be the same as the model name
    String resName = kebabCase(toModelName(name));
    return resName + "/" + resName;
  }

  @Override
  public String toModelDocFilename(String name) {
    // model Doc is used to generate index.ts file for each model
    return kebabCase(toModelName(name)) + "/index";
  }

  @Override
  public String toDefaultValue(Schema schema) {
    if (schema.getDefault() != null) {
      return schema.getDefault().toString();
    }

    return null;
  }

  @Override
  public String getTypeDeclaration(Schema p) {
    if (ModelUtils.isArraySchema(p)) {
      Schema items = getSchemaItems((ArraySchema) p);
      return getTypeDeclaration(ModelUtils.unaliasSchema(this.openAPI, items)) + "[]";
    } else if (ModelUtils.isMapSchema(p)) {
      Schema inner = getSchemaAdditionalProperties(p);
//      String nullSafeSuffix = getNullSafeAdditionalProps() ? " | undefined" : "";
      return "{ [key: string]: " + getTypeDeclaration(ModelUtils.unaliasSchema(this.openAPI, inner)) + "; }";
    } else if (ModelUtils.isFileSchema(p)) {
      return "any";
    }
    return super.getTypeDeclaration(p);
  }

  //  TODO check logic here, the way of handling stuff changed :(
  @Override
  public String getSchemaType(Schema schema) {
    // TODO test this use case as we can get much more type
    String swaggerType = super.getSchemaType(schema);
    String type = null;
    if (typeMapping.containsKey(swaggerType)) {
      type = typeMapping.get(swaggerType);

      if (languageSpecificPrimitives.contains(type))
        return type;
    } else
      type = swaggerType;
    return toModelName(type);
  }

  @Override
  public String toOperationId(String operationId) {
    // throw exception if method name is empty
    if (StringUtils.isEmpty(operationId)) {
      throw new RuntimeException("Empty method name (operationId) not allowed");
    }

    // method name cannot use reserved keyword, e.g. return
    // append _ at the beginning, e.g. _return
    if (isReservedWord(operationId)) {
      return escapeReservedWord(camelize(sanitizeName(operationId), CamelizeOption.LOWERCASE_FIRST_CHAR));
    }

    return camelize(sanitizeName(operationId), CamelizeOption.LOWERCASE_FIRST_CHAR);
  }

  public void setModelPropertyNaming(String naming) {
    if ("original".equals(naming) || "camelCase".equals(naming) ||
      "PascalCase".equals(naming) || "snake_case".equals(naming)) {
      this.modelPropertyNaming = naming;
    } else {
      throw new IllegalArgumentException("Invalid model property naming '" +
        naming + "'. Must be 'original', 'camelCase', " +
        "'PascalCase' or 'snake_case'");
    }
  }

  public String getModelPropertyNaming() {
    return this.modelPropertyNaming;
  }

  public String getNameUsingModelPropertyNaming(String name) {
    switch (CodegenConstants.MODEL_PROPERTY_NAMING_TYPE.valueOf(getModelPropertyNaming())) {
      case original:
        return name;
      case camelCase:
        return camelize(name, CamelizeOption.LOWERCASE_FIRST_CHAR);
      case PascalCase:
        return camelize(name);
      case snake_case:
        return underscore(name);
      default:
        throw new IllegalArgumentException("Invalid model property naming '" +
          name + "'. Must be 'original', 'camelCase', " +
          "'PascalCase' or 'snake_case'");
    }

  }

  @Override
  public String toEnumValue(String value, String datatype) {
    if ("number".equals(datatype)) {
      return value;
    } else {
      return "\'" + escapeText(value) + "\'";
    }
  }

  @Override
  public String toEnumDefaultValue(String value, String datatype) {
    return datatype + "_" + value;
  }

  @Override
  public String toEnumVarName(String name, String datatype) {
    // for symbol, e.g. $, #
    if (getSymbolName(name) != null) {
      return camelize(getSymbolName(name));
    }

    // number
    if ("number".equals(datatype)) {
      String varName = "NUMBER_" + name;

      varName = varName.replaceAll("-", "MINUS_");
      varName = varName.replaceAll("\\+", "PLUS_");
      varName = varName.replaceAll("\\.", "_DOT_");
      return varName;
    }

    // string
    String enumName = sanitizeName(name);
    enumName = enumName.replaceFirst("^_", "");
    enumName = enumName.replaceFirst("_$", "");

    // camelize the enum variable name
    // ref: https://basarat.gitbooks.io/typescript/content/docs/enums.html
    enumName = camelize(enumName);

    if (enumName.matches("\\d.*")) { // starts with number
      return "_" + enumName;
    } else {
      return enumName;
    }
  }

  @Override
  public String toEnumName(CodegenProperty property) {
    String enumName = toModelName(property.name) + "Enum";

    if (enumName.matches("\\d.*")) { // starts with number
      return "_" + enumName;
    } else {
      return enumName;
    }
  }

  /**
   * Ensures that date and datetime are not considered primitives.
   * Adds Vendor Extensions to properly describe the types.
   */
  @Override
  public void postProcessModelProperty(CodegenModel model, CodegenProperty property) {
    // remove recursive Import
    Iterator<String> iterator = model.imports.iterator();
    while (iterator.hasNext()) {
      String imp = iterator.next();
      if (imp.equals(model.classname)) {
        iterator.remove();
      }
    }

    if (property != null) {
      if (Boolean.TRUE.equals(property.isDate) || Boolean.TRUE.equals(property.isDateTime)) {
        property.isPrimitiveType = false;
      }
    }

    if (property.isEnum) {
      List<String> allowableValues = (List) property.allowableValues.get("values");
      List<String> sanitizedAllowableValues = allowableValues;

      /*
       * Here we want to sanitize Enum values, meaning removing leading _ if any so the type in the enum
       * matches the class name
       */
      if (model.discriminator != null && property.baseName.equals(model.discriminator.getPropertyBaseName())) {
        sanitizedAllowableValues = new ArrayList<String>();
        property.vendorExtensions.put("x-discriminator", "true");
        for (String allowableValue : allowableValues) {
          String sanitizedAllowableValue = allowableValue.startsWith("_") ? allowableValue.substring(1) : allowableValue;
          sanitizedAllowableValues.add(sanitizedAllowableValue);
        }

        // exclude the classname for revivers
        List<String> filteredSubTypes = new ArrayList<String>();
        for (String subType : sanitizedAllowableValues) {
          if (!StringUtils.equals(model.classname, subType)) {
            filteredSubTypes.add(subType);
          }
        }

        model.vendorExtensions.put("x-discriminator-subtypes", filteredSubTypes);
      }
      property.vendorExtensions.put("x-sanitized-allowable-values", sanitizedAllowableValues);
    }


    // Check that we have vendor extensions for dictionary
    if (property.vendorExtensions.containsKey("x-dictionary-name")) {
      boolean isPrimitive = false;
      boolean isRevived = false;

      String type = (String) property.vendorExtensions.get("x-field-type");
      if (typeMapping.containsKey(type) || languageSpecificPrimitives.contains(type)) {
        if (typeMapping.containsKey(type)) {
          property.vendorExtensions.put("x-field-type", (String) typeMapping.get(type));
        }
        isPrimitive = true;
      } else {
        isRevived = true;
      }

      property.vendorExtensions.put("x-field-is-primitive", isPrimitive);
      property.vendorExtensions.put("x-field-is-revived", isRevived);
    }

    if (property.vendorExtensions.containsKey("x-map-name") && !property.isArray) {
      throw new IllegalArgumentException("error in " + property.baseName + ", x-map-name should only apply to a "
        + "list container.");
    }

    // If the x-date-timezone is present in the timestamp, we use Date instead of utils.Date
    if (property.vendorExtensions.containsKey("x-date-timezone")) {
      property.dataType = "Date";
      property.datatypeWithEnum = "Date";
      property.baseType = "Date";
    }
    if (model.name.indexOf("_allOf") > -1 && model.discriminator != null) {
      property.vendorExtensions.put("x-exposed-classname", model.classname.replace("AllOf", ""));
    } else {
      property.vendorExtensions.put("x-exposed-classname", model.classname);
    }
  }

  /**
   * As we do not want to modify Swagger's generator, we need to remove the package from the imports.
   * Also, extracts additional imports from vendor extensions (used for dictionaries);
   * ie: model.Category becomes Category
   * import {Category} from './Category';
   */
  @Override
  public ModelsMap postProcessModels(ModelsMap objs) {
    List<Map<String, String>> importsMap = objs.getImports();
    for (Map _map : importsMap) {
      String _import = (String) _map.get("import");
      _map.put("import", _import.substring(_import.lastIndexOf(".") + 1));
    }

    // Store additional imports from vendor extensions
    if (importsMap != null) {
      List<String> alreadyImported = new ArrayList();
      List<ModelMap> models = objs.getModels();
      for (ModelMap modelMap : models) {
        CodegenModel model = modelMap.getModel();
        if (model.isEnum) {
          nonObjectModels.add(model.name);
        }
        if (model.name.endsWith("_allOf")) {
          model.vendorExtensions.put("x-intermediate-class", model.getDiscriminator() == null ? "composition" : "inheritance");
        }
        boolean containsExtensions = false;
        ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
        group.add(model.vars);
        if (model.vars.size() > 0 ) {
          System.out.println("model vars not empty");
        }
        group.add(model.requiredVars);
        group.add(model.optionalVars);
        for (List<CodegenProperty> container : group) {
          for (CodegenProperty prop : container) {
            Map<String, Object> vendorExtensions = prop.vendorExtensions;
            if (vendorExtensions.containsKey("x-field-type")) {
              containsExtensions = true;
              String fieldType = (String) vendorExtensions.get("x-field-type");
              if (!this.languageSpecificPrimitives.contains(fieldType) && !alreadyImported.contains(fieldType)) {
                alreadyImported.add(fieldType);
                HashMap addImport = new HashMap();
                addImport.put("import", vendorExtensions.get("x-field-type"));
                importsMap.add(addImport);
                System.out.println("Import added");
                System.out.println(addImport);
              }
            }
          }

          // We store on the model's vendor extension a parameter saying our vars have vendor extensions (hence, a dictionary)
          if (containsExtensions == true) {
            model.vendorExtensions.put("requireDictionary", Boolean.TRUE);
          }
        }
      }
    }

    return objs;
  }

  @Override
  protected void addImport(CodegenModel m, String type) {
    if (type == null) {
      return;
    }

    String[] parts = type.split("( [|&] )|[<>]");
    for (String s : parts) {
      if (needToImport(s)) {
        m.imports.add(s);
      }
    }
  }

  /**
   * This post-processing is to avoid the use of revivers from non-object models (e.g. enums in definition)
   */
  @Override
  public Map<String, ModelsMap> postProcessAllModels(Map<String, ModelsMap> objs) {
    System.out.println("Non object models: " + nonObjectModels.toString());
    for (Map.Entry<String, ModelsMap> entry : objs.entrySet()) {
      ModelsMap modelsMap = entry.getValue();
      List<ModelMap> modelMaps = modelsMap.getModels();
      for (ModelMap _modelMap : modelMaps) {
        CodegenModel model = _modelMap.getModel();
        // Codegen doesn't handle well allOf and discriminator in swagger spec v2
        // Fix to pass discriminator to the original model which has generated a technical AllOf parent
        if ("inheritance".equals(model.vendorExtensions.get("x-intermediate-class"))) {
          String classname = model.classname;
          CodegenModel child = ModelUtils.getModelByName(classname.substring(0, classname.length() - 5), objs);
          if (child != null) {
            child.discriminator = model.discriminator;
            child.vendorExtensions.put("x-discriminator-subtypes", model.vendorExtensions.get("x-discriminator-subtypes"));
          }
        }
        boolean nonObjectDefinition = false;
        ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
        group.add(model.vars);
        group.add(model.requiredVars);
        group.add(model.optionalVars);
        // Loops through allVars
        for (List<CodegenProperty> container : group) {
          for (CodegenProperty prop : container) {
            if (prop.complexType != null) {
              for (String str : nonObjectModels) { // Check if the complexType is in the nonObjectModels list
                if (prop.complexType.equals(str)) {
                  nonObjectDefinition = true;
                  break;
                }
              }
            }
            prop.vendorExtensions.put("nonObjectDefinition", nonObjectDefinition);
          }
        }
      }
    }
    objs = super.postProcessAllModels(objs);
    // Post process to remove all the references to intermediate models
    List<String> intermediateCompositionModels = objs.values().stream()
      .map(value -> getCodegenModel(value))
      .filter(model -> "composition".equals(model.vendorExtensions.get("x-intermediate-class")))
      .map(model -> model.getClassname())
      .filter(className -> className != null)
      .collect(Collectors.toList());

    if (intermediateCompositionModels.size() > 0) {
      objs = objs.entrySet().stream()
        .filter(entry ->
          intermediateCompositionModels.indexOf(getCodegenModel(entry.getValue()).getClassname()) == -1
        ).map(entry -> {
          ModelsMap modelsMap = entry.getValue();
          List<ModelMap> models = modelsMap.getModels().stream()
            .filter(modelMap -> intermediateCompositionModels.indexOf(modelMap.getModel().getClassname()) == -1)
            .map(modelMap -> {
              CodegenModel model = modelMap.getModel();
              modelMap.setModel(stripIntermediateModel(model, intermediateCompositionModels));
              return modelMap;
            })
            .collect(Collectors.toList());
          modelsMap.setModels(models);
          return entry;
        }).collect(Collectors.toMap(entry -> entry.getKey(), entry -> entry.getValue()));
    }
    return objs;
  }

  /**
   * Retrieve the first model in the model's map
   */
  private CodegenModel getCodegenModel(ModelsMap modelsMap) {
    final List<ModelMap> dataModelsList = modelsMap.getModels();
    if (dataModelsList != null) {
      for (final ModelMap entryMap : dataModelsList) {
        final CodegenModel model = entryMap.getModel();
        if (model != null) {
          return model;
        }
      }
    }
    return null;
  }

  /**
   * Clear all the references to intermediate models from the model
   *
   * @param model
   * @param intermediateModels
   * @return reference to the model
   */
  private CodegenModel stripIntermediateModel(CodegenModel model, List<String> intermediateModels) {
    List<CodegenModel> interfaceModelList = model.getInterfaceModels();
    if (interfaceModelList != null) {
      List<CodegenModel> interfaceModels = interfaceModelList.stream()
        .filter(interfaceModel -> intermediateModels.indexOf(interfaceModel.getClassname()) == -1)
        .collect(Collectors.toList());
      model.setInterfaceModels(interfaceModels);
    }
    List<String> interfaceList = model.getInterfaces();
    if (interfaceList != null) {
      model.setInterfaces(interfaceList.stream()
        .filter(interfaceName -> intermediateModels.indexOf(interfaceName) == -1)
        .collect(Collectors.toList())
      );
    }
    CodegenComposedSchemas composedSchema = model.getComposedSchemas();
    if (composedSchema != null) {
      List<CodegenProperty> filteredAllOf = composedSchema.getAllOf().stream()
        .filter(allOfProp -> intermediateModels.indexOf(allOfProp.baseType) == -1)
        .collect(Collectors.toList());
      model.setComposedSchemas(new CodegenComposedSchemas(filteredAllOf, composedSchema.getOneOf(), composedSchema.getAnyOf(), composedSchema.getNot()));
    }
    Set<String> filteredAllOf = model.allOf.stream()
      .filter(name -> intermediateModels.indexOf(name) == -1)
      .collect(Collectors.toSet());
    model.allOf = filteredAllOf;
    return model;
  }

  /**
   * As we do not want to modify Swagger's generator, we need to remove the package from the imports.
   * ie: model.Category becomes Category
   * import {Category} from './Category';
   * <p>
   * Also, TypeScript does not need JAVA imports, so remove them as well.
   * <p>
   * Group the parameters marked as containing personal information from all the operations into a global set.
   */
  @SuppressWarnings("static-method")
  public OperationsMap postProcessOperationsWithModels(OperationsMap objs, List<ModelMap> allModels) {
    for (Iterator<Map<String, String>> iter = objs.getImports().listIterator(); iter.hasNext(); ) {
      Map _map = iter.next();
      String _import = (String) _map.get("import");

      if (_import.startsWith(modelPackage + ".UtilsDate")) {
        iter.remove();
      } else if (_import.startsWith(modelPackage)) {
        _map.put("import", _import.substring(_import.lastIndexOf(".") + 1));
      } else {
        iter.remove();
      }
    }

    Set<String> piiParams = new HashSet<String>();
    OperationMap operations = objs.getOperations();
    List<CodegenOperation> operationList = operations.getOperation();

    for (CodegenOperation operation : operationList) {
      for (CodegenParameter param : operation.allParams) {
        if ((param.isQueryParam || param.isPathParam) && param.vendorExtensions.containsKey("x-risk-personal-data-field")) {
          piiParams.add(param.baseName);
        }
      }
    }
    operations.put("x-risk-personal-data-field-list", piiParams);
    return objs;
  }

  public void setSupportsES6(Boolean value) {
    supportsES6 = value;
  }

  public Boolean getSupportsES6() {
    return supportsES6;
  }

  @Override
  public String escapeQuotationMark(String input) {
    // remove ', " to avoid code injection
    return input.replace("\"", "").replace("'", "");
  }

  @Override
  public String escapeUnsafeCharacters(String input) {
    return input.replace("*/", "*_/").replace("/*", "/_*");
  }

  @Override
  public boolean shouldOverwrite(String filename) {
    for (String pattern : this.overwriteFilepathPatterns) {
      if (filename.matches(pattern)) {
        LOGGER.info("Force override for " + filename);
        return true;
      }
    }
    for (String pattern : this.skipOverwriteFilepathPatterns) {
      if (filename.matches(pattern)) {
        File f = new File(filename);
        if (f.isFile()) {
          LOGGER.info("Skip override for " + filename);
          return false;
        } else {
          LOGGER.info("No file found, creating " + filename);
          return true;
        }
      }
    }
    LOGGER.info("Default override rule for " + filename);
    return super.shouldOverwrite(filename);
  }

  public String getFilePathPattern(String folder, String fileExtension) {
    return getFilePathPattern(folder, fileExtension, true);
  }

  public String getFilePathPattern(String folder, String fileExtension, boolean recursive) {
    return getFilePathPattern(folder, fileExtension, true, true);
  }

  public String getFilePathPattern(String folder, String fileExtension, boolean recursive, boolean ignoreIndex) {
    String pattern = ".*(\\/|\\\\)" + folder.replaceAll("/", "(\\\\/|\\\\\\\\)") + "(\\/|\\\\)";
    if (recursive) {
      pattern += "(\\/|\\\\|\\w)*";
    }
    if (ignoreIndex) {
      pattern += "(?<!index)";
    }
    return pattern + fileExtension.replace(".", "\\.") + "$";
  }

  /////

  public void addModelFile(String template, String fileExtension) {
    addModelFile(template, fileExtension, true);
  }

  public void addModelFile(String template, String fileExtension, boolean overwrite) {
    String pattern = getFilePathPattern(modelPackage(), fileExtension);
    addModelFile(template, fileExtension, overwrite, pattern, modelTemplateFiles);
  }

  public void addModelFile(String template, String fileExtension, boolean overwrite, String pattern) {
    addModelFile(template, fileExtension, overwrite, pattern, modelTemplateFiles);
  }

  public void addModelFile(String template, String fileExtension, boolean overwrite, String
    pattern, Map<String, String> fileContainer) {
    addFile(template, fileExtension, overwrite, pattern, fileContainer);
  }

  ////////

  public void addApiFile(String template, String fileExtension) {
    addApiFile(template, fileExtension, true);
  }

  public void addApiFile(String template, String fileExtension, boolean overwrite) {
    String pattern = getFilePathPattern(apiPackage(), fileExtension);
    addApiFile(template, fileExtension, overwrite, pattern, apiTemplateFiles);
  }

  public void addApiFile(String template, String fileExtension, boolean overwrite, String pattern) {
    addApiFile(template, fileExtension, overwrite, pattern, apiTemplateFiles);
  }

  public void addApiFile(String template, String fileExtension, boolean overwrite, String pattern,
                         Map<String, String> fileContainer) {
    addFile(template, fileExtension, overwrite, pattern, fileContainer);
  }

  /////

  public void addSupportingFile(String template, String folder, String destinationFilename) {
    addSupportingFile(template, folder, destinationFilename, true);
  }

  public void addSupportingFile(String template, String folder, String destinationFilename, boolean overwrite) {
    String pattern = getFilePathPattern(folder, destinationFilename, false);
    addSupportingFile(template, folder, destinationFilename, overwrite, pattern);
  }

  public void addSupportingFile(String template, String folder, String destinationFilename, boolean overwrite,
                                String pattern) {
    supportingFiles.add(new SupportingFile(template, folder, destinationFilename));
    if (overwrite) {
      addForceOverwritePattern(pattern);
    } else {
      addSkipOverwritePattern(pattern);
    }
  }

  public void addForceOverwritePattern(String pattern) {
    this.overwriteFilepathPatterns.add(pattern);
  }

  public void addSkipOverwritePattern(String pattern) {
    this.skipOverwriteFilepathPatterns.add(pattern);
  }

  public void addFile(String template, String fileExtension, boolean overwrite, String
    pattern, Map<String, String> fileContainer) {
    fileContainer.put(template, fileExtension);
    if (overwrite) {
      addForceOverwritePattern(pattern);
    } else {
      addSkipOverwritePattern(pattern);
    }
  }

  public String lowerFirst(String str) {
    return str.length() > 0 ? Character.toLowerCase(str.charAt(0)) + str.substring(1) : "";
  }

  public String kebabCase(String str) {
    return str.length() > 0 ? lowerFirst(str).replaceAll("([A-Z])", "-$1").toLowerCase() : "";
  }

  /**
   * Override code-gen method to use `Record<string, T>` instead of `null<String, T>` for map definitions
   */
  @Override
  public String toInstantiationType(Schema schema) {
    if (ModelUtils.isMapSchema(schema)) {
      Schema additionalProperties = getAdditionalProperties(schema);
      String inner = this.getSchemaType(additionalProperties);
      return (String) "Record<string, " + inner + ">";
    } else {
      return super.toInstantiationType(schema);
    }
  }
}
