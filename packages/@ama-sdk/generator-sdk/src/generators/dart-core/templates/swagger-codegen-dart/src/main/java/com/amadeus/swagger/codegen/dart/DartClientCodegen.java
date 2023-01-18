package com.amadeus.swagger.codegen.dart;

import com.amadeus.swagger.codegen.dart.LambdaHelper;

import io.swagger.codegen.CliOption;
import io.swagger.codegen.CodegenConfig;
import io.swagger.codegen.CodegenConstants;
import io.swagger.codegen.CodegenModel;
import io.swagger.codegen.CodegenProperty;
import io.swagger.codegen.CodegenType;
import io.swagger.codegen.DefaultCodegen;
import io.swagger.codegen.SupportingFile;
import io.swagger.models.properties.ArrayProperty;
import io.swagger.models.properties.MapProperty;
import io.swagger.models.properties.Property;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.*;

public class DartClientCodegen extends DefaultCodegen implements CodegenConfig {
    public static final String BROWSER_CLIENT = "browserClient";
    public static final String PUB_NAME = "pubName";
    public static final String PUB_VERSION = "pubVersion";
    public static final String PUB_DESCRIPTION = "pubDescription";
    public static final String USE_ENUM_EXTENSION = "useEnumExtension";
    protected boolean browserClient = true;
    protected String pubName = "amadeus_digital_experience";
    protected String pubVersion = "1.0.0";
    protected String pubDescription = "Digital API SDK";
    protected boolean useEnumExtension = false;
    protected String sourceFolder = "";
    protected String apiDocPath = "doc/";
    protected String modelDocPath = "doc/";

    public DartClientCodegen() {
        super();

        // clear import mapping (from default generator) as dart does not use it
        // at the moment
        importMapping.clear();

        outputFolder = "generated-code/dart";
        modelTemplateFiles.put("model.mustache", ".private.dart");
        modelTemplateFiles.put("helper.mustache", ".public.dart");
        apiTemplateFiles.put("api.mustache", ".dart");
        embeddedTemplateDir = templateDir = "dart";
        apiPackage = "lib.api";
        modelPackage = "lib.model";
        modelDocTemplateFiles.put("object_doc.mustache", ".md");
        apiDocTemplateFiles.put("api_doc.mustache", ".md");

        // default HIDE_GENERATION_TIMESTAMP to true
        hideGenerationTimestamp = Boolean.TRUE;

        setReservedWordsLowerCase(
                Arrays.asList(
                        "abstract", "as", "assert", "async", "async*", "await",
                        "break", "case", "catch", "class", "const", "continue",
                        "default", "deferred", "do", "dynamic", "else", "enum",
                        "export", "external", "extends", "factory", "false", "final",
                        "finally", "for", "get", "if", "implements", "import", "in",
                        "is", "library", "new", "null", "operator", "part", "rethrow",
                        "return", "set", "static", "super", "switch", "sync*", "this",
                        "throw", "true", "try", "typedef", "var", "void", "while",
                        "with", "yield", "yield*" )
        );

        languageSpecificPrimitives = new HashSet<String>(
                Arrays.asList(
                        "String",
                        "bool",
                        "int",
                        "num",
                        "double",
                        "Object")
        );
        instantiationTypes.put("array", "List");
        instantiationTypes.put("map", "Map");

        typeMapping = new HashMap<String, String>();
        typeMapping.put("Array", "List");
        typeMapping.put("array", "List");
        typeMapping.put("List", "List");
        typeMapping.put("boolean", "bool");
        typeMapping.put("string", "String");
        typeMapping.put("char", "String");
        typeMapping.put("int", "int");
        typeMapping.put("long", "int");
        typeMapping.put("short", "int");
        typeMapping.put("number", "num");
        typeMapping.put("float", "double");
        typeMapping.put("double", "double");
        typeMapping.put("object", "Object");
        typeMapping.put("integer", "int");
        typeMapping.put("Date", "DateTime");
        typeMapping.put("date", "DateTime");
        typeMapping.put("File", "MultipartFile");
        typeMapping.put("UUID", "String");
        //TODO binary should be mapped to byte array
        // mapped to String as a workaround
        typeMapping.put("binary", "String");

        cliOptions.add(new CliOption(BROWSER_CLIENT, "Is the client browser based"));
        cliOptions.add(new CliOption(PUB_NAME, "Name in generated pubspec"));
        cliOptions.add(new CliOption(PUB_VERSION, "Version in generated pubspec"));
        cliOptions.add(new CliOption(PUB_DESCRIPTION, "Description in generated pubspec"));
        cliOptions.add(new CliOption(USE_ENUM_EXTENSION, "Allow the 'x-enum-values' extension for enums"));
        cliOptions.add(new CliOption(CodegenConstants.SOURCE_FOLDER, "source folder for generated code"));

        additionalProperties.put("urlParamReplacer", new LambdaHelper.UrlParamReplacerLambda());
        additionalProperties.put("removeEqualsNullLambda", new LambdaHelper.removeEqualsNullLambda());
        additionalProperties.put("noDuplicateLine", new LambdaHelper.RemoveDuplicate(" *\\r?\\n *", System.getProperty("line.separator")));
    }

