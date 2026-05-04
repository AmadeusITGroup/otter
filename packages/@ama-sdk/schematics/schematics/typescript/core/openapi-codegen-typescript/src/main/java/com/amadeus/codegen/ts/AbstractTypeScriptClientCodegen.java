package com.amadeus.codegen.ts;

import java.io.File;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Schema;

import org.apache.commons.lang3.StringUtils;

import org.openapitools.codegen.*;
import org.openapitools.codegen.config.GlobalSettings;
import org.openapitools.codegen.model.*;
import org.openapitools.codegen.utils.ModelUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.openapitools.codegen.utils.StringUtils.*;



/**
 * Abstract TypeScript client code generator with Otter-specific customizations.
 *
 * Extends the upstream OpenAPI Generator's AbstractTypeScriptClientCodegen with:
 * - Custom date handling (utils.Date, utils.DateTime) with timezone support via vendor extensions
 * - Reviver logic for TypeScript model deserialization
 * - Dictionary support via vendor extensions (x-dictionary-name, x-field-type)
 * - kebab-case file naming convention
 * - Custom Mustache lambda helpers for code generation
 * - Fine-grained file overwrite control
 *
 * Debug command example:
 * ```shell
 * java -agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address=5005 -cp ".\target\typescriptFetch-openapi-generator-0.0.0.jar;openapi-generator-cli-5.1.1.jar" org.openapitools.codegen.OpenAPIGenerator generate -g typescriptFetch -e handlebars -i spec.yml -o . --global-property models=Acceptance
 * ```
 */
public abstract class AbstractTypeScriptClientCodegen extends org.openapitools.codegen.languages.AbstractTypeScriptClientCodegen {

  /** Standard line endings used in generated files */
  public final static String END_LINES = "\r\n";

  /** Patterns of file paths that should be forcefully overwritten */
  protected List<String> overwriteFilepathPatterns;

  /** Patterns of file paths that should skip overwriting if they already exist */
  protected List<String> skipOverwriteFilepathPatterns;

  /** List of non-object models (e.g., enums) that do not require revivers for deserialization */
  protected List<String> nonObjectModels;

  private final Logger LOGGER = LoggerFactory.getLogger(AbstractTypeScriptClientCodegen.class);

  /** Whether to stringify Date objects to strings (GlobalSettings: stringifyDate, default: true) */
  private final boolean stringifyDate;

  /** Whether to allow model extension for reviver generation (GlobalSettings: allowModelExtension, default: false) */
  private final boolean allowModelExtension;

  /** Whether to use legacy date extension with utils.Date/utils.DateTime (GlobalSettings: useLegacyDateExtension, default: false) */
  private final boolean useLegacyDateExtension;

  /** Custom request body transformation logic (GlobalSettings: requestBodyTransform, default: empty) */
  private final String requestBodyTransform;

