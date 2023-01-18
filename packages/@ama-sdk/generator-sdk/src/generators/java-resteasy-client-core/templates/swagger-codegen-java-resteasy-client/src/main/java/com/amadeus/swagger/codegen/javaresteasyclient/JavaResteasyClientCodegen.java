package com.amadeus.swagger.codegen.javaresteasyclient;

import java.io.IOException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.stream.*;

import com.google.common.base.CaseFormat;

import io.swagger.codegen.CodegenModel;
import io.swagger.codegen.CodegenProperty;
import org.apache.commons.lang3.StringUtils;

import io.swagger.codegen.CodegenConfig;
import io.swagger.codegen.CodegenOperation;
import io.swagger.codegen.CodegenParameter;
import io.swagger.codegen.SupportingFile;
import io.swagger.codegen.languages.JavaClientCodegen;
import io.swagger.models.HttpMethod;
import io.swagger.models.Model;
import io.swagger.models.ModelImpl;
import io.swagger.models.Operation;
import io.swagger.models.Path;
import io.swagger.models.Swagger;
import io.swagger.models.parameters.Parameter;
import io.swagger.models.properties.Property;

public class JavaResteasyClientCodegen extends JavaClientCodegen implements CodegenConfig {

  /**
   * Extension of standard Java swagger code generator, to adhere to SOLID
   * principles (https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)
   *
   * <p>
   * S: extract URL manipulations to a separate utility class URLUtils
   * <p>
   * I/D: create interfaces for APIs, to depend on abstractions. The APiClient
   * implementation is renamed to DefaultApiClient.
   */

  public static final String FILE_SEPARATOR = java.nio.file.FileSystems.getDefault().getSeparator();

  /**
   * The files to remove from the standard Java codegen
   * <p>
   * Another option would be to override with empty templates, and patch
   * {@link io.swagger.codegen.DefaultGenerator} to generate nothing in case of
   * empty template.
   */
  private static final List<String> SUPPORT_FILES_TO_REMOVE = Arrays.asList("settings.gradle.mustache",
      "gradle.properties.mustache", "build.gradle.mustache", "manifest.mustache", "git_push.sh.mustache",
      "gradlew.bat.mustache", "gradlew.mustache", "travis.mustache", "build.sbt.mustache",
      "gradle-wrapper.properties.mustache", "gradle-wrapper.jar", "gitignore.mustache");

  private LambdaHelper lambdaHelper = new LambdaHelper();

  /**
   * Operation vendor extension: wrapper model class simple name (ex:
   * MyOperationRequest)
   */
  private static final String X_REQUEST_WRAPPER_MODEL_TYPE = "x-request-wrapper-model-type";

  /**
   * Parameters vendor extension: value of parameter via calling getter on wrapper
   * object (ex: request.getParam1())
   */
  private static final String X_REQUEST_UNWRAPPED_PARAM_VALUE = "x-request-unwrapped-param-value";

  /**
   * Parameters vendor extension: value of parameter in camel case
   * ("parameterName" to "ParameterName")
   */
  private static final String X_PARAM_NAME_IN_CAMEL_CASE = "x-param-name-in-camel-case";

  public static final String SETTER_SUFFIX_FOR_ENUM_LISTS = "FromStrings";

  public static final String AUTH_PACKAGE = "authenticationPackage";
  protected String authenticationPackage = "com.amadeus.dapi.security.auth";

  public static final String RESTEASY_API_PACKAGE = "restEasyApiImplPackage";
  protected String restEasyApiImplPackage = "com.amadeus.dapi.resteasy.api";

  public static final String ENDPOINTS_PACKAGE = "endpointsPackage";
  protected String endpointsPackage = "com.amadeus.dapi.model.endpoints";

  public static final String CORE_PACKAGE = "corePackage";
  protected String corePackage = "com.amadeus.dapi.model.core";

  public static final String BASE_PACKAGE = "basePackage";
  protected String basePackage = "com.amadeus.dapi.model.base";

  private List<FilePostProcessConfig> postProcessConfigs;