    @Override
    public CodegenType getTag() {
        return CodegenType.CLIENT;
    }

    @Override
    public String getName() {
        return "dart";
    }

    @Override
    public String getHelp() {
        return "Generates a Dart client library.";
    }

    @Override
    public boolean shouldOverwrite(String filename) {
      if (Pattern.matches(".*\\.public\\.dart$", filename)) {
        File tempFile = new File(filename);
        if (tempFile.exists()) {
          return false;
        }
      } else if (Pattern.matches(".*api_dependencies\\.dart$", filename)) {
        return false;
      }

      return super.shouldOverwrite(filename);
    }

    @Override
    public void processOpts() {
        super.processOpts();

        if (additionalProperties.containsKey(BROWSER_CLIENT)) {
            this.setBrowserClient(convertPropertyToBooleanAndWriteBack(BROWSER_CLIENT));
        } else {
            //not set, use to be passed to template
            additionalProperties.put(BROWSER_CLIENT, browserClient);
        }

        if (additionalProperties.containsKey(PUB_NAME)) {
            this.setPubName((String) additionalProperties.get(PUB_NAME));
        } else {
            //not set, use to be passed to template
            additionalProperties.put(PUB_NAME, pubName);
        }

        if (additionalProperties.containsKey(PUB_VERSION)) {
            this.setPubVersion((String) additionalProperties.get(PUB_VERSION));
        } else {
            //not set, use to be passed to template
            additionalProperties.put(PUB_VERSION, pubVersion);
        }

        if (additionalProperties.containsKey(PUB_DESCRIPTION)) {
            this.setPubDescription((String) additionalProperties.get(PUB_DESCRIPTION));
        } else {
            //not set, use to be passed to template
            additionalProperties.put(PUB_DESCRIPTION, pubDescription);
        }

        if (additionalProperties.containsKey(USE_ENUM_EXTENSION)) {
            this.setUseEnumExtension(convertPropertyToBooleanAndWriteBack(USE_ENUM_EXTENSION));
        } else {
            // Not set, use to be passed to template.
            additionalProperties.put(USE_ENUM_EXTENSION, useEnumExtension);
        }

        if (additionalProperties.containsKey(CodegenConstants.SOURCE_FOLDER)) {
            this.setSourceFolder((String) additionalProperties.get(CodegenConstants.SOURCE_FOLDER));
        }

        // make api and model doc path available in mustache template
        additionalProperties.put("apiDocPath", apiDocPath);
        additionalProperties.put("modelDocPath", modelDocPath);

        final String libFolder = sourceFolder + File.separator + "lib";
        supportingFiles.add(new SupportingFile("pubspec.mustache", "", "pubspec.yaml"));
        supportingFiles.add(new SupportingFile("analysis_options.mustache", "", "analysis_options.yaml"));
        supportingFiles.add(new SupportingFile("apilib.mustache", libFolder, "sdk.dart"));

        final String coreFolder = libFolder + File.separator + "core";
        supportingFiles.add(new SupportingFile("api_client.mustache", coreFolder, "api_client.dart"));
        supportingFiles.add(new SupportingFile("api_plugin.mustache", coreFolder, "api_plugin.dart"));
        supportingFiles.add(new SupportingFile("api_exception.mustache", coreFolder, "api_exception.dart"));
        supportingFiles.add(new SupportingFile("api_helper.mustache", coreFolder, "api_helper.dart"));
        supportingFiles.add(new SupportingFile("api_dependencies.mustache", coreFolder, "api_dependencies.dart"));

        final String pluginsFolder = libFolder + File.separator + "plugins";
        supportingFiles.add(new SupportingFile("plugins/api-key.request.mustache", pluginsFolder, "api-key.request.dart"));
        supportingFiles.add(new SupportingFile("plugins/exception.response.mustache", pluginsFolder, "exception.response.dart"));

        supportingFiles.add(new SupportingFile("gitignore.mustache", "", ".gitignore"));
        supportingFiles.add(new SupportingFile("README.mustache", "", "README.md"));
    }