  /**
   * Constructor for Otter-specific TypeScript client code generator.
   *
   * Initializes the generator with Otter-specific customizations on top of the upstream AbstractTypeScriptClientCodegen:
   * - Reads GlobalSettings properties for Otter-specific behavior (allowModelExtension, useLegacyDateExtension, stringifyDate, requestBodyTransform)
   * - Adds custom date type mappings (utils.Date, utils.DateTime) based on configuration
   * - Enables ES6 support by default
   * - Registers 20+ custom Mustache lambda helpers for advanced template processing
   */
  public AbstractTypeScriptClientCodegen() {
    super();
    LOGGER.warn("Starting custom generation");
    overwriteFilepathPatterns = new ArrayList<String>();
    skipOverwriteFilepathPatterns = new ArrayList<String>();
    // Holds the list of nonObjectModels (models that does not contain revivers)
    nonObjectModels = new ArrayList<String>();

    // Custom Otter-specific configuration
    String allowModelExtensionString = GlobalSettings.getProperty("allowModelExtension");
    String useLegacyDateExtensionString = GlobalSettings.getProperty("useLegacyDateExtension");
    useLegacyDateExtension = useLegacyDateExtensionString != null ? !"false".equalsIgnoreCase(useLegacyDateExtensionString) : false;
    allowModelExtension = allowModelExtensionString != null ? !"false".equalsIgnoreCase(allowModelExtensionString) : false;
    String stringifyDateString = GlobalSettings.getProperty("stringifyDate");
    stringifyDate = stringifyDateString != null ? !"false".equalsIgnoreCase(stringifyDateString) : true;
    String requestBodyTransformString = GlobalSettings.getProperty("requestBodyTransform");
    requestBodyTransform = requestBodyTransformString != null ? requestBodyTransformString : "";

    // Add custom type mappings for Otter date handling
    languageSpecificPrimitives.add("utils.DateTime");
    languageSpecificPrimitives.add("utils.Date");
    typeMapping.put("DateTime", useLegacyDateExtension ? "utils.DateTime" : getDateTimeStandardTime(stringifyDate));
    typeMapping.put("Date", useLegacyDateExtension ? "utils.Date" : getDateType(stringifyDate));

    // Override ES6 support
    setSupportsES6(true);

    additionalProperties.put("addTabs", new LambdaHelper.AddTabs(1));
    additionalProperties.put("camelize", new LambdaHelper.CamelizeLambda(true));
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
    additionalProperties.put("upperSnakeCase", new LambdaHelper.UpperSnakeCaseLambda());
    additionalProperties.put("parseRegexp", new LambdaHelper.ParseRegexp());
    additionalProperties.put("plurialize", new LambdaHelper.Plurialize());
    additionalProperties.put("urlParamReplacer", new LambdaHelper.UrlParamReplacerLambda());
    additionalProperties.put("urlSerializedParamReplacer", new LambdaHelper.UrlSerializedParamReplacerLambda());
    additionalProperties.put("tokenizedUrlParamReplacer", new LambdaHelper.TokenizedUrlParamReplacerLambda());
    additionalProperties.put("tokenizedUrlSerializedParamReplacer", new LambdaHelper.TokenizedUrlSerializedParamReplacerLambda());
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
    additionalProperties.put("transformBodyRequest", new LambdaHelper.TransformBodyRequest(requestBodyTransform));
  }

  @Override
  public CodegenType getTag() {
    return CodegenType.CLIENT;
  }

  @Override
  public String escapeReservedWord(String name) {
    return "_" + name;
  }

  /**
   * Otter-specific override: Escapes text for use in generated code, with custom handling for parentheses.
   *
   * **Difference from base:** After applying the base escaping logic, this implementation also unescapes
   * parentheses that are escaped as part of the base logic. This is necessary to allow valid TypeScript syntax
   * in certain contexts (e.g., function types, mapped types) where parentheses are used and should not be escaped.
   *
   * @param input the text to escape
   * @return the escaped text with parentheses unescaped
   */
  @Override
  public String escapeText(String input) {
    String result = super.escapeText(input);
    if (result == null) {
      return null;
    }
    return result.replaceAll("\\\\([\"'])", "$1");
  }

  /**
   * Otter-specific override: Returns the API file folder using kebab-case naming convention.
   *
   * **Difference from base:** Applies kebab-case transformation to the API package name,
   * while the base implementation uses the package name as-is.
   *
   * @return the API file folder path in kebab-case format (e.g., "output/pet-api")
   */
  @Override
  public String apiFileFolder() {
    return outputFolder + "/" + kebabCase(apiPackage());
  }

  /**
   * Otter-specific override: Returns the API documentation file folder using kebab-case naming convention.
   *
   * **Difference from base:** Applies kebab-case transformation to the API package name,
   * while the base implementation uses the package name as-is.
   *
   * @return the API documentation file folder path in kebab-case format
   */
  @Override
  public String apiDocFileFolder() {
    return outputFolder + "/" + kebabCase(apiPackage());
  }

  /**
   * Otter-specific override: Returns the model file folder using kebab-case naming convention.
   *
   * **Difference from base:** Applies kebab-case transformation to the model package name,
   * while the base implementation uses the package name as-is.
   *
   * @return the model file folder path in kebab-case format (e.g., "output/pet-model")
   */
  @Override
  public String modelFileFolder() {
    return outputFolder + "/" + kebabCase(modelPackage());
  }

  /**
   * Otter-specific override: Returns the model documentation file folder using kebab-case naming convention.
   *
   * **Difference from base:** Applies kebab-case transformation to the model package name,
   * while the base implementation uses the package name as-is.
   *
   * @return the model documentation file folder path in kebab-case format
   */
  @Override
  public String modelDocFileFolder() {
    return outputFolder + "/" + kebabCase(modelPackage());
  }

