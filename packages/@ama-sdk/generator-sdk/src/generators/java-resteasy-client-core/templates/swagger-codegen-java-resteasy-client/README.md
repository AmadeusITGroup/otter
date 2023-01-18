# Swagger Codegen for the javaResteasyClient library

##DEPRECATED
Please use the [java-client-core](../../../java-client-core/templates/swagger-codegen-java-client) generator instead.

## Overview
This is a boiler-plate project to generate your own client library with Swagger.  Its goal is
to get you started with the basic plumbing so you can put in your own logic.  It won't work without
your changes applied.

## What's Swagger?
The goal of Swagger™ is to define a standard, language-agnostic interface to REST APIs which allows both humans and computers to discover and understand the capabilities of the service without access to source code, documentation, or through network traffic inspection. When properly defined via Swagger, a consumer can understand and interact with the remote service with a minimal amount of implementation logic. Similar to what interfaces have done for lower-level programming, Swagger removes the guesswork in calling the service.


Check out [OpenAPI-Spec](https://github.com/OAI/OpenAPI-Specification) for additional information about the Swagger project, including additional libraries with support for other languages and more. 

## How do I use this?
At this point, you've likely generated a client setup.  It will include something along these lines:

```
.
|- README.md    // this file
|- pom.xml      // build script
|-- src
|--- main
|---- java
|----- com.amadeus.swagger.codegen.javaresteasyclient.JavaResteasyClientCodegen.java // generator file
|---- resources
|----- javaResteasyClient // template files
|----- config
|------- swagger-codegen-config.json // language generation config file
|----- META-INF
|------ services
|------- io.swagger.codegen.CodegenConfig
```

You _will_ need to make changes in at least the following:

`JavaResteasyClientCodegen.java`

Templates in this folder:

`src/main/resources/javaResteasyClient`

Once modified, you can run this:

```
mvn package
```

In your generator project.  A single jar file will be produced in `target`.  You can now use that with codegen:

```
java -cp /path/to/swagger-codegen-distribution:/path/to/your/jar io.swagger.codegen.Codegen -l javaResteasyClient -c "path/to/language/config/file/swagger-codegen-config.json" -o ./test-sdk
```

Now your templates are available to the client generator and you can write output values

## But how do I modify this?
The `JavaResteasyClientCodegen.java` has comments in it--lots of comments.  There is no good substitute
for reading the code more, though.  See how the `JavaResteasyClientCodegen` implements `CodegenConfig`.
That class has the signature of all values that can be overridden.

For the templates themselves, you have a number of values available to you for generation.
You can execute the `java` command from above while passing different debug flags to show
the object you have available during client generation:

```
# The following additional debug options are available for all codegen targets:
# -DdebugSwagger prints the OpenAPI Specification as interpreted by the codegen
# -DdebugModels prints models passed to the template engine
# -DdebugOperations prints operations passed to the template engine
# -DdebugSupportingFiles prints additional data passed to the template engine

java -DdebugOperations -cp /path/to/swagger-codegen-distribution:/path/to/your/jar io.swagger.codegen.Codegen -l javaResteasyClient -c "path/to/language/config/file/swagger-codegen-config.json" -o ./test-sdk
```

Will, for example, output the debug info for operations.  You can use this info
in the `api.mustache` file.

## How does the template mechanism work?
The default templates provided by swagger are downloaded, and these are overwritten by custom templates provided in __src/resources/javaRestEasyClient__.
This part is done configured in pom.xml. 
### pom.xml
Our pom.xml is doing two important things regarding the templates
- Firstly it will unpack the swagger codegen 2.4.0-AMADEUS mustache templates into __target/default-templates__. If a file with the same name is found we dont overwrite it.
- Secondly it will copy the unpacked __target/default-templates/Java__ into __target/classes/javaRestEasyClient__ again without overwriting the files if they are present. This is the directory that will be used by the generator to create all your java.

### swagger-codegen-config.json
Our main use of this file is to define the library from which we will get the mustache templates. You can see the different libraries that were unpacked target/default-templates/Java/libraries i.e: jersey2, okttp-json, retrofit, resteasy, etc. In our case we are using resteasy so we can configure the swagger-codegen-config accordingly":

"library" :  "resteasy"

Example of swagger-codegen-config.json
```
{
  "modelPackage" : "com.amadeus.dapi.resteasy.models",
  "apiPackage"   : "com.amadeus.dapi.resteasy.api",
  "invokerPackage" : "com.amadeus.dapi.resteasy",
  "groupId" : "com.amadeus.dapi.resteasy",
  "artifactId"  : "dapi-resteasy-client-sdk",
  "library" :  "resteasy",
  "dateLibrary" : "java8",
  "java8": true,
  "hideGenerationTimestamp": true,
  "additionalProperties": {
    "authenticationPackage": "com.amadeus.dapi.resteasy.auth.oneaauth"
  }
}

```

### writing your mustache templates
The next step is to write your custom mustache templates resources\javaRestEasyClient these will overwrite the ones from the library target/classes/javaRestEasyClient (default templates downloaded at build time).