    @Override
    public String escapeReservedWord(String name) {
        return name + "_";
    }

    @Override
    public String apiFileFolder() {
        return outputFolder + "/" + sourceFolder + "/" + apiPackage().replace('.', File.separatorChar);
    }

    @Override
    public String modelFileFolder() {
        return outputFolder + "/" + sourceFolder + "/" + modelPackage().replace('.', File.separatorChar);
    }

    @Override
    public String apiDocFileFolder() {
        return (outputFolder + "/" + apiDocPath).replace('/', File.separatorChar);
    }

    @Override
    public String modelDocFileFolder() {
        return (outputFolder + "/" + modelDocPath).replace('/', File.separatorChar);
    }

    @Override
    public String toVarName(String name) {
        // replace - with _ e.g. created-at => created_at
        name = name
          .replaceAll("-", "_");

        // if it's all uppper case, do nothing
        if (name.matches("^[A-Z_]*$")) {
            return name;
        }

        // camelize (lower first character) the variable name
        // pet_id => petId
        name = camelize(name, true);

        if (name.matches("^\\d.*")) {
            name = "n" + name;
        }

        if (isReservedWord(name)) {
            name = escapeReservedWord(name);
        }

        return name
          .replaceAll("\\[", "_")
          .replaceAll("\\]", "_");
    }

    @Override
    public String toParamName(String name) {
        // should be the same as variable name
        return toVarName(name);
    }

    @Override
    public String toModelName(String name) {
        // model name cannot use reserved keyword, e.g. return
        if (isReservedWord(name)) {
            LOGGER.warn(name + " (reserved word) cannot be used as model filename. Renamed to " + camelize("model_" + name));
            name = "model_" + name; // e.g. return => ModelReturn (after camelize)
        }

        // camelize the model name
        // phone_number => PhoneNumber
        return camelize(name);
    }

    @Override
    public String toModelFilename(String name) {
        return underscore(toModelName(name));
    }

    @Override
    public String toApiFilename(String name) {
        return underscore(toApiName(name));
    }

    @Override
    public String toDefaultValue(Property p) {
        if (p instanceof MapProperty) {
            MapProperty mp = (MapProperty) p;
            Property inner = mp.getAdditionalProperties();
            return "<String, " + getTypeDeclaration(inner) + ">{}";
        } else if (p instanceof ArrayProperty) {
            return "[]";
        }
        return super.toDefaultValue(p);
    }

