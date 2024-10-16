package com.amadeus.codegen.ts;

import java.io.File;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Schema;

import org.apache.commons.lang3.StringUtils;

import org.openapitools.codegen.*;
import org.openapitools.codegen.config.GlobalSettings;
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

  private final boolean stringifyDate;
  private final boolean allowModelExtension;

  public AbstractTypeScriptClientCodegen() {
    super();
    LOGGER.warn("Starting custom generation");
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
      "Blob",
      "File",
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
    typeMapping.put("Integer", "number");
    typeMapping.put("float", "number");
    typeMapping.put("number", "number");
    typeMapping.put("long", "number");
    typeMapping.put("short", "number");
    typeMapping.put("char", "string");
    typeMapping.put("double", "number");
    typeMapping.put("object", "any");
    typeMapping.put("integer", "number");
    typeMapping.put("Map", "any");
    String allowModelExtensionString = GlobalSettings.getProperty("allowModelExtension");
    allowModelExtension = allowModelExtensionString != null ? !"false".equalsIgnoreCase(allowModelExtensionString) : false;
    String stringifyDateString = GlobalSettings.getProperty("stringifyDate");
    stringifyDate = stringifyDateString != null ? !"false".equalsIgnoreCase(stringifyDateString) : false;
    typeMapping.put("DateTime", stringifyDate ? "string" : "utils.DateTime");
    typeMapping.put("Date", stringifyDate ? "string" : "utils.Date");
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
    additionalProperties.put("keepRevivers", true);
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

  @Override
  public String getSchemaType(Schema schema) {
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


  public String getNameUsingModelPropertyNaming(String name) {
    switch (CodegenConstants.MODEL_PROPERTY_NAMING_TYPE.valueOf(this.modelPropertyNaming)) {
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

    if (property != null && !stringifyDate) {
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
        List<AbstractMap.SimpleEntry<String, String>> filteredSubTypes = new ArrayList<AbstractMap.SimpleEntry<String, String>>();
        for (String subType : sanitizedAllowableValues) {
          if (!StringUtils.equals(model.classname, subType)) {
            String mappedModelName = subType;
            if (model.discriminator.getMappedModels() != null) {
              for (CodegenDiscriminator.MappedModel mappedModel : new ArrayList<CodegenDiscriminator.MappedModel>(model.discriminator.getMappedModels())) {
                if (subType.equals(mappedModel.getMappingName())) {
                  mappedModelName = mappedModel.getModelName();
                  break;
                }
              }
            }
            filteredSubTypes.add(new AbstractMap.SimpleEntry(subType, mappedModelName));
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

    // If the x-date-timezone is present in the specification, replace utils.Date with Date
    if (("utils.Date".equals(property.dataType) || "utils.DateTime".equals(property.dataType)) && property.vendorExtensions.containsKey("x-date-timezone")) {
      property.dataType = "Date";
      property.datatypeWithEnum = "Date";
      property.baseType = "Date";
    }
    property.vendorExtensions.put("x-exposed-classname", model.classname);
  }

  /**
   * As we do not want to modify Swagger's generator, we need to remove the package from the imports.
   * Also, extracts additional imports from vendor extensions (used for dictionaries);
   * ie: model.Category becomes Category
   * import {Category} from './Category';
   */
  @Override
  public ModelsMap postProcessModels(ModelsMap objs) {
    List<ModelMap> models = objs.getModels();

    // Set additional properties and check non model objects
    for (ModelMap modelMap : models) {
      CodegenModel model = modelMap.getModel();
      if (model.isEnum) {
        nonObjectModels.add(toModelName(model.name));
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
   * Post process the import of a ModelsMap, make sure to include the field and the subtypes with their revivers
   * @param objs
   * @return
   */
  private ModelsMap postProcessImports(ModelsMap objs) {
    List<ModelMap> models = objs.getModels();
    // Store additional imports from vendor extensions
    List<Map<String, String>> importsMap = objs.getImports();
    List<String> alreadyImported = new ArrayList();
    for (Map _map : importsMap) {
      String _import = (String) _map.get("import");
      _map.put("import", _import.substring(_import.lastIndexOf(".") + 1));
      alreadyImported.add(_import.substring(_import.lastIndexOf(".") + 1));
    }
    for (ModelMap modelMap : models) {
      CodegenModel model = modelMap.getModel();
      boolean containsExtensions = false;
      ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
      group.add(model.allVars);
      group.add(model.vars);
      group.add(model.requiredVars);
      group.add(model.optionalVars);
      for (List<CodegenProperty> container : group) {
        for (CodegenProperty prop : container) {
          Map<String, Object> vendorExtensions = prop.vendorExtensions;
          List<String> importKeys = new ArrayList<String>();
          if (vendorExtensions.containsKey("x-field-type")) {
            containsExtensions = true;
            importKeys.add((String) vendorExtensions.get("x-field-type"));
          }
          Map<String, Object> vendors = model.vendorExtensions;
          if (vendors != null && vendors.containsKey("x-discriminator-subtypes")) {
            for (AbstractMap.SimpleEntry<String, String> entry : (List<AbstractMap.SimpleEntry<String, String>>) vendors.get("x-discriminator-subtypes")) {
              importKeys.add(entry.getValue());
            }
          }
          for (String importModel : importKeys) {
            if (!this.languageSpecificPrimitives.contains(importModel) && !alreadyImported.contains(importModel)) {
              alreadyImported.add(importModel);
              HashMap<String, String> addImport = new HashMap();
              addImport.put("import", importModel);
              importsMap.add(addImport);
            }
          }
        }

        // We store on the model's vendor extension a parameter saying our vars have vendor extensions (hence, a dictionary)
        if (containsExtensions) {
          model.vendorExtensions.put("requireDictionary", Boolean.TRUE);
        }
      }
    }

    return objs;
  }

  /**
   * This post-processing is to avoid the use of revivers from non-object models (e.g. enums in definition),
   * to remove intermediate classes with no use in the project and to adjust the imports
   */
  @Override
  public Map<String, ModelsMap> postProcessAllModels(Map<String, ModelsMap> objs) {
    System.out.println("Non object models: " + nonObjectModels.toString());
    for (Map.Entry<String, ModelsMap> entry : objs.entrySet()) {
      ModelsMap modelsMap = entry.getValue();
      List<ModelMap> modelMaps = modelsMap.getModels();
      for (ModelMap _modelMap : modelMaps) {
        CodegenModel model = _modelMap.getModel();
        boolean nonObjectDefinition = false;
        ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
        group.add(model.allVars);
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
    for (Map.Entry<String, ModelsMap> entry : objs.entrySet()) {
      entry.setValue(this.postProcessImports(entry.getValue()));
    }
    // if allowModelExtension is true, we don't need to analyze the conditions since we want to ensure the generation of the revivers
    if (!allowModelExtension) {
      Predicate<CodegenProperty> varRequiredReviverPredicate = var -> !(var.isPrimitiveType || var.complexType != null || var.isEnum || var.isEnumRef);
      Predicate<ModelMap> isNotEnumPredicate = modelMap -> !modelMap.getModel().isEnum;
      Predicate<ModelMap> requiredDictionaryPredicate = modelMap -> Boolean.TRUE.equals(modelMap.getModel().vendorExtensions.get("requireDictionary"));
      Predicate<ModelMap> anyVarRequiredReviverPredicate = modelMap -> modelMap.getModel().allVars.stream().anyMatch(varRequiredReviverPredicate);
      boolean reviversRequired = objs.values().stream().anyMatch(
        modelsMap -> modelsMap.getModels().stream().anyMatch(
          isNotEnumPredicate.and(requiredDictionaryPredicate.or(anyVarRequiredReviverPredicate))
        )
      );
      // Setting keepRevivers value in each model since the additionalProperties are set up before the post process
      objs.values().stream().forEach(modelsMap -> modelsMap.put("keepRevivers", reviversRequired));
      // Update global value of keepRevivers for the generation of api files as it happens after the generation of the models
      additionalProperties.put("keepRevivers", reviversRequired);

      if (!reviversRequired) {
        modelTemplateFiles.remove("model/reviver.mustache");
        Predicate<SupportingFile> isReviversTemplatePredicate = supportingFile -> "model/revivers.mustache".equals(supportingFile.getTemplateFile());
        supportingFiles.removeIf(isReviversTemplatePredicate);
      }
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
      if (operation.responses != null && operation.responses.size() > 0) {
        List<CodegenResponse> responses2xx = new ArrayList<>();
        Set<String> responses2xxReturnTypes = new HashSet<>();
        for (CodegenResponse response : operation.responses) {
          if (response.is2xx) {
            responses2xx.add(response);
            responses2xxReturnTypes.add(response.dataType == null ? "void" : response.dataType);
          }
        }
        if (responses2xx.size() > 0) {
          operation.vendorExtensions.put("responses2xx", responses2xx);
          operation.vendorExtensions.put("responses2xxReturnTypes", responses2xxReturnTypes);
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
      Schema additionalProperties = ModelUtils.getAdditionalProperties(schema);
      String inner = this.getSchemaType(additionalProperties);
      return (String) "Record<string, " + inner + ">";
    } else {
      return super.toInstantiationType(schema);
    }
  }
}
