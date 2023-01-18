package com.amadeus.swagger.codegen.javamdk;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.*;

import com.google.common.base.CaseFormat;

import io.swagger.codegen.CodegenModel;
import io.swagger.codegen.CodegenProperty;
import org.apache.commons.lang3.StringUtils;

import io.swagger.codegen.CodegenConfig;
import io.swagger.codegen.SupportingFile;
import io.swagger.codegen.languages.JavaClientCodegen;
import io.swagger.models.Swagger;

public class JavaMdkCodegen extends JavaClientCodegen implements CodegenConfig {

  /*
   * Extension of standard Java swagger code generator, to adhere to SOLID
   * principles (https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)
   *
   * <p>
   * S: extract URL manipulations to a separate utility class URLUtils
   * <p>
   * I/D: create interfaces for APIs, to depend on abstractions. The APiClient
   * implementation is renamed to DefaultApiClient.
   */

  public static final String FILE_SEPARATOR = FileSystems.getDefault().getSeparator();

  private static final String DUMMY_DXAPI_CLASS = "DxApi";

  public static final String DAPI_PACKAGE = "dapiPackage";
  protected String dapiSdkClientPackage = "com.amadeus.dapi.model.core";

  public static final String FRONTEND_MODEL_SUFFIX = "frontendModelSuffix";
  protected String frontendModelSuffix = "View";

  public static final String ENUM_UPPER_UNDERSTORE = "enumUpperUnderscore";
  protected boolean enumUpperUnderscore = true;

  private List<FilePostProcessConfig> postProcessConfigs;
  private Set<String> mapperSet;
  private Map<String, Set<String>> commonRefDatatypes;
  private Map<String, Set<String>> parentChildrenMapperMapping;
  private Map<String, Set<String>> parentChildrenEnumMapping;