  public JavaResteasyClientCodegen() {
    super();
    // Override the output folder and template location
    outputFolder = "generated-code/javaRestEasyClient";
    templateDir = "javaRestEasyClient";
    embeddedTemplateDir = "javaRestEasyClient";
    postProcessConfigs = new ArrayList<>();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getName() {
    return "javaRestEasyClient";
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getHelp() {
    return "Generates a JavaResteasy client library.";
  }

  /**
   * Ignore the gradle-related files, and add new supporting files.
   */
  @Override
  public void processOpts() {
    super.processOpts();

    additionalProperties.put("uppercaseFirst", new LambdaHelper.UppercaseFirstLambda());
    additionalProperties.put("removeDuplicateLines", new LambdaHelper.RemoveDuplicateLinesLambda());
    additionalProperties.put("removeEmptyLines", new LambdaHelper.RemoveEmptyLines());

    // Check if in the additional properties passed from swagger-codegen-config.json
    // we have defined the authentication package
    // If nothing defined use the default value
    // The variable authenticationPackage can be used in the templates as it is
    // added to additionalProperties array
    if (additionalProperties.containsKey(AUTH_PACKAGE)) {
      this.setAuthPackage((String) additionalProperties.get(AUTH_PACKAGE));
    } else {
      // not set, use to be passed to template
      additionalProperties.put(AUTH_PACKAGE, authenticationPackage);
    }

    if (additionalProperties.containsKey(RESTEASY_API_PACKAGE)) {
      this.setRestEasyApiImplPackage((String) additionalProperties.get(RESTEASY_API_PACKAGE));
    } else {
      // not set, use to be passed to template
      additionalProperties.put(RESTEASY_API_PACKAGE, restEasyApiImplPackage);
    }

    if (additionalProperties.containsKey(ENDPOINTS_PACKAGE)) {
      this.setEndpointsPackage((String) additionalProperties.get(ENDPOINTS_PACKAGE));
    } else {
      // not set, use to be passed to template
      additionalProperties.put(ENDPOINTS_PACKAGE, endpointsPackage);
    }

    if (additionalProperties.containsKey(CORE_PACKAGE)) {
      this.setCorePackage((String) additionalProperties.get(CORE_PACKAGE));
    } else {
      // not set, use to be passed to template
      additionalProperties.put(CORE_PACKAGE, corePackage);
    }

    if (additionalProperties.containsKey(BASE_PACKAGE)) {
      this.setBasePackage((String) additionalProperties.get(BASE_PACKAGE));
    } else {
      // not set, use to be passed to template
      additionalProperties.put(BASE_PACKAGE, basePackage);
    }

    for (Iterator<SupportingFile> it = supportingFiles.iterator(); it.hasNext();) {
      SupportingFile supportingFile = it.next();
      if (SUPPORT_FILES_TO_REMOVE.contains(supportingFile.templateFile)) {
        it.remove();
      }
    }

    modelTemplateFiles.put("model.mustache", "Private.java");
    modelTemplateFiles.put("coreModel.mustache", ".java");

    // API: interface and implementation
    apiTemplateFiles.put("api.mustache", "Api.java");
    apiTemplateFiles.put("wrapped_api.mustache", "WrappedApi.java");
    apiTemplateFiles.put("wrapped_api_impl.mustache", "WrappedApiImpl.java");

    apiTestTemplateFiles.clear();

    String oneAAuthFolder = sourceFolder + FILE_SEPARATOR + authenticationPackage.replace(".", FILE_SEPARATOR) + FILE_SEPARATOR + "oneaauth";
    supportingFiles.add(new SupportingFile("auth/oneaauth/OneAAuthentication.mustache", oneAAuthFolder, "OneAAuthentication.java"));
    supportingFiles.add(new SupportingFile("auth/oneaauth/OneAAuthTokenGenerator.mustache", oneAAuthFolder, "OneAAuthTokenGenerator.java"));
    supportingFiles.add(new SupportingFile("auth/oneaauth/AuthToken.mustache", oneAAuthFolder, "AuthToken.java"));

    String digitalForAirlinesAuthFolder = sourceFolder + FILE_SEPARATOR + authenticationPackage.replace(".", FILE_SEPARATOR) + FILE_SEPARATOR + "digitalforairlines";
    supportingFiles.add(new SupportingFile("auth/digitalforairlines/DigitalForAirlinesAuthentication.mustache", digitalForAirlinesAuthFolder, "DigitalForAirlinesAuthentication.java"));
    String patchFolder = sourceFolder + FILE_SEPARATOR + endpointsPackage.replace(".", FILE_SEPARATOR);
    supportingFiles.add(new SupportingFile("PATCH.mustache", patchFolder, "PATCH.java"));

    supportingFiles.add(new SupportingFile("settings.mustache", "settings.xml"));

    String baseModelPathString = packageToSrcFolder(basePackage);
    String coreModelPathString = packageToSrcFolder(corePackage);

    // Manually manage the structure of the code generated by swagger codegen (models, api interfaces, api impl with resteasy and api test)
    postProcessConfigs.add(new FilePostProcessConfig(".*ApiTest[.]java$", packageToTestFolder(restEasyApiImplPackage), true));
    postProcessConfigs.add(new FilePostProcessConfig(".*ApiImpl[.]java$", packageToSrcFolder(restEasyApiImplPackage), true));
    postProcessConfigs.add(new FilePostProcessConfig(".*Api[.]java$", packageToSrcFolder(endpointsPackage), true));
    postProcessConfigs.add(new FilePostProcessConfig(".*Private[.]java$", baseModelPathString, true));
    postProcessConfigs.add(new FilePostProcessConfig(".*java$", coreModelPathString, false));

  }

  @Override
  public void postProcessModelProperty(CodegenModel model, CodegenProperty property) {
    super.postProcessModelProperty(model, property);

    if( property != null ) {
      if (property.datatype.contains("BigDecimal") || property.datatype.contains("OffsetDateTime") || property.datatype.contains("LocalDate")) {
        property.isPrimitiveType = true;
      }
      if (property.isContainer && (property.items.datatype.contains("BigDecimal") || property.items.datatype.contains("OffsetDateTime") || property.datatype.contains("LocalDate"))) {
        property.items.isPrimitiveType = true;
      }

      // Check that we have vendor extensions for dictionary
      if (property.vendorExtensions.containsKey("x-dictionary-name")) {
        // Add some imports needed when reviving object from dictionaries
        model.imports.add("java.util.Map");
        model.imports.add("java.lang.reflect.InvocationTargetException");
        model.imports.add("com.fasterxml.jackson.annotation.JsonIgnore");

        String type = (String)property.vendorExtensions.get("x-field-type");
        if (typeMapping.containsKey(type) || languageSpecificPrimitives.contains(type)) {
          if (typeMapping.containsKey(type)) {
            property.vendorExtensions.put("x-field-type", typeMapping.get(type));
          }
        } else {
          model.imports.add(type);
        }
      }

      if (property.vendorExtensions.containsKey("x-map-name") && !property.isListContainer) {
        throw new IllegalArgumentException("error in " + property.baseName + ", x-map-name should only apply to a " + "list container.");
      }
    }
  }

  /**
   * Process models to identify API Root reply object and among them which ones declare dictionaries.
   * These helpers are used to revive data model with dictionaries.
   */
  @Override
  public Map<String, Object> postProcessModels(Map<String, Object> objs) {
    for (Map.Entry<String, Object> entry : objs.entrySet()) {
      if( "models".equals(entry.getKey()) ) {

        for( HashMap _map : (List<HashMap>)entry.getValue() ) {
          CodegenModel model = (CodegenModel) _map.get("model");
          boolean hasDictionaries = false;
          for (CodegenProperty property : model.vars) {
            hasDictionaries |= "dictionaries".equalsIgnoreCase(property.name);
          }
          if (model.classname.endsWith("Reply")) {
            model.vendorExtensions.put("isReply", Boolean.TRUE);
            if (hasDictionaries) {
              model.vendorExtensions.put("isReplyWithDictionaries", Boolean.TRUE);
            }
          }
        }
      }
    }
    return super.postProcessModels(objs);
  }

  /**
   * Suffix all files with API
   */
  @Override
  public String apiFilename(String templateName, String tag) {
    String suffix = apiTemplateFiles().get(templateName);
    return apiFileFolder() + FILE_SEPARATOR + toApiFilename(tag) + suffix;
  }

  public void setAuthPackage(String authPackage) {
    this.authenticationPackage = authPackage;
  }

  public void setRestEasyApiImplPackage(String restEasyApiImplPackage) {
    this.restEasyApiImplPackage = restEasyApiImplPackage;
  }

  public void setEndpointsPackage(String endpointsPackage) {
    this.endpointsPackage = endpointsPackage;
  }

  public void setBasePackage(String basePackage) {
    this.basePackage = basePackage;
  }

  public void setCorePackage(String corePackage) {
    this.corePackage = corePackage;
  }

  /**
   * Enum values are converted from camelCase to UPPER_SNAKE_CASE
   */
  @Override
  public String toEnumVarName(String value, String datatype) {
    String upperSnakeCaseValue = value;
    if (!StringUtils.isAllUpperCase(value)) {
      upperSnakeCaseValue = CaseFormat.UPPER_CAMEL.to(CaseFormat.UPPER_UNDERSCORE, value);
    }
    return super.toEnumVarName(upperSnakeCaseValue, datatype);
  }

  /**
   * Hook for altering the CodegenOperation data after it has been built from the
   * swagger specification.
   *
   * New variables are passed to template via vendor extensions.
   */
  @Override
  public Map<String, Object> postProcessOperations(Map<String, Object> objs) {
    Map<String, Object> newObjs = super.postProcessOperations(objs);

    List<Map<String, String>> imports = (List<Map<String, String>>) objs.get("imports");
    List<CodegenOperation> operations = ((Map<String, List<CodegenOperation>>) objs.get("operations")).get("operation");

    for (CodegenOperation operation : operations) {
      importRequestWrapper(operation, imports);
      rewriteParamNames(operation);
    }

    return newObjs;
  }

  /**
   * All the imports for the models will come from the 'core' package. Giving
   * this, apply the "core" subpath to the model import
   */
  @Override
  public String toModelImport(String name) {
    if ("".equals(modelPackage) || name.startsWith("java.") || name.startsWith("com.")) {
      return name;
    } else {
      return corePackage + "." + name;
    }
  }

  /**
   * Hook for altering the whole Swagger specification after it has been parsed.
   */
  @Override
  public void preprocessSwagger(Swagger swagger) {
    super.preprocessSwagger(swagger);

    createRequestWrapperModel(swagger);
  }

  /**
   * Add Java imports for the new wrapper model type All the imports are done from
   * the 'core' package
   */
  private void importRequestWrapper(CodegenOperation operation, List<Map<String, String>> imports) {
    String className = (String) operation.vendorExtensions.get(X_REQUEST_WRAPPER_MODEL_TYPE);
    Map<String, String> newImport = new HashMap<String, String>();
    newImport.put("import", corePackage + "." + className);
    imports.add(newImport);
  }

  /**
   * Compute the unwrapping for "paramName" into "request.getParamName()" or
   * "request.isParamName()" if param is a boolean
   *
   * This is easier done here than in the template, due to camelization logic.
   */
  private void rewriteParamNames(CodegenOperation operation) {
    List<CodegenParameter> params = new ArrayList<CodegenParameter>();
    params.addAll(operation.allParams);
    params.addAll(operation.queryParams);
    params.addAll(operation.headerParams);
    params.addAll(operation.formParams);
    params.addAll(operation.pathParams);
    for (CodegenParameter param : params) {
      if (param.isEnum && param.isListContainer) {
        param.vendorExtensions.put(X_PARAM_NAME_IN_CAMEL_CASE,
            camelize(param.paramName) + SETTER_SUFFIX_FOR_ENUM_LISTS);
      } else {
        param.vendorExtensions.put(X_PARAM_NAME_IN_CAMEL_CASE, camelize(param.paramName));
      }
      param.vendorExtensions.put(X_REQUEST_UNWRAPPED_PARAM_VALUE,
          (param.isBoolean ? "request.is" : "request.get") + camelize(param.paramName) + "()");
    }
  }

  /**
   * Wraps parameters of each operation into a new wrapper model type
   * <OperationId>Request
   *
   * To minimize the amount of code/template to override about parameter handling
   * from the default Java behavior, it seems easier to not modify the signature
   * of the operation in the specification, but rather do it in the template.
   *
   * However the new class definitions are added to the specification, so that
   * they get generated in a standard way.
   */
  private void createRequestWrapperModel(Swagger swagger) {
    for (Path path : swagger.getPaths().values()) {
      for (Operation operation : path.getOperations()) {
        Model model = new ModelImpl();
        Map<String, Property> properties = new LinkedHashMap<String, Property>();
        for (Parameter parameter : operation.getParameters()) {
          Property property = lambdaHelper.convertParameterToProperty(parameter);
          if (property != null && property.getType() != null) {
            properties.put(parameter.getName(), property);
          }
        }

        model.setProperties(properties);
        String operationId = operation.getOperationId();
        if (StringUtils.isBlank(operationId)) {
          String urlPath = getKey(path, swagger.getPaths());
          HttpMethod method = getKey(operation, path.getOperationMap());
          operationId = getOrGenerateOperationId(operation, urlPath, method.name());
        }
        model.setDescription("Wrapper object for parameters of " + operationId + " operation");
        // Use 'Wrapped' Suffix to ensure that the new definition is not overriding an existing one
        String className = camelize(operationId) + "WrappedRequest";

        swagger.getDefinitions().put(className, model);

        // Link the wrapper into the operation metadata
        operation.getVendorExtensions().put(X_REQUEST_WRAPPER_MODEL_TYPE, className);
      }
    }
  }

  /**
   * Get the key of a given value from a map
   *
   * @param value
   * @param map
   * @param <K>
   * @param <V>
   * @return
   */
  private static <K, V> K getKey(V value, Map<K, V> map) {
    K key = null;
    if (map != null) {
      for (Entry<K, V> entry : map.entrySet()) {
        if (value == entry.getValue()) {
          key = entry.getKey();
          break;
        }
      }
    }
    return key;
  }

  /**
   * Output the API (class) name (capitalized). This overrides the
   * {@link io.swagger.codegen.DefaultCodegen#toApiName(String)}, then removing
   * the "Api" suffix. Return DefaultApi if name is empty
   *
   * @param name the name of the Api
   * @return capitalized Api name
   */
  @Override
  public String toApiName(String name) {
    if (name.length() == 0) {
      return "Default";
    }
    return initialCaps(name);
  }

  /**
   * Output the API as variable name, as camel case with first letter in lower
   * case (e.g., AirCalendar -> airCalendar)
   */
  @Override
  public String toApiVarName(String name) {
    if (name.length() == 0) {
      return "default";
    }
    return camelize(name, true);
  }

  /**
   *  Override postProcessSupportingFileData
   *  This method will generate public and private models
   *  By default the models (public or private) will be generated inside modelPackage folder.
   *  This method will move the files as follows:
   *  The private models will be moved in 'modelPackage'/base. These models will be always generated (overwritten)
   *  The public models will be moved in 'modelPackage'/core. If a model is already existing in 'core' folder, this model will not be overwritten.
   *  If a core model already exists, the generated file in 'modelPackage' will be deleted
   */
  @SuppressWarnings("static-method")
  @Override
  public Map<String, Object> postProcessSupportingFileData(Map<String, Object> objs) {

    for (FilePostProcessConfig config : postProcessConfigs) {
      createOutFolder(config.getTargetFolder());
    }

    java.nio.file.Path pathToModels = java.nio.file.Paths.get(modelFileFolder());

    try (Stream<java.nio.file.Path> walk = Files.list(pathToModels)) {
      walk.filter(Files::isRegularFile).forEach(filePath -> {
        for (FilePostProcessConfig config : postProcessConfigs) {
          String fileName = filePath.getFileName().toString();
          if (fileName.matches(config.getFilePattern())) {
            try {
              java.nio.file.Path destPath = java.nio.file.Paths.get(config.getTargetFolder());
              if (config.isForceReplace()) {
                Files.move(filePath, destPath.resolve(filePath.getFileName()), StandardCopyOption.REPLACE_EXISTING);
              } else {
                try {
                  Files.move(filePath, destPath.resolve(filePath.getFileName()));
                } catch (FileAlreadyExistsException e) {
                  Files.delete(filePath);
                }
              }
            } catch (final IOException e) {
              e.printStackTrace();
            }
            break;
          }
        }
      });
    } catch (IOException e) {
      e.printStackTrace();
    }
    return super.postProcessSupportingFileData(objs);
  }

  private void createOutFolder(String pathString) {
    java.nio.file.Path path = java.nio.file.Paths.get(pathString);
    try {
      if (!Files.exists(path)) {
        Files.createDirectories(path);
      }
    } catch (IOException e) {
      LambdaHelper.LOGGER.error("Unable to create base or core directory " + e);
    }
  }

  private String packageToSrcFolder(String packagePath) {
    return this.outputFolder + FILE_SEPARATOR + this.sourceFolder + FILE_SEPARATOR + packagePath.replace(".", FILE_SEPARATOR);
  }

  private String packageToTestFolder(String packagePath) {
    return this.outputFolder + FILE_SEPARATOR + this.testFolder + FILE_SEPARATOR + packagePath.replace(".", FILE_SEPARATOR);
  }
}
