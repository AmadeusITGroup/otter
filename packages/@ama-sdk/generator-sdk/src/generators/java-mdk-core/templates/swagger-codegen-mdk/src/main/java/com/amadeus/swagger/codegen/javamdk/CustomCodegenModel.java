package com.amadeus.swagger.codegen.javamdk;

import io.swagger.codegen.CodegenModel;
import org.commonmark.node.Code;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

public class CustomCodegenModel extends CodegenModel {

  public String backendReference;
  public Set<Map<String, String>> nestedMappers;
  public Set<Map<String, String>> frontendRefs;

  /**
   * This property tracks the class polymorphism between parent class and child classes to determine the appropriate mapper
   * to use when mapping a DxAPI class.
   *
   * Example: PaymentCard or VoucherPayment when mapping a PaymentMethod
   */
  public Map<String, Set<String>> parentChildrenMapperMapping;

  /**
   * This property tracks the class polymorphism between parent class and child classes associated to enum and discriminator
   * It will be used to properly build the @JsonSubTypes annotation in the parent model to be able to (de)serialize
   * from/in json.
   */
  public Map<String, Set<String>> parentChildrenEnumMapping;

  public CustomCodegenModel(CodegenModel model) {
    this.parent = model.parent;
    this.parentSchema = model.parentSchema;
    this.interfaces = model.interfaces;
    this.parentModel = model.parentModel;
    this.interfaceModels = model.interfaceModels;
    this.children = model.children;
    this.name = model.name;
    this.classname = model.classname;
    this.title = model.title;
    this.description = model.description;
    this.classVarName = model.classVarName;
    this.modelJson = model.modelJson;
    this.dataType = model.dataType;
    this.xmlPrefix = model.xmlPrefix;
    this.xmlNamespace = model.xmlNamespace;
    this.xmlName = model.xmlName;
    this.classFilename = model.classFilename;
    this.unescapedDescription = model.unescapedDescription;
    this.discriminator = model.discriminator;
    this.defaultValue = model.defaultValue;
    this.arrayModelType = model.arrayModelType;
    this.isAlias = model.isAlias;
    this.vars = model.vars;
    this.requiredVars = model.requiredVars;
    this.optionalVars = model.optionalVars;
    this.readOnlyVars = model.readOnlyVars;
    this.readWriteVars = model.readWriteVars;
    this.allVars = model.allVars;
    this.parentVars = model.parentVars;
    this.allowableValues = model.allowableValues;
    this.mandatory = model.mandatory;
    this.allMandatory = model.allMandatory;
    this.imports = model.imports;
    this.hasVars = model.hasVars;
    this.emptyVars = model.emptyVars;
    this.hasMoreModels = model.hasMoreModels;
    this.hasEnums = model.hasEnums;
    this.isEnum = model.isEnum;
    this.hasRequired = model.hasRequired;
    this.hasOptional = model.hasOptional;
    this.isArrayModel = model.isArrayModel;
    this.hasChildren = model.hasChildren;
    this.hasOnlyReadOnly = model.hasOnlyReadOnly;
    this.externalDocs = model.externalDocs;
    this.vendorExtensions = model.vendorExtensions;
    this.additionalPropertiesType = model.additionalPropertiesType;
    this.nestedMappers = new HashSet<>();
    this.frontendRefs = new HashSet<>();
  }

  public void addMapper(String datatype) {
    nestedMappers.add(Collections.singletonMap("classname", datatype + "Mapper"));
  }

  public void addFrontendClass(String datatype) {
    frontendRefs.add(Collections.singletonMap("classname", datatype));
  }

  public void filterMappers(Set<String> generatedMappers) {
    Iterator<Map<String, String>> nestedMapperIter = nestedMappers.iterator();
    while (nestedMapperIter.hasNext()) {
      Map<String, String> nestedMapper = nestedMapperIter.next();
      if (!generatedMappers.contains(nestedMapper.get("classname"))) {
        nestedMapperIter.remove();
      }
    }
  }

  public Set<Map<String, String>> getChildrenMappers() {
    Set<Map<String, String>> results = new HashSet<>();
    Set<String> children = parentChildrenMapperMapping.get(classname);
    if (children != null) {
      for (String childType : children) {
        results.add(Collections.singletonMap("classname", childType));
      }
    }
    return results;
  }

  public Set<Map<String, String>> getChildrenEnums() {
    Set<Map<String, String>> results = new HashSet<>();
    Set<String> children = parentChildrenEnumMapping.get(classname);
    if (children != null) {
      for (String childType : children) {
        results.add(Collections.singletonMap("classname", childType));
      }
    }
    return results;
  }

  public boolean hasChildrenMappers() {
    return parentChildrenMapperMapping.get(classname) != null;
  }
}