  /**
   * Otter-specific override: Returns the default value for a schema.
   *
   * **Difference from base:** Returns null explicitly when no default is present,
   * while delegating to the base implementation when a default value exists.
   *
   * @param schema the schema to extract default value from
   * @return the default value as a string, or null if no default is present
   */
  @Override
  public String toDefaultValue(Schema schema) {
    if (schema.getDefault() != null) {
      return super.toDefaultValue(schema);
    }

    return null;
  }

  /**
   * Otter-specific override: Converts a model name to the proper TypeScript format.
   *
   * **Difference from base:** Handles the special "_allOf_" pattern used for inline properties
   * in referenced inline models. This pattern is specific to Otter's model composition handling.
   * After removing the "_allOf" prefix, delegates to the base implementation for standard processing.
   *
   * @param name the model name to convert
   * @return the converted model name in PascalCase
   */
  @Override
  public String toModelName(String name) {
    name = sanitizeName(name);

    // Custom: Generated model to manage an inline property in a referenced inline model ("_allOf_{{propertyName}}")
    // Does not refer to inline model generated to manage composition (cleaned during model post process) and
    // inheritance (kept as it is)
    if (name.contains("_allOf_")) {
      name = name.replace("_allOf", "");
    }

    return super.toModelName(name);
  }

  /**
   * Returns the API folder name in kebab-case format.
   *
   * Otter-specific: Converts the API name to kebab-case and removes the "Api" suffix.
   * For example, "PetApi" becomes "pet".
   *
   * @param name the API name
   * @return the API folder name in kebab-case format
   */
  public String apiFolderName(String name) {
    return kebabCase(toApiName(name).replaceFirst("(.*)Api$", "$1"));
  }

  /**
   * Otter-specific override: Returns the API filename with nested folder structure.
   *
   * **Difference from base:** Uses nested folder structure with kebab-case naming.
   * For example, "PetApi" becomes "pet/pet-api" instead of just "PetApi".
   *
   * @param name the API name
   * @return the API filename with folder structure (e.g., "pet/pet-api")
   */
  @Override
  public String toApiFilename(String name) {
    String resName = kebabCase(toApiName(name));
    return apiFolderName(name) + "/" + resName;
  }

  /**
   * Otter-specific override: Returns the API documentation filename (index file).
   *
   * **Difference from base:** Generates an index.ts file within the API folder
   * for barrel exports. For example, "PetApi" becomes "pet/index".
   *
   * @param name the API name
   * @return the API documentation filename (e.g., "pet/index")
   */
  @Override
  public String toApiDocFilename(String name) {
    // api Doc is used to generate index.ts file for each model
    return apiFolderName(name) + "/index";
  }

  /**
   * Otter-specific override: Returns the model filename with nested folder structure.
   *
   * **Difference from base:** Uses nested folder structure with kebab-case naming.
   * For example, "Pet" becomes "pet/pet" instead of just "Pet".
   * This creates a folder-per-model structure.
   *
   * @param name the model name
   * @return the model filename with folder structure (e.g., "pet/pet")
   */
  @Override
  public String toModelFilename(String name) {
    // should be the same as the model name
    String resName = kebabCase(toModelName(name));
    return resName + "/" + resName;
  }

  /**
   * Otter-specific override: Returns the model documentation filename (index file).
   *
   * **Difference from base:** Generates an index.ts file within the model folder
   * for barrel exports. For example, "Pet" becomes "pet/index".
   *
   * @param name the model name
   * @return the model documentation filename (e.g., "pet/index")
   */
  @Override
  public String toModelDocFilename(String name) {
    // model Doc is used to generate index.ts file for each model
    return kebabCase(toModelName(name)) + "/index";
  }


