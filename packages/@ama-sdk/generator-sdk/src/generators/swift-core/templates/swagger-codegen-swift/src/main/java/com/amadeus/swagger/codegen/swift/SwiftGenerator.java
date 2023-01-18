package com.amadeus.swagger.codegen.swift;

import io.swagger.codegen.CodegenConfig;
import io.swagger.codegen.CodegenProperty;
import io.swagger.codegen.SupportingFile;
import io.swagger.codegen.languages.Swift3Codegen;

import java.io.File;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;

import static io.swagger.codegen.languages.FlaskConnexionCodegen.CONTROLLER_PACKAGE;

public class SwiftGenerator extends Swift3Codegen implements CodegenConfig {

    private static final String LANGUAGE_NAME = "Swift3DAPI";
    private static final String TEMPLATE_DIR = "Swift3Client";
    private static final String PRIVATE_SWIFT = "Private.swift";
    private static final String SWIFT_EXTENSION = ".swift";
    private static final List<String> SUPPORT_FILES_TO_REMOVE = Arrays.asList("APIs.mustache", "AlamofireImplementations.mustache", "api.mustache", "Configuration.mustache", "Extensions.mustache",
        "git_push.sh.mustache", "gitignore.mustache", "Cartfile.mustache", "model.mustache");

    public SwiftGenerator() {
        super();

        // Override the output folder and template location
        outputFolder = "generated-code" + File.separator + TEMPLATE_DIR;
        templateDir = TEMPLATE_DIR;
        embeddedTemplateDir = TEMPLATE_DIR;
    }

    @Override
    public String getName() {
        return LANGUAGE_NAME;
    }

    @Override
    public void processOpts(){
        super.processOpts();

        for (Iterator<SupportingFile> it = supportingFiles.iterator(); it.hasNext();) {
            SupportingFile supportingFile = it.next();
            if (SUPPORT_FILES_TO_REMOVE.contains(supportingFile.templateFile)) {
              it.remove();
            }
          }

        modelTemplateFiles.put("model.mustache", PRIVATE_SWIFT);
        modelTemplateFiles.put("publicModel.mustache", SWIFT_EXTENSION);

        supportingFiles.add(new SupportingFile("APIs.mustache", this.sourceFolder, "APIs.swift"));
        supportingFiles.add(new SupportingFile("AlamofireImplementations.mustache", this.sourceFolder, "AlamofireImplementations.swift"));
        supportingFiles.add(new SupportingFile("Configuration.mustache", this.sourceFolder, "Configuration.swift"));
        supportingFiles.add(new SupportingFile("Extensions.mustache", this.sourceFolder, "Extensions.swift"));
        this.apiTemplateFiles.put("api.mustache", SWIFT_EXTENSION);
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

    @Override
    public boolean shouldOverwrite(String filename) {
        if (filename.contains(modelFileFolder()) && !filename.endsWith(PRIVATE_SWIFT)) {
            File tmpFile = new File(filename);
            if (tmpFile.exists()) {
                return false;
            }
        }
        return super.shouldOverwrite(filename);
    }

}
