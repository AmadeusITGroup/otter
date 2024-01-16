# Swagger Codegen for the typescriptFetch library

## Overview
This is a boiler-plate project to generate your own middleware factory library.
These factories are in charge of converting beans from the Airline API Swagger specification to Digital Commerce API one.
Its goal is to get you started with the basic plumbing so you can put in your own logic.

## How do I use this?

First compile this project, run:

```
mvn package
```

You can configure the generation of the MDK code generation thanks to the following file: `\config/swagger-codegen-resteasy-config.json`

```
{
  "groupId" : "com.airline.dapi",                   // Generated Maven project Goupt ID
  "artifactId"  : "dapi-mdk",                       // Generated Maven project Artifact ID
  "modelPackage" : "com.airline.dapi",              // MDK root package path
  "additionalProperties": {
    "dapiPackage" : "com.amadeus.dapi.model.core",  // Digital Commerce (DC) model package path
    "frontendModelSuffix": "View",                  // Suffix used during Airline API class generation (to avoid class name collision with DC classes)
    "generateRootSupportingFiles": "true",          // To be true the first time of generation and next set to false to avoid
    "enumUpperUnderscore": "true",                  // Depending of the enum generation of DC Model generation enum can be with underscore or not.
    "dapiSdkClientVersion":  "2.24.9"               // Version of the java DxApi sdk package
                                                    // Please align this setting with your implementation
  },

  "library" :  "resteasy",
  "dateLibrary" : "java8",
  "java8": true,
  "hideGenerationTimestamp": true
}
```

In your generator project, a single jar file will be produced in `target`.  You can now use that with codegen:

```
java -cp "/path/to/swagger-codegen-cli.jar;/path/to/mdk/target/folder/mdk-swagger-codegen-0.0.0.jar;" \
     io.swagger.codegen.SwaggerCodegen generate -l javaMdk \
     -i "/path/to/your/swagger/spec/file/Airline_Public.yaml" \
     -c "/path/to/the/project/config/swagger-codegen-config.json" \
     -o "/path/to/your/mdk/repo"
```

At this point, you've likely generated a client setup.  It will include something along these lines:

```
/path/to/your/mdk/repo
|- README.md
|- pom.xml      // Maven build script with only dependency to JSR-330 annotation and MapStruct lib. Java 8+
|-- docs
    |-- Definition.md // Generated Bean documentation based on Swagger Specification defintion
|-- src
    |-- main
        |-- java
            |-- your.configured.packaged.mapper     // MapStruct mappers translating Airline beans to DxAPI beans and the opposite
                    |-- delegate                    // Mapper Delegate interface defining custom logic injector during the bean translation
            |-- your.configured.packaged.model      // Airline API Bean based on Airline Swagger specification definitions
                |-- base                            // Read-only generated bean based on the swagger definitions
                |-- core                            // Empty core model extending the base ones used to hold custom helper.
```