  /**
   * Otter-specific override: Post-processes model properties with custom handling for dates, enums, and dictionaries.
   *
   * **Difference from base:** Adds extensive Otter-specific logic including:
   * - Dictionary vendor extensions support (x-dictionary-name, x-field-name, x-field-type)
   * - x-map-name vendor extension validation
   * - Custom date handling with x-local-timezone and x-date-timezone vendor extensions
   * - Discriminator subtype filtering for reviver generation
   * - x-exposed-classname vendor extension for runtime type information
   *
   * The base implementation handles discriminator properties and ensures date/datetime types are properly marked.
   *
   * @param model the CodegenModel containing the property
   * @param property the CodegenProperty to post-process
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
      String name = (String) property.vendorExtensions.get("x-field-name");
      String type = (String) property.vendorExtensions.get("x-field-type");
      boolean propertyNameExists = false;
      // Check if a property with the same name and type already exists
      for (CodegenProperty prop : model.vars) {
        if (type.equals(prop.baseType) && name.equals(prop.baseName)) {
          String textToAdd = "Property is backed up as a dictionary extraction";
          // Check if the text hasn't already been added
          if (prop.description == null || !prop.description.contains(textToAdd)) {
              prop.description = (prop.description != null && !prop.description.isEmpty())
                  ? prop.description + " " + textToAdd
                  : textToAdd;
          }
          propertyNameExists = true;
          break;
        }
      }
      property.vendorExtensions.put("x-field-exists", propertyNameExists);

      boolean isPrimitive = false;
      boolean isRevived = false;

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
    if (property.isDate || property.isDateTime) {
      String dateDataTypeOverride = this.getDateDataTypeOverride(property.name, property.isDateTime, property.vendorExtensions);
      if (dateDataTypeOverride != null) {
        property.dataType = dateDataTypeOverride;
        property.datatypeWithEnum = dateDataTypeOverride;
        property.baseType = dateDataTypeOverride;
      }

      if (property != null && property.dataType != null && property.dataType.matches("^(Date|utils.Date|utils.DateTime)$")) {
        property.isPrimitiveType = false;
      }
    }

    // Convert Array<T> to T[] format for TypeScript, handling nested arrays
    property.dataType = convertArraySyntaxToTypeScript(property.dataType);
    property.datatypeWithEnum = convertArraySyntaxToTypeScript(property.datatypeWithEnum);

    property.vendorExtensions.put("x-exposed-classname", model.classname);
  }

  /**
   * Otter-specific: Computes the date type for date or date-time properties considering local timezone offset.
   *
   * Handles Otter-specific vendor extensions:
   * - x-local-timezone: Forces utils.DateTime for datetime (respects local timezone)
   * - x-date-timezone: (deprecated) Forces standard Date/string for datetime
   *
   * Validates that conflicting vendor extensions are not used together and provides migration guidance.
   *
   * @param name the property name (for error messages)
   * @param isDateTime true if the property is date-time format, false if date only
   * @param extensions the vendor extensions map to check for timezone directives
   * @return the override data type (utils.DateTime, utils.Date, string, or Date), or null if no override
   * @throws IllegalArgumentException if incompatible vendor extensions are used together
   */
  private String getDateDataTypeOverride(String name, boolean isDateTime, Map<String, Object> extensions) {
    boolean activateLocalDateTime = extensions.containsKey("x-local-timezone");
    boolean deactivateLocalDateTime = extensions.containsKey("x-date-timezone");

    if (activateLocalDateTime && deactivateLocalDateTime) {
      throw new IllegalArgumentException("The 'x-local-timezone' and the 'x-date-timezone' vendor are not compatible.");
    } else if (deactivateLocalDateTime && !useLegacyDateExtension) {
      throw new IllegalArgumentException("'x-date-timezone' is deprecated and conflicts with the 'x-local-timezone' vendor." +
        " Please check out the documentation and migrate to the 'x-local-timezone' model: https://github.com/AmadeusITGroup/otter/blob/main/migration-guides/11.0.md."
      );
    } else if (activateLocalDateTime && useLegacyDateExtension) {
      LOGGER.error("Unsupported 'x-local-timezone' vendor found for property " + name + " while using the " +
        "'useLegacyDateExtension'. The vendor will be ignored in this scenario, please deactivate the " +
        "'useLegacyDateExtension if you want to use this vendor.");
      activateLocalDateTime = false;
    }

    if (isDateTime) {
      if (activateLocalDateTime) {
        return "utils.DateTime";
      }
      if (deactivateLocalDateTime) {
        return this.getDateTimeStandardTime(stringifyDate);
      }
      return typeMapping.get("DateTime");
    }

    if (activateLocalDateTime) {
      LOGGER.error(name + " has the 'x-local-timezone' vendor which is only compatible for date-time format. This will " +
        "be ignored and normal logic will apply.");
      return null;
    }
    if (deactivateLocalDateTime) {
      return this.getDateType(stringifyDate);
    }

    return typeMapping.get("Date");
  }