    @Override
    public String getTypeDeclaration(Property p) {
        if (p instanceof ArrayProperty) {
            ArrayProperty ap = (ArrayProperty) p;
            Property inner = ap.getItems();
            return getSwaggerType(p) + "<" + getTypeDeclaration(inner) + ">";
        } else if (p instanceof MapProperty) {
            MapProperty mp = (MapProperty) p;
            Property inner = mp.getAdditionalProperties();

            return getSwaggerType(p) + "<String, " + getTypeDeclaration(inner) + ">";
        }
        return super.getTypeDeclaration(p);
    }

    @Override
    public String getSwaggerType(Property p) {
        String swaggerType = super.getSwaggerType(p);
        String type = null;
        if (typeMapping.containsKey(swaggerType)) {
            type = typeMapping.get(swaggerType);
            if (languageSpecificPrimitives.contains(type)) {
                return type;
            }
        } else {
            type = swaggerType;
        }
        return toModelName(type);
    }

    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {
        return postProcessModelsEnum(objs);
    }

    @Override
    public Map<String, Object> postProcessModelsEnum(Map<String, Object> objs) {
        List<Object> models = (List<Object>) objs.get("models");
        for (Object _mo : models) {
            Map<String, Object> mo = (Map<String, Object>) _mo;
            CodegenModel cm = (CodegenModel) mo.get("model");
            boolean succes = buildEnumFromVendorExtension(cm) ||
                    buildEnumFromValues(cm);
            for (CodegenProperty var : cm.vars) {
                updateCodegenPropertyEnum(var);
            }
        }
        return objs;
    }

    @Override
    public void postProcessModelProperty(CodegenModel model, CodegenProperty property) {

        if( property != null ) {
            if( Boolean.TRUE.equals(property.isDate) || Boolean.TRUE.equals(property.isDateTime) ) {
                property.isPrimitiveType = false;
            }
        }

        if (property.isEnum) {
          List<String> allowableValues = (List)property.allowableValues.get("values");
          List<String> sanitizedAllowableValues = allowableValues;

          /*
            Here we want to sanitize Enum values, meaning removing leading _ if any so the type in the enum
            matches the class name
           */
          if( property.baseName.equals(model.discriminator) ) {
            sanitizedAllowableValues = new ArrayList<String>();
            property.vendorExtensions.put("x-discriminator", "true");
            for(String allowableValue : allowableValues) {
              String sanitizedAllowableValue = allowableValue.startsWith("_") ? allowableValue.substring(1) : allowableValue;
              sanitizedAllowableValues.add(sanitizedAllowableValue);
            }
          }
          property.vendorExtensions.put("x-sanitized-allowable-values", sanitizedAllowableValues);
        }

        // Check that we have vendor extensions for dictionary
        if( property.vendorExtensions.containsKey("x-dictionary-name") ) {
            boolean isPrimitive = false;
            boolean isRevived = false;

            String type = (String)property.vendorExtensions.get("x-field-type");
            if( typeMapping.containsKey(type) || languageSpecificPrimitives.contains(type) ) {
                if( typeMapping.containsKey(type)) {
                  property.vendorExtensions.put("x-field-type", (String)typeMapping.get(type));
                }
                isPrimitive = true;
            } else {
                isRevived = true;
            }

            property.vendorExtensions.put("x-field-is-primitive", isPrimitive);
            property.vendorExtensions.put("x-field-is-revived", isRevived);
        }

        if ( property.vendorExtensions.containsKey("x-map-name") && !property.isListContainer) {
          throw new IllegalArgumentException("error in " + property.baseName + ", x-map-name should only apply to a "
                  + "list container.");
        }

      super.postProcessModelProperty(model, property);
    }

