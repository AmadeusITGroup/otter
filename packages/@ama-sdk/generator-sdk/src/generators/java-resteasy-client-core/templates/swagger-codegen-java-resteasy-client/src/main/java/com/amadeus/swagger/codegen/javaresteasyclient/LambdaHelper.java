package com.amadeus.swagger.codegen.javaresteasyclient;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.swagger.models.ArrayModel;
import io.swagger.models.Model;
import io.swagger.models.ModelImpl;
import io.swagger.models.parameters.BodyParameter;
import io.swagger.models.parameters.Parameter;
import io.swagger.models.parameters.SerializableParameter;
import io.swagger.models.properties.ArrayProperty;
import io.swagger.models.properties.Property;
import io.swagger.models.properties.PropertyBuilder;
import io.swagger.models.properties.RefProperty;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Helper around {@link io.swagger.models.Swagger} meta-model classes
 */
public class LambdaHelper {

  public static abstract class CustomLambda implements Mustache.Lambda {

    @Override
    public void execute(Template.Fragment frag, Writer out) throws IOException {
      final StringWriter tempWriter = new StringWriter();
      frag.execute(tempWriter);
      out.write(formatFragment(tempWriter.toString()));
    }

    public abstract String formatFragment(String fragment);
  }

  public static class UppercaseFirstLambda extends CustomLambda {

    public UppercaseFirstLambda() {}

    @Override
    public String formatFragment(String fragment) {
      return fragment.substring(0, 1).toUpperCase() + fragment.substring(1);
    }
  }

  public static class RemoveDuplicateLinesLambda extends CustomLambda {

    public RemoveDuplicateLinesLambda() {}

    @Override
    public String formatFragment(String fragment) {
      Set<String> uniqueLines = new HashSet<>();
      uniqueLines.addAll(Arrays.asList(fragment.split("\n")));
      return StringUtils.join(uniqueLines.toArray(), "\n");
    }
  }

  /**
   * Remove empty lines for the fragment
   */
  public static class RemoveEmptyLines extends CustomLambda {

    public RemoveEmptyLines() {
    }

    @Override public String formatFragment(String fragment) {
      return Pattern.compile("^(?:[\\t ]*(?:\\r?\\n|\\r))+", Pattern.MULTILINE).matcher(fragment).replaceAll("");
    }
  }

  public static final Logger LOGGER = LoggerFactory.getLogger(LambdaHelper.class);

  /**
   * Converts a swagger operation parameter into a swagger model property
   */
  public Property convertParameterToProperty(Parameter parameter) {
    LOGGER.debug("Converting parameter " + parameter.getName());
    Property property = null;

    if (parameter instanceof SerializableParameter) {
      property = convertParameterToProperty((SerializableParameter)parameter);
    }
    else if (parameter instanceof BodyParameter) {
      property = convertParameterToProperty((BodyParameter)parameter);
    }
    else {
      LOGGER.error("Unexpected class to convert " + parameter + " to a property");
    }
    return property;
  }

  private Property convertParameterToProperty(SerializableParameter parameter) {
    Property property = PropertyBuilder.build(parameter.getType(), parameter.getFormat(), null);
    if (property instanceof ArrayProperty) {
      ((ArrayProperty)property).setItems(parameter.getItems());
    }
    property.setName(parameter.getName());
    property.setDescription(parameter.getDescription());
    return property;
  }

  private Property convertParameterToProperty(BodyParameter parameter) {
    Property property = null;
    Model schema = parameter.getSchema();
    if (schema instanceof ArrayModel) {
      // ArrayModel#getReference() returns null, need to workaround
      property = PropertyBuilder.build("array", null, null);
      ((ArrayProperty)property).setItems(((ArrayModel)schema).getItems());
    } else if (schema instanceof ModelImpl) {
      ModelImpl schemaImpl = (ModelImpl) schema;
      property = PropertyBuilder.build(schemaImpl.getType(), schemaImpl.getFormat(), null);
    } else {
      property = new RefProperty(schema.getReference());
    }
    property.setExample(parameter.getExamples());
    property.setName(parameter.getName());
    property.setDescription(parameter.getDescription());
    return property;
  }
}