  /**
   * Otter-specific: Post-processes operation parameters with custom date handling and serialization defaults.
   *
   * Otter-specific logic:
   * - Applies date type overrides based on x-local-timezone/x-date-timezone vendor extensions
   * - Marks utils.Date/utils.DateTime types as non-primitive for proper reviver handling
   * - Sets Otter default parameter serialization for Swagger 2.0 (form style for query, simple for path)
   * - Converts Array<T> format to T[] format for TypeScript array types
   *
   * @param parameter the CodegenParameter to post-process
   */
  public void postProcessParameter(CodegenParameter parameter) {
    if (parameter.isDate || parameter.isDateTime) {
      String dateDataTypeOverride = this.getDateDataTypeOverride(parameter.paramName, parameter.isDateTime, parameter.vendorExtensions);
      if (dateDataTypeOverride != null) {
        parameter.dataType = dateDataTypeOverride;
        parameter.datatypeWithEnum = dateDataTypeOverride;
        parameter.baseType = dateDataTypeOverride;
      }

      if (parameter != null && parameter.dataType != null && parameter.dataType.matches("^(Date|utils.Date|utils.DateTime)$")) {
        parameter.isPrimitiveType = false;
      }
    }

    // Convert Array<T> to T[] format for TypeScript, handling nested arrays
    parameter.dataType = convertArraySyntaxToTypeScript(parameter.dataType);
    parameter.datatypeWithEnum = convertArraySyntaxToTypeScript(parameter.datatypeWithEnum);

    // Set Otter default parameter serialization for Swagger 2.0
    if (parameter.style == null || "".equals(parameter.style)) {
      if (parameter.isQueryParam) {
        parameter.isExplode = false;
        parameter.style = "form";
      } else if (parameter.isPathParam) {
        parameter.isExplode = false;
        parameter.style = "simple";
      }
    }
  }

  /**
   * Otter-specific: Returns the TypeScript type for date-time objects without timezone modification.
   *
   * Used for date-time properties that should preserve the timezone as-is (standard ISO 8601 format).
   *
   * @param isDateStringified true if dates should be represented as strings, false for Date objects
   * @return "string" if dates are stringified, "Date" otherwise
   */
  private String getDateTimeStandardTime(boolean isDateStringified) {
    return isDateStringified ? "string" : "Date";
  }

  /**
   * Otter-specific: Returns the TypeScript type for date objects (date-only, no time component).
   *
   * Used for date properties that represent calendar dates without time information.
   *
   * @param isDateStringified true if dates should be represented as strings, false for utils.Date objects
   * @return "string" if dates are stringified, "utils.Date" otherwise (custom Otter type for date-only values)
   */
  private String getDateType(boolean isDateStringified) {
    return isDateStringified ? "string" : "utils.Date";
  }

  /**
   * Otter-specific: Converts TypeScript Array<T> syntax to T[] syntax, handling nested arrays.
   *
   * Iteratively converts from innermost to outermost arrays:
   * - Array<string> → string[]
   * - Array<Array<string>> → string[][]
   * - Record<string, Array<Pet>> → Record<string, Pet[]>
   *
   * @param dataType the data type string to convert (may be null)
   * @return the converted data type with T[] syntax, or null if input is null
   */
  private String convertArraySyntaxToTypeScript(String dataType) {
    if (dataType == null) {
      return null;
    }

    // Iteratively convert from innermost to outermost
    // Pattern matches Array<content> where content has no nested angle brackets
    while (dataType.matches(".*Array<.*>.*")) {
      dataType = dataType.replaceAll("Array<([^<>]+)>", "$1[]");
    }

    return dataType;
  }