    /**
     * Builds the set of enum members from their declared value.
     *
     * @return {@code true} if the enum was built
     */
    private boolean buildEnumFromValues(CodegenModel cm) {
        if (!cm.isEnum || cm.allowableValues == null) {
            return false;
        }
        Map<String, Object> allowableValues = cm.allowableValues;
        List<Object> values = (List<Object>) allowableValues.get("values");
        List<Map<String, String>> enumVars =
                new ArrayList<Map<String, String>>();
        String commonPrefix = findCommonPrefixOfVars(values);
        int truncateIdx = commonPrefix.length();
        for (Object value : values) {
            Map<String, String> enumVar = new HashMap<String, String>();
            String enumName;
            if (truncateIdx == 0) {
                enumName = value.toString();
            } else {
                enumName = value.toString().substring(truncateIdx);
                if ("".equals(enumName)) {
                    enumName = value.toString();
                }
            }
            enumVar.put("name", toEnumVarName(enumName, cm.dataType));
            enumVar.put("value", toEnumValue(value.toString(), cm.dataType));
            enumVars.add(enumVar);
        }
        cm.allowableValues.put("enumVars", enumVars);
        return true;
    }

    /**
     * Builds the set of enum members from a vendor extension.
     *
     * @return {@code true} if the enum was built
     */
    private boolean buildEnumFromVendorExtension(CodegenModel cm) {
        if (!cm.isEnum || cm.allowableValues == null ||
                !useEnumExtension ||
                !cm.vendorExtensions.containsKey("x-enum-values")) {
            return false;
        }
        Object extension = cm.vendorExtensions.get("x-enum-values");
        List<Map<String, Object>> values =
                (List<Map<String, Object>>) extension;
        List<Map<String, String>> enumVars =
                new ArrayList<Map<String, String>>();
        for (Map<String, Object> value : values) {
            Map<String, String> enumVar = new HashMap<String, String>();
            String name = camelize((String) value.get("identifier"), true);
            if (isReservedWord(name)) {
                name = escapeReservedWord(name);
            }
            enumVar.put("name", name);
            enumVar.put("value", toEnumValue(
                    value.get("numericValue").toString(), cm.dataType));
            if (value.containsKey("description")) {
                enumVar.put("description", value.get("description").toString());
            }
            enumVars.add(enumVar);
        }
        cm.allowableValues.put("enumVars", enumVars);
        return true;
    }

    @Override
    public String toEnumVarName(String value, String datatype) {
        if (value.length() == 0) {
            return "empty";
        }
        String var = value.replaceAll("\\W+", "_");
        if ("number".equalsIgnoreCase(datatype) ||
                "int".equalsIgnoreCase(datatype)) {
            var = "Number" + var;
        }
        return escapeReservedWord(camelize(var, true));
    }

    @Override
    public String toEnumValue(String value, String datatype) {
      if ("number".equalsIgnoreCase(datatype) ||
            "int".equalsIgnoreCase(datatype)) {
          return value;
      } else {
          return "\"" + escapeText(value) + "\"";
      }
    }

    @Override
    public String toOperationId(String operationId) {
        // method name cannot use reserved keyword, e.g. return
        if (isReservedWord(operationId)) {
            String newOperationId = camelize("call_" + operationId, true);
            LOGGER.warn(operationId + " (reserved word) cannot be used as method name. Renamed to " + newOperationId);
            return newOperationId;
        }

        return camelize(operationId, true);
    }

    public void setBrowserClient(boolean browserClient) {
        this.browserClient = browserClient;
    }

    public void setPubName(String pubName) {
        this.pubName = pubName;
    }

    public void setPubVersion(String pubVersion) {
        this.pubVersion = pubVersion;
    }

    public void setPubDescription(String pubDescription) {
        this.pubDescription = pubDescription;
    }

    public void setUseEnumExtension(boolean useEnumExtension) {
        this.useEnumExtension = useEnumExtension;
    }

    public void setSourceFolder(String sourceFolder) {
        this.sourceFolder = sourceFolder;
    }

    @Override
    public String escapeQuotationMark(String input) {
        // remove " to avoid code injection
        return input.replace("\"", "");
    }

    @Override
    public String escapeUnsafeCharacters(String input) {
        return input.replace("*/", "*_/").replace("/*", "/_*");
    }

}
