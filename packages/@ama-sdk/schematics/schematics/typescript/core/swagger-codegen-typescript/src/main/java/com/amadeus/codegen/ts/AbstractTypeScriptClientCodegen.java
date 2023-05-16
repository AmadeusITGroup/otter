package com.amadeus.codegen.ts;

import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.util.*;

import io.swagger.codegen.CliOption;
import io.swagger.codegen.CodegenConfig;
import io.swagger.codegen.CodegenConstants;
import io.swagger.codegen.CodegenModel;
import io.swagger.codegen.CodegenOperation;
import io.swagger.codegen.CodegenParameter;
import io.swagger.codegen.CodegenProperty;
import io.swagger.codegen.CodegenType;
import io.swagger.codegen.DefaultCodegen;
import io.swagger.codegen.SupportingFile;
import io.swagger.models.properties.ArrayProperty;
import io.swagger.models.properties.FileProperty;
import io.swagger.models.properties.MapProperty;
import io.swagger.models.properties.Property;

public abstract class AbstractTypeScriptClientCodegen extends DefaultCodegen implements CodegenConfig {

    protected String modelPropertyNaming= "camelCase";
    protected Boolean supportsES6 = true;

    // Pattern to indicate which filepaths should be overwritten
    protected List<String> overwriteFilepathPatterns;
    // Pattern to indicate which filepaths should skip overwrite
    protected List<String> skipOverwriteFilepathPatterns;

    protected List<String> nonObjectModels;

    public AbstractTypeScriptClientCodegen() {
        super();

        overwriteFilepathPatterns = new ArrayList<String>();
        skipOverwriteFilepathPatterns = new ArrayList<String>();
        // Holds the list of nonObjectModels (models that does not contain revivers)
        nonObjectModels = new ArrayList<String>();

        // clear import mapping (from default generator) as TS does not use it
        // at the moment
        importMapping.clear();

        supportsInheritance = true;
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
        private final boolean lowerCaseFirst;

        public CamelizeLambda(boolean lowerCaseFirst) {
            this.lowerCaseFirst = lowerCaseFirst;
        }

        @Override
        public String formatFragment(String fragment) {
            return camelize(fragment, lowerCaseFirst);
        }
    }