  public JavaMdkCodegen() {
    super();
    // Override the output folder and template location
    outputFolder = "generated-code" + FILE_SEPARATOR + "javaMdk";
    templateDir = "javaMdk";
    embeddedTemplateDir = "javaMdk";
    postProcessConfigs = new ArrayList<>();
    mapperSet = new HashSet<>();
    commonRefDatatypes = new HashMap<>();
    parentChildrenMapperMapping = new HashMap<>();
    parentChildrenEnumMapping = new HashMap<>();
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getName() {
    return "javaMdk";
  }

  /**
   * {@inheritDoc}
   */
  @Override
  public String getHelp() {
    return "Generates a Java MDK library.";
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

    //Remove all the api and supporting files
    apiTemplateFiles.clear();
    apiDocTemplateFiles.clear();
    apiTestTemplateFiles.clear();
    supportingFiles.clear();
    modelDocTemplateFiles.clear();

    initAdditionalParameters();

    // Airline API Swagger Specification definitions model (base/core).
    modelTemplateFiles.put("model.mustache", frontendModelSuffix + "Private.java");
    modelTemplateFiles.put("coreModel.mustache", frontendModelSuffix + ".java");

    // Factories DxAPI <> Airline API beans
    modelTemplateFiles.put("custom"+ FILE_SEPARATOR + "viewMapperDelegateInterface.mustache", frontendModelSuffix + "MapperDelegate.java");
    modelTemplateFiles.put("custom"+ FILE_SEPARATOR + "backendMapperDelegateInterface.mustache", "MapperDelegate.java");
    modelTemplateFiles.put("custom"+ FILE_SEPARATOR + "viewMapperDelegateEmptyImpl.mustache", frontendModelSuffix + "EmptyMapperDelegateImpl.java");
    modelTemplateFiles.put("custom"+ FILE_SEPARATOR + "backendMapperDelegateEmptyImpl.mustache", "EmptyMapperDelegateImpl.java");
    // MapStruct mapper based on Swagger Specification
    modelTemplateFiles.put("custom"+ FILE_SEPARATOR + "mapper.mustache", "Mapper.java");

    if (!Files.exists(Paths.get(getOutputDir() + FILE_SEPARATOR + "README.md"))) {
      supportingFiles.add(new SupportingFile("README.mustache", "README.md"));
    }
    if (!Files.exists(Paths.get(getOutputDir() + FILE_SEPARATOR + "pom.xml"))) {
      supportingFiles.add(new SupportingFile("pom.mustache", "pom.xml"));
    }

    defineGeneratedFilePaths();

  }

  private void defineGeneratedFilePaths() {
    String baseModelPathString = packageToSrcFolder(modelPackage + ".model.base");
    String coreModelPathString = packageToSrcFolder(modelPackage + ".model.core");

    String baseBackendFactoryPathString = packageToSrcFolder(modelPackage + ".mapper.delegate");
    String baseMapperPathString = packageToSrcFolder(modelPackage + ".mapper");

    postProcessConfigs.add(new FilePostProcessConfig(".*DxApi.*Mapper.*java$", baseMapperPathString, true, true));

    postProcessConfigs.add(new FilePostProcessConfig(".*MapperDelegateImpl.java$", baseBackendFactoryPathString, true, false));
    postProcessConfigs.add(new FilePostProcessConfig(".*MapperDelegate.java$", baseBackendFactoryPathString, true, false));
    postProcessConfigs.add(new FilePostProcessConfig(".*Mapper.java$", baseMapperPathString, true, false));

    postProcessConfigs.add(new FilePostProcessConfig(".*" + frontendModelSuffix + "Private.java$", baseModelPathString, true, false));
    postProcessConfigs.add(new FilePostProcessConfig(".*java$", coreModelPathString, false, false));
  }

  private void initAdditionalParameters() {
    if (additionalProperties.containsKey(DAPI_PACKAGE)) {
      dapiSdkClientPackage = (String) additionalProperties.get(DAPI_PACKAGE);
    } else {
      additionalProperties.put(DAPI_PACKAGE, dapiSdkClientPackage);
    }

    if (additionalProperties.containsKey(FRONTEND_MODEL_SUFFIX)) {
      frontendModelSuffix = (String) additionalProperties.get(FRONTEND_MODEL_SUFFIX);
    } else {
      additionalProperties.put(FRONTEND_MODEL_SUFFIX, frontendModelSuffix);
    }

    if (additionalProperties.containsKey(ENUM_UPPER_UNDERSTORE)) {
      enumUpperUnderscore = Boolean.parseBoolean((String) additionalProperties.get(ENUM_UPPER_UNDERSTORE));
    } else {
      additionalProperties.put(ENUM_UPPER_UNDERSTORE, enumUpperUnderscore);
    }
  }

  @Override
  public void postProcessModelProperty(CodegenModel model, CodegenProperty property) {
    super.postProcessModelProperty(model, property);
    Set<String> nestedClasses = (Set<String>)model.vendorExtensions.get("x-nested-classes");
    if (nestedClasses == null) {
      nestedClasses = new HashSet<>();
      model.vendorExtensions.put("x-nested-classes", nestedClasses);
    }
    if( property != null ) {
      if (property.datatype.contains("BigDecimal") || property.datatype.contains("DateTime") || property.datatype.contains("LocalDate")) {
        property.isPrimitiveType = true;
      }
      if (property.isContainer && (property.items.datatype.contains("BigDecimal") || property.items.datatype.contains("DateTime") || property.datatype.contains("LocalDate"))) {
        property.items.isPrimitiveType = true;
      }
      if (!property.isContainer && !property.isPrimitiveType) {
        // Check needed, it seems that the property is processed twice by this method. So this replacement should be done only once.
        if (!property.datatype.endsWith(frontendModelSuffix)) {
          // Prevent to be self include in case of circular dependency
          if (!property.datatype.equals(model.classname)) {
            nestedClasses.add(property.datatype);
          }
          property.datatypeWithEnum = property.datatypeWithEnum.replace(property.datatype, property.datatype + frontendModelSuffix);
          property.datatype = property.datatype + frontendModelSuffix;
        }
      }
      if (property.isContainer && !property.items.isPrimitiveType) {
        String rawType = property.items.datatype;
        // Check needed, it seems that the property is processed twice by this method. So this replacement should be done only once.
        if (!rawType.endsWith(frontendModelSuffix)) {
          // Prevent to be self include in case of circular dependency
          if (!rawType.equals(model.classname)) {
            nestedClasses.add(property.items.datatype);
          }
          property.items.datatype = rawType + frontendModelSuffix;
          property.items.datatypeWithEnum = property.items.datatypeWithEnum.replace(rawType, rawType + frontendModelSuffix);
          property.datatypeWithEnum = property.datatypeWithEnum.replace(rawType, rawType + frontendModelSuffix);
          property.datatype = property.datatype.replace(rawType, rawType + frontendModelSuffix);
        }
      }

      // Check that we have vendor extensions for dictionary
      if (property.vendorExtensions.containsKey("x-dictionary-name")) {
        // Add some imports needed when reviving object from dictionaries
        model.imports.add("java.util.Map");

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
          CustomCodegenModel model = new CustomCodegenModel((CodegenModel)_map.get("model")); // Gets the model associated to that
          _map.put("model", model);
          String backendBeanClass = (String)model.vendorExtensions.get("x-api-ref");
          if (model.isEnum) {
            postProcessConfigs.add(0, new FilePostProcessConfig(model.classname + frontendModelSuffix + "Private.java$", "", true, true));

          }
          if (backendBeanClass == null || (!model.classname.equalsIgnoreCase(backendBeanClass))) {
            postProcessConfigs.add(0, new FilePostProcessConfig(model.classname + "[" + frontendModelSuffix + "]*[Empty]*MapperDelegate[Impl]*.java$", "", true, true));
            postProcessConfigs.add(0, new FilePostProcessConfig(model.classname + "Mapper.java$", "", true, true));
          }
          else {
            model.backendReference = backendBeanClass;
            model.vendorExtensions.put("x-api-backend-type", backendBeanClass);
            mapperSet.add(model.classname + "Mapper");
            Set<String> refs = commonRefDatatypes.get(backendBeanClass);
            if (refs == null) {
              refs = new HashSet<>();
              commonRefDatatypes.put(backendBeanClass, refs);
            }
            refs.add(model.classname);
          }

          if (model.parent != null) {
            if (model.parent.endsWith(">")) {
              model.parent = model.parent.substring(0, model.parent.length() - 1) + frontendModelSuffix + ">";
            }
            else {
              model.parent = model.parent + frontendModelSuffix;
            }
          }
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

  @Override
  public Map<String, Object> postProcessAllModels(Map<String, Object> objs) {
    for (Map.Entry<String, Object> entry : objs.entrySet()) { // Loops through all the definitions
      HashMap swaggerMap = (HashMap)entry.getValue();
      for (HashMap _modelsMap : (List<HashMap>)swaggerMap.get("models")) {
        CustomCodegenModel model = (CustomCodegenModel)_modelsMap.get("model"); // Gets the model associated to that
        model.parentChildrenMapperMapping = parentChildrenMapperMapping;
        model.parentChildrenEnumMapping = parentChildrenEnumMapping;
        String backendBeanClass = (String)model.vendorExtensions.get("x-api-ref");
        if (model.parent != null) {
          String parentType = model.parent.replaceAll(frontendModelSuffix + "$", "");
          if(model.classname.equalsIgnoreCase(backendBeanClass)) {
            model.addMapper(parentType);
            Set<String> children = parentChildrenMapperMapping.get(parentType);
            if (children == null) {
              children = new HashSet<>();
              parentChildrenMapperMapping.put(parentType, children);
            }
            children.add(model.classname);
          }
          if ((model.classname.equalsIgnoreCase(backendBeanClass) || model.parent.startsWith(backendBeanClass))) {
            Set<String> children = parentChildrenEnumMapping.get(parentType);
            if (children == null) {
              children = new HashSet<>();
              parentChildrenEnumMapping.put(parentType, children);
            }
            children.add(model.classname);
          }
        }
        Set<String> nestedClasses = (Set<String>)model.vendorExtensions.get("x-nested-classes");
        if (nestedClasses != null) {
          for (String nestedClass : nestedClasses) {
            model.addMapper(nestedClass);
          }
        }
        model.filterMappers(mapperSet);
        if (model.backendReference != null) {
          Set<String> refs = this.commonRefDatatypes.get(model.backendReference);
          for (String type : refs) {
            if (!type.startsWith(DUMMY_DXAPI_CLASS)) {
              model.addFrontendClass(type);
            }
          }
        }
      }
    }
    return super.postProcessAllModels(objs);
  }

  /**
   * Enum values are converted from camelCase to UPPER_SNAKE_CASE
   */
  @Override
  public String toEnumVarName(String value, String datatype) {
    String upperSnakeCaseValue = value;
    // Enum format is configurable in the config json file
    if(enumUpperUnderscore) {
      if (!StringUtils.isAllUpperCase(value)) {
        upperSnakeCaseValue = CaseFormat.UPPER_CAMEL.to(CaseFormat.UPPER_UNDERSCORE, value);
      }
    }
    return super.toEnumVarName(upperSnakeCaseValue, datatype);
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
      return modelPackage + ".model.core." + name + frontendModelSuffix;
    }
  }

  /**
   * Hook for altering the whole Swagger specification after it has been parsed.
   */
  @Override
  public void preprocessSwagger(Swagger swagger) {
    super.preprocessSwagger(swagger);
  }

  /**
   * Process generated files to move them in the expected structure
   * from the root package defined in the configuration.
   */
  @SuppressWarnings("static-method")
  @Override
  public Map<String, Object> postProcessSupportingFileData(Map<String, Object> objs) {

    for (FilePostProcessConfig config : postProcessConfigs) {
      createOutFolder(config.getTargetFolder());
    }

    Path pathToModels = Paths.get(modelFileFolder());

    try (Stream<Path> walk = Files.list(pathToModels)) {
      walk.filter(Files::isRegularFile).forEach(filePath -> {
        String fileName = filePath.getFileName().toString();
        try {
          for (FilePostProcessConfig config : postProcessConfigs) {
              if (fileName.matches(config.getFilePattern())) {
                Path destPath = Paths.get(config.getTargetFolder());
                if (config.isToDelete()) {
                  Files.delete(filePath);
                } else if (config.isForceReplace()) {
                  Files.move(filePath, destPath.resolve(filePath.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                } else {
                  try {
                    Files.move(filePath, destPath.resolve(filePath.getFileName()));
                  } catch (FileAlreadyExistsException e) {
                    Files.delete(filePath);
                  }
                }
                break;
              }
            }
        } catch (final IOException e) {
          e.printStackTrace();
        }
      });
    } catch (IOException e) {
      e.printStackTrace();
    }
    return super.postProcessSupportingFileData(objs);
  }

  @Override
  public  Map<String, Object> postProcessOperations(Map<String, Object> var1) {
    var1.clear();
    return var1;
  }

  @Override
  public Map<String, Object> postProcessOperationsWithModels(Map<String, Object> var1, List<Object> var2) {
    var1.clear();
    return var1;
  }

  private void createOutFolder(String pathString) {
    Path path = Paths.get(pathString);
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
