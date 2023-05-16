package com.amadeus.codegen.ts;

import io.swagger.codegen.*;
import io.swagger.models.properties.*;

import java.util.*;
import java.io.File;

public class TypescriptfetchGenerator extends AbstractTypeScriptClientCodegen {


  /**
   * Configures a friendly name for the generator.  This will be used by the generator
   * to select the library with the -l flag.
   *
   * @return the friendly name for the generator
   */
  public String getName() {
    return "typescriptFetch";
  }

  /**
   * Returns human-friendly help for the generator.  Provide the consumer with help
   * tips, parameters here
   *
   * @return A string value for the help message
   */
  public String getHelp() {
    return "Generates a Typescript client library using the fetch API.";
  }

  public TypescriptfetchGenerator() {
    super();

    // set the output folder here
    outputFolder = "generated-code/typescriptFetch";

    /**
     * Models.  You can write model files using the modelTemplateFiles map.
     * if you want to create one template for file, you can do so here.
     * for multiple files for model, just put another entry in the `modelTemplateFiles` with
     * a different extension
     */
    modelPackage = "src/models/base";
    addModelFile("model/model.mustache", ".ts");
    addModelFile("model/reviver.mustache", ".reviver.ts");
    addModelFile("model/index.mustache", ".ts", false, getFilePathPattern(modelPackage(), "(\\/|\\\\)index.ts", true, false), modelDocTemplateFiles); // to generate a index.ts without model file name constraint
    addSupportingFile("model/models.mustache", modelPackage, "index.ts");
    addSupportingFile("model/revivers.mustache", modelPackage, "revivers.ts");
    addSupportingFile("model/enums.mustache", modelPackage, "enums.ts");
    addSupportingFile("model/patterns.mustache", modelPackage, "patterns.ts");



    /**
     * Api classes.  You can write classes for each Api file with the apiTemplateFiles map.
     * as with models, add multiple entries with different extensions for multiple files per
     * class
     */
    apiPackage = "src/api";
    addApiFile("api/api.mustache", ".ts", true, getFilePathPattern(apiPackage(), "Api.ts", true));
    addApiFile("api/fixture.mustache", ".fixture.ts", true, getFilePathPattern(apiPackage(), "Api.fixture.ts", true));
    addApiFile("api/fixture.jasmine.mustache", ".jasmine.fixture.ts", true, getFilePathPattern(apiPackage(), "Api.jasmine.fixture.ts", true));
    addApiFile("api/fixture.jest.mustache", ".jest.fixture.ts", true, getFilePathPattern(apiPackage(), "Api.jest.fixture.ts", true));
    addApiFile("api/index.mustache", ".ts", false, getFilePathPattern(apiPackage(), "(\\/|\\\\)index.ts", false, false), apiDocTemplateFiles); // to generate a index.ts without api file name constraint
    addSupportingFile("api/apis.mustache", apiPackage, "index.ts");
    addSupportingFile("api/interfaces.mustache", apiPackage, "interfaces.ts");
    addSupportingFile("api/fixtures.mustache", apiPackage, "fixtures.ts");
    addSupportingFile("api/fixtures.jasmine.mustache", apiPackage, "fixtures.jasmine.ts");
    addSupportingFile("api/fixtures.jest.mustache", apiPackage, "fixtures.jest.ts");
    addSupportingFile("api/enums.mustache", apiPackage, "enums.ts");
    addSupportingFile("spec/api-mock.mustache", "src/spec", "api-mock.ts");

    /**
     * Template Location.  This is the location which templates will be read from.  The generator
     * will use the resource stream to attempt to read the templates.
     */
    templateDir = "typescriptFetch";

    for (String pattern : this.overwriteFilepathPatterns) {
      LOGGER.info("Overwrite: " + pattern);
    }

    for (String pattern : this.skipOverwriteFilepathPatterns) {
      LOGGER.info("Skip overwrite: " + pattern);
    }
  }

  /**
   * Escapes a reserved word as defined in the `reservedWords` array. Handle escaping
   * those terms here.  This logic is only called if a variable matches the reseved words
   *
   * @return the escaped term
   */
  @Override
  public String escapeReservedWord(String name) {
    return "_" + name;  // add an underscore to the name
  }

}