  /**
   * Otter-specific override: Post-processes models to track non-object models (enums).
   *
   * **Difference from base:** Maintains a list of enum models in the `nonObjectModels` collection.
   * This list is used later to determine which models do not require revivers for deserialization,
   * as enums don't need complex object revival logic. The base implementation handles model preprocessing
   * without this enum tracking.
   *
   * @param objs the ModelsMap containing all models to process
   * @return the processed ModelsMap
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

  /**
   * Otter-specific override: Returns the TypeScript type declaration for a schema.
   *
   * **Difference from base:** Handles array types with custom logic, using TypeScript's
   * array suffix notation (e.g., "Pet[]") instead of the base implementation's approach.
   * For non-array types, delegates to the base implementation.
   *
   * @param p the schema to generate a type declaration for
   * @return the TypeScript type declaration string (e.g., "Pet[]", "Record<string, Pet>")
   */
  @Override
  public String getTypeDeclaration(Schema p) {
    if (ModelUtils.isArraySchema(p)) {
      Schema items = ModelUtils.getSchemaItems(p);
      return getTypeDeclaration(ModelUtils.unaliasSchema(this.openAPI, items)) + "[]";
    } else if (ModelUtils.isMapSchema(p)) {
      Schema inner = getSchemaAdditionalProperties(p);
      return "Record<string, " + getTypeDeclaration(ModelUtils.unaliasSchema(this.openAPI, inner)) + ">";
    }
    return super.getTypeDeclaration(p);
  }

  /**
   * Otter-specific: Post-processes imports in a ModelsMap to include fields and subtypes with their revivers.
   *
   * Handles Otter-specific import requirements:
   * - Removes package prefixes from imports (model.Category → Category)
   * - Extracts additional imports from x-field-type vendor extensions (for dictionary support)
   * - Includes discriminator subtypes for reviver generation
   * - Sets requireDictionary vendor extension when dictionary fields are present
   *
   * @param objs the ModelsMap to process imports for
   * @return the ModelsMap with processed imports
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
   * Otter-specific override: Post-processes all models with reviver logic and import management.
   *
   * **Difference from base:** Implements Otter-specific reviver generation logic:
   * - Marks properties that reference non-object models (enums) with nonObjectDefinition vendor extension
   * - Determines if revivers are needed based on model complexity (dictionaries, non-primitive types)
   * - Sets keepRevivers flag globally and per-model to control reviver template generation
   * - Removes reviver templates if not needed to reduce generated code size
   * - Calls postProcessImports to handle Otter-specific import requirements
   *
   * The base implementation handles standard model post-processing without the reviver optimization logic.
   *
   * @param objs map of all models to post-process
   * @return the processed models map
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
   * Otter-specific: Post-processes operations with custom import handling and PII tracking.
   *
   * Otter-specific logic:
   * - Removes package prefixes from TypeScript imports (model.Category → Category)
   * - Filters out non-TypeScript imports (Java-style imports)
   * - Collects parameters marked with x-risk-personal-data-field vendor extension for PII compliance
   * - Groups 2xx responses with their return types for template processing
   *
   * @param objs the OperationsMap to post-process
   * @param allModels list of all models (unused but required by signature)
   * @return the processed OperationsMap with cleaned imports and PII parameter tracking
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

  /**
   * Sets the ES6 support flag.
   *
   * @param value true to enable ES6 features, false otherwise
   */
  public void setSupportsES6(Boolean value) {
    supportsES6 = value;
  }

  /**
   * Gets the ES6 support flag.
   *
   * @return true if ES6 features are enabled, false otherwise
   */
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

  /**
   * Otter-specific override: Determines if a file should be overwritten with fine-grained pattern control.
   *
   * **Difference from base:** Implements a three-tier decision process:
   * 1. Force overwrite if filename matches any pattern in overwriteFilepathPatterns
   * 2. Skip overwrite if filename matches skipOverwriteFilepathPatterns and file exists
   * 3. Delegate to base implementation for standard behavior
   *
   * This allows generators to have fine control over which files are always regenerated (e.g., models)
   * and which should be preserved if they exist (e.g., custom configuration files).
   *
   * @param filename the absolute path of the file to check
   * @return true if the file should be overwritten, false if it should be preserved
   */
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

  /**
   * Generates a regex pattern to match file paths.
   *
   * Defaults to recursive matching with index files excluded.
   *
   * @param folder the folder path to match
   * @param fileExtension the file extension to match (e.g., ".ts")
   * @return a regex pattern string
   */
  public String getFilePathPattern(String folder, String fileExtension) {
    return getFilePathPattern(folder, fileExtension, true);
  }