    @Override
    public void processOpts() {
        super.processOpts();

        if (additionalProperties.containsKey(CodegenConstants.MODEL_PROPERTY_NAMING)) {
            setModelPropertyNaming((String) additionalProperties.get(CodegenConstants.MODEL_PROPERTY_NAMING));
        }

        if (additionalProperties.containsKey(CodegenConstants.SUPPORTS_ES6)) {
            setSupportsES6(Boolean.valueOf((String)additionalProperties.get(CodegenConstants.SUPPORTS_ES6)));
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
        name = camelize(name, true);

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
    public String getTypeDeclaration(Property p) {
        if (p instanceof ArrayProperty) {
            ArrayProperty ap = (ArrayProperty) p;
            Property inner = ap.getItems();
            return getTypeDeclaration(inner) + "[]";
        } else if (p instanceof MapProperty) {
            MapProperty mp = (MapProperty) p;
            Property inner = mp.getAdditionalProperties();
            return "{ [key: string]: "+ getTypeDeclaration(inner) + "; }";
        } else if (p instanceof FileProperty) {
            return "any";
        }
        return super.getTypeDeclaration(p);
    }

    @Override
    public String getSwaggerType(Property p) {
        String swaggerType = super.getSwaggerType(p);
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
            return escapeReservedWord(camelize(sanitizeName(operationId), true));
        }

        return camelize(sanitizeName(operationId), true);
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
            case original:    return name;
            case camelCase:   return camelize(name, true);
            case PascalCase:  return camelize(name);
            case snake_case:  return underscore(name);
            default:          throw new IllegalArgumentException("Invalid model property naming '" +
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

                // exclude the classname for revivers
                List<String> filteredSubTypes = new ArrayList<String>();
                for(String subType : sanitizedAllowableValues) {
                    if(!StringUtils.equals(model.classname, subType)) {
                        filteredSubTypes.add(subType);
                    }
                }

                model.vendorExtensions.put("x-discriminator-subtypes", filteredSubTypes);
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

        // If the x-date-timezone is present in the timestamp, we use Date instead of utils.Date
        if( property.vendorExtensions.containsKey("x-date-timezone")) {
            for (CodegenProperty modelVariable : model.allVars) {
                if (modelVariable.baseName != null && modelVariable.baseName.toString().equals("timestamp")) {
                    modelVariable.datatype = "Date";
                    modelVariable.datatypeWithEnum = "Date";
                    modelVariable.baseType = "Date";
                }
            }
        }
    }

    /**
     * As we do not want to modify Swagger's generator, we need to remove the package from the imports.
     * Also, extracts additional imports from vendor extensions (used for dictionaries);
     * ie: model.Category becomes Category
     * import {Category} from './Category';
     */
    @Override
    public Map<String, Object> postProcessModels(Map<String, Object> objs) {

        // First, correct the entries, and keep a pointer on the imports HashMap
        List<HashMap> importsMap = null;
        for (Map.Entry<String, Object> entry : objs.entrySet())
        {
            if( "imports".equals(entry.getKey()) ) {
                importsMap = (List<HashMap>)entry.getValue();
                for( HashMap _map : importsMap ) {
                    String _import = (String) _map.get("import");
                    _map.put("import", _import.substring(_import.lastIndexOf(".")+1));
                }

            }
        }

        // Store additional imports from vendor extensions
        if( importsMap != null ) {

            List<String> alreadyImported = new ArrayList();
            for (Map.Entry<String, Object> entry : objs.entrySet())
            {
                if( "models".equals(entry.getKey()) ) {

                    // Get the list of non-object definitions
                    for( HashMap _map : (List<HashMap>)entry.getValue() ) {
                        CodegenModel model = (CodegenModel) _map.get("model");
                        if (model.isEnum) {
                            nonObjectModels.add(model.name);
                        }
                    }

                    for( HashMap _map : (List<HashMap>)entry.getValue() ) {
                        CodegenModel model = (CodegenModel) _map.get("model");
                        boolean containsExtensions = false;
                        ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
                        group.add( model.vars );
                        group.add( model.requiredVars );
                        group.add( model.optionalVars );
                        for(List<CodegenProperty> container: group )
                        {
                            for( CodegenProperty prop: container ) {
                                Map<String, Object> vendorExtensions = prop.vendorExtensions;
                                if( vendorExtensions.containsKey("x-field-type") ) {
                                    containsExtensions = true;
                                    String fieldType = (String)vendorExtensions.get("x-field-type");
                                    if( !this.languageSpecificPrimitives.contains(fieldType) && !alreadyImported.contains(fieldType) ) {
                                        alreadyImported.add(fieldType);
                                        HashMap addImport = new HashMap();
                                        addImport.put("import", vendorExtensions.get("x-field-type") );
                                        importsMap.add(addImport);
                                    }
                                }
                            }
                        }

                        // We store on the model's vendor extension a parameter saying our vars have vendor extensions (hence, a dictionary)
                        if( containsExtensions == true ) {
                            model.vendorExtensions.put("requireDictionary", Boolean.TRUE);
                        }
                    }
                }
            }
        }

        return objs;
    }

    /**
     * This post-processing is to avoid the use of revivers from non-object models (e.g. enums in definition)
     */
    @Override
    public Map<String, Object> postProcessAllModels(Map<String, Object> objs) {
        System.out.println("Non object models: " + nonObjectModels.toString());
        for (Map.Entry<String, Object> entry : objs.entrySet()) { // Loops through all the definitions
            HashMap swaggerMap = (HashMap)entry.getValue();
            for (HashMap _modelsMap : (List<HashMap>)swaggerMap.get("models")) {
                CodegenModel model = (CodegenModel) _modelsMap.get("model"); // Gets the model associated to that
                boolean nonObjectDefinition = false;
                ArrayList<List<CodegenProperty>> group = new ArrayList<List<CodegenProperty>>();
                group.add( model.vars );
                group.add( model.requiredVars );
                group.add( model.optionalVars );
                for(List<CodegenProperty> container: group ) // Loops through allVars
                {
                    for( CodegenProperty prop: container ) {
                        if (prop.complexType != null) {
                            for(String str : nonObjectModels) { // Check if the complexType is in the nonObjectModels list
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
        return super.postProcessAllModels(objs);
    }

    /**
     * As we do not want to modify Swagger's generator, we need to remove the package from the imports.
     * ie: model.Category becomes Category
     * import {Category} from './Category';
     *
     * Also, TypeScript does not need JAVA imports, so remove them as well.
     *
     * Group the parameters marked as containing personal information from all the operations into a global set.
     */
    @SuppressWarnings("static-method")
    public Map<String, Object> postProcessOperations(Map<String, Object> objs) {
        for (Map.Entry<String, Object> entry : objs.entrySet())
        {
            if( "imports".equals(entry.getKey()) ) {
                for (Iterator<HashMap> iter = ((List<HashMap>)entry.getValue()).listIterator(); iter.hasNext(); ) {
                    HashMap _map = iter.next();
                    String _import = (String) _map.get("import");

                    if( _import.startsWith(modelPackage+".UtilsDate") ) {
                        iter.remove();
                    } else if( _import.startsWith(modelPackage) ) {
                        _map.put("import", _import.substring(_import.lastIndexOf(".") + 1));
                    } else {
                        iter.remove();
                    }
                }
            }
            if( "operations".equals(entry.getKey()) ) {
                Set<String> piiParams = new HashSet<String>();
                Map operations = (Map) entry.getValue();
                List<CodegenOperation> operationList = (List<CodegenOperation>) operations.get("operation");

                for(CodegenOperation operation : operationList) {
                    for (CodegenParameter param : operation.allParams) {
                        if ((param.isQueryParam || param.isPathParam) && param.vendorExtensions.containsKey("x-risk-personal-data-field")) {
                            piiParams.add(param.baseName);
                        }
                    }
                }

                operations.put("x-risk-personal-data-field-list", piiParams);
            }
        }
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
                if( f.isFile() ) {
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

    public void addModelFile(String template, String fileExtension, boolean overwrite, String pattern, Map<String, String> fileContainer) {
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

    public void addApiFile(String template, String fileExtension, boolean overwrite, String pattern, Map<String, String> fileContainer) {
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

    public void addSupportingFile(String template, String folder, String destinationFilename, boolean overwrite, String pattern) {
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

    public void addFile(String template, String fileExtension, boolean overwrite, String pattern, Map<String, String> fileContainer) {
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
    public String toInstantiationType(Property p) {
        if (p instanceof MapProperty) {
            MapProperty ap = (MapProperty)p;
            Property additionalProperties2 = ap.getAdditionalProperties();
            String type = additionalProperties2.getType();
            if (null == type) {
                LOGGER.error("No Type defined for Additional Property " + additionalProperties2 + "\n" + "\tIn Property: " + p);
            }

            String inner = this.getSwaggerType(additionalProperties2);
            return (String)"Record<string, " + inner + ">";
        } else {
            return super.toInstantiationType(p);
        }
    }

}