  /**
   * Generates a regex pattern to match file paths.
   *
   * Defaults to excluding index files.
   *
   * @param folder the folder path to match
   * @param fileExtension the file extension to match (e.g., ".ts")
   * @param recursive true to match files in subdirectories recursively
   * @return a regex pattern string
   */
  public String getFilePathPattern(String folder, String fileExtension, boolean recursive) {
    return getFilePathPattern(folder, fileExtension, true, true);
  }

  /**
   * Otter-specific: Generates a regex pattern to match file paths with customizable options.
   *
   * Creates a cross-platform regex pattern (handles both / and \ path separators) that matches
   * files in a specific folder with a given extension. Used for fine-grained file overwrite control.
   *
   * @param folder the folder path to match
   * @param fileExtension the file extension to match (e.g., ".ts")
   * @param recursive true to match files in subdirectories recursively
   * @param ignoreIndex true to exclude index files from the pattern
   * @return a regex pattern string for matching file paths
   */
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

  /**
   * Otter-specific: Registers a model template file with default overwrite behavior.
   *
   * Convenience method that defaults to overwriting existing files.
   *
   * @param template the Mustache template name (e.g., "model/model.mustache")
   * @param fileExtension the file extension to generate (e.g., ".ts")
   */
  public void addModelFile(String template, String fileExtension) {
    addModelFile(template, fileExtension, true);
  }

  /**
   * Otter-specific: Registers a model template file with configurable overwrite behavior.
   *
   * Generates a file path pattern for the model package automatically.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   */
  public void addModelFile(String template, String fileExtension, boolean overwrite) {
    String pattern = getFilePathPattern(modelPackage(), fileExtension);
    addModelFile(template, fileExtension, overwrite, pattern, modelTemplateFiles);
  }

  /**
   * Otter-specific: Registers a model template file with custom pattern matching.
   *
   * Allows specifying a custom regex pattern for file matching.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   * @param pattern custom regex pattern for matching files
   */
  public void addModelFile(String template, String fileExtension, boolean overwrite, String pattern) {
    addModelFile(template, fileExtension, overwrite, pattern, modelTemplateFiles);
  }

  /**
   * Otter-specific: Registers a model template file with full customization.
   *
   * Final implementation that registers the template in the specified file container.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   * @param pattern custom regex pattern for matching files
   * @param fileContainer the container map to add the template to (usually modelTemplateFiles)
   */
  public void addModelFile(String template, String fileExtension, boolean overwrite, String
    pattern, Map<String, String> fileContainer) {
    addFile(template, fileExtension, overwrite, pattern, fileContainer);
  }

  /**
   * Otter-specific: Registers an API template file with default overwrite behavior.
   *
   * Convenience method that defaults to overwriting existing files.
   *
   * @param template the Mustache template name (e.g., "api/api.mustache")
   * @param fileExtension the file extension to generate (e.g., ".ts")
   */
  public void addApiFile(String template, String fileExtension) {
    addApiFile(template, fileExtension, true);
  }

  /**
   * Otter-specific: Registers an API template file with configurable overwrite behavior.
   *
   * Generates a file path pattern for the API package automatically.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   */
  public void addApiFile(String template, String fileExtension, boolean overwrite) {
    String pattern = getFilePathPattern(apiPackage(), fileExtension);
    addApiFile(template, fileExtension, overwrite, pattern, apiTemplateFiles);
  }

  /**
   * Otter-specific: Registers an API template file with custom pattern matching.
   *
   * Allows specifying a custom regex pattern for file matching.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   * @param pattern custom regex pattern for matching files
   */
  public void addApiFile(String template, String fileExtension, boolean overwrite, String pattern) {
    addApiFile(template, fileExtension, overwrite, pattern, apiTemplateFiles);
  }

  /**
   * Otter-specific: Registers an API template file with full customization.
   *
   * Final implementation that registers the template in the specified file container.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to always overwrite, false to preserve existing files
   * @param pattern custom regex pattern for matching files
   * @param fileContainer the container map to add the template to (usually apiTemplateFiles)
   */
  public void addApiFile(String template, String fileExtension, boolean overwrite, String pattern,
                         Map<String, String> fileContainer) {
    addFile(template, fileExtension, overwrite, pattern, fileContainer);
  }

  /**
   * Otter-specific: Registers a supporting file with default overwrite behavior.
   *
   * Convenience method that defaults to overwriting existing files.
   * Supporting files are non-model/non-API files (e.g., utilities, configuration).
   *
   * @param template the Mustache template name
   * @param folder the destination folder
   * @param destinationFilename the destination filename
   */
  public void addSupportingFile(String template, String folder, String destinationFilename) {
    addSupportingFile(template, folder, destinationFilename, true);
  }

  /**
   * Otter-specific: Registers a supporting file with configurable overwrite behavior.
   *
   * Generates a non-recursive file path pattern automatically.
   *
   * @param template the Mustache template name
   * @param folder the destination folder
   * @param destinationFilename the destination filename
   * @param overwrite true to always overwrite, false to preserve existing files
   */
  public void addSupportingFile(String template, String folder, String destinationFilename, boolean overwrite) {
    String pattern = getFilePathPattern(folder, destinationFilename, false);
    addSupportingFile(template, folder, destinationFilename, overwrite, pattern);
  }

  /**
   * Otter-specific: Registers a supporting file with custom pattern matching.
   *
   * Final implementation that adds the supporting file and registers the overwrite pattern.
   *
   * @param template the Mustache template name
   * @param folder the destination folder
   * @param destinationFilename the destination filename
   * @param overwrite true to always overwrite, false to preserve existing files
   * @param pattern custom regex pattern for matching files
   */
  public void addSupportingFile(String template, String folder, String destinationFilename, boolean overwrite,
                                String pattern) {
    supportingFiles.add(new SupportingFile(template, folder, destinationFilename));
    if (overwrite) {
      addForceOverwritePattern(pattern);
    } else {
      addSkipOverwritePattern(pattern);
    }
  }

  /**
   * Otter-specific: Adds a pattern to the force-overwrite list.
   *
   * Files matching this pattern will always be overwritten during code generation.
   *
   * @param pattern regex pattern to match file paths
   */
  public void addForceOverwritePattern(String pattern) {
    this.overwriteFilepathPatterns.add(pattern);
  }

  /**
   * Otter-specific: Adds a pattern to the skip-overwrite list.
   *
   * Existing files matching this pattern will be preserved during code generation.
   *
   * @param pattern regex pattern to match file paths
   */
  public void addSkipOverwritePattern(String pattern) {
    this.skipOverwriteFilepathPatterns.add(pattern);
  }

  /**
   * Otter-specific: Core method to register a template file with overwrite control.
   *
   * Used internally by addModelFile, addApiFile, and addSupportingFile methods.
   *
   * @param template the Mustache template name
   * @param fileExtension the file extension to generate
   * @param overwrite true to add to force-overwrite list, false to add to skip-overwrite list
   * @param pattern regex pattern for matching files
   * @param fileContainer the template container map to register the file in
   */
  public void addFile(String template, String fileExtension, boolean overwrite, String
    pattern, Map<String, String> fileContainer) {
    fileContainer.put(template, fileExtension);
    if (overwrite) {
      addForceOverwritePattern(pattern);
    } else {
      addSkipOverwritePattern(pattern);
    }
  }

  /**
   * Otter-specific: Converts the first character of a string to lowercase.
   *
   * Helper method used by kebabCase conversion. Returns empty string for empty input.
   *
   * @param str the string to convert
   * @return the string with the first character lowercased (e.g., "PetApi" → "petApi")
   */
  public String lowerFirst(String str) {
    return str.length() > 0 ? Character.toLowerCase(str.charAt(0)) + str.substring(1) : "";
  }

  /**
   * Otter-specific: Converts a string to kebab-case format.
   *
   * Used throughout Otter for file and folder naming conventions.
   * Converts PascalCase/camelCase to lowercase with hyphens.
   *
   * @param str the string to convert
   * @return the kebab-case string (e.g., "PetApi" → "pet-api", "petStore" → "pet-store")
   */
  public String kebabCase(String str) {
    return str.length() > 0 ? lowerFirst(str).replaceAll("([A-Z])", "-$1").toLowerCase() : "";
  }

  /**
   * Otter-specific override: Returns the TypeScript type for schema instantiation.
   *
   * **Difference from base:** Uses TypeScript's `Record<string, T>` type for map schemas
   * instead of the base implementation's approach. Record is the idiomatic TypeScript way to
   * represent dictionaries/maps with string keys.
   *
   * @param schema the schema to generate an instantiation type for
   * @return the TypeScript instantiation type (e.g., "Record<string, Pet>" for map of Pet objects)
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
