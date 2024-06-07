package com.amadeus.codegen.ts;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;

import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.io.Writer;
import java.io.StringWriter;

import java.lang.System;
import java.lang.StringBuilder;

import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;

import java.util.ListIterator;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class LambdaHelper {

  private static final String VALID_PROPERTY_REGEXP = "^(?!\\d)[\\w$]+$";

  public static abstract class CustomLambda implements Mustache.Lambda {
      @Override
      public void execute(Template.Fragment frag, Writer out) throws IOException {
          final StringWriter tempWriter = new StringWriter();
          frag.execute(tempWriter);
          out.write(formatFragment(tempWriter.toString()));
      }

      public abstract String formatFragment(String fragment);
  }

  public static class SimpleMathLambda extends CustomLambda {

      public SimpleMathLambda() {}

      @Override
      public String formatFragment(String fragment) {
          final ScriptEngineManager engineManager = new ScriptEngineManager();
          final ScriptEngine engine = engineManager.getEngineByName("JavaScript");
          String result = "Invalid Math";
          try {
            result = engine.eval(fragment).toString();
          } catch(Exception e) {}
          return result;
      }
  }

  /**
   * Replaces placeholders in the URL such as
   * /carts/{cartId}/travelers
   * to
   * /carts/${data['cartId']}/travelers
   */
  public static class UrlParamReplacerLambda extends CustomLambda {

      public UrlParamReplacerLambda() {}

      @Override
      public String formatFragment(String fragment) {
          return fragment.replaceAll("\\{([\\w_-]+)\\}", "\\${data['$1']}");
      }

  }

  /**
   * Replaces placeholders in the URL such as
   * /carts/{cartId}/travelers
   * to
   * /carts/${this.piiParamTokens['$1'] || data['$1']}/travelers
   */
  public static class TokenizedUrlParamReplacerLambda extends CustomLambda {

      public TokenizedUrlParamReplacerLambda() {}

      @Override
      public String formatFragment(String fragment) {
          return fragment.replaceAll("\\{([\\w_-]+)\\}", "\\${this.piiParamTokens['$1'] || data['$1']}");
      }
  }

  public static class RemoveText extends CustomLambda {

      private String text;

      public RemoveText(String text) {
        this.text = text;
      }

      @Override
      public String formatFragment(String fragment) {
        return fragment.replace(text, "");
      }

  }

  public static class RemoveEndText extends CustomLambda {

      private String text;

      public RemoveEndText(String text) {
        this.text = text;
      }

      @Override
      public String formatFragment(String fragment) {
        return fragment.replaceAll(text + "$", "");
      }

  }

  public static class UppercaseFirstLambda extends CustomLambda {

      public UppercaseFirstLambda() {}

      @Override
      public String formatFragment(String fragment) {
          return fragment.substring(0, 1).toUpperCase() + fragment.substring(1);
      }
  }

  public static class KebabCaseLambda extends CustomLambda {

    public KebabCaseLambda() {}

    @Override
    public String formatFragment(String fragment) {
      if (fragment.length() > 0) {
        String lowerFirst = Character.toLowerCase(fragment.charAt(0)) + fragment.substring(1);
        return lowerFirst.replaceAll("([A-Z])", "-$1").toLowerCase();
      }
      return "";
    }
  }

  public static class TrimRightLambda extends CustomLambda {
      private final String characters;

      public TrimRightLambda(String characters) {
          this.characters = characters;
      }

      @Override
      public String formatFragment(String fragment) {
          return StringUtils.stripEnd(fragment, characters);
      }
  }

  public static class CleanBreakLineLambda extends CustomLambda {
      public CleanBreakLineLambda() {
      }

      @Override
      public String formatFragment(String fragment) {
          return fragment.replaceAll("[\\t\\n\\r]", "");
      }
  }

  public static class CleanArraySuffix extends CustomLambda {
      public CleanArraySuffix() {
      }

      @Override
      public String formatFragment(String fragment) {
          return fragment.replaceAll("\\[\\]", "");
      }
  }

  public static class Plurialize extends CustomLambda {
      public Plurialize() {
      }

      @Override
      public String formatFragment(String fragment) {
          return fragment.replaceAll("^(.*)y$", "$1ie") + "s";
      }
  }

  public static class CleanEmptyImportExportLambda extends CustomLambda {
      private final String type;

      public CleanEmptyImportExportLambda() {
        this.type = "(im|ex)port";
      }

      public CleanEmptyImportExportLambda(String type) {
        this.type = type;
      }

      @Override
      public String formatFragment(String fragment) {
        return fragment.replaceAll("(?m)" + type + " +\\{ *\\} *(as +[^ ]*)? from .*\r?\n", "");
      }
  }

  public static class ReplaceWithTextIfEmpty extends CustomLambda {

    private String text;

    public ReplaceWithTextIfEmpty(String text) { this.text = text; }

    @Override
    public String formatFragment(String fragment) {
      if (fragment.trim().isEmpty()) {
        return text;
      }
      return fragment;
    }

  }

  public static class AddTabs extends CustomLambda {
      private final int  numberOfTabs;
      private final String tabString;

      public AddTabs(int numberOfTabs) {
        this.numberOfTabs = numberOfTabs;
        this.tabString = "  ";
      }

      public AddTabs(int numberOfTabs, String tabString) {
        this.numberOfTabs = numberOfTabs;
        this.tabString = tabString;
      }

      @Override
      public String formatFragment(String fragment) {
        String[] listParams = fragment.split(" *\\r?\\n *");
        List<String> al = new ArrayList<String>(Arrays.asList(listParams));

        StringBuilder res = new StringBuilder("");

        for (String s : al)
        {
          if ("".equals(s)) {
            continue;
          }
          for (int i = 0; i < numberOfTabs; i++) {
            res.append(tabString);
          }
          res.append(s).append(System.getProperty("line.separator"));
        }

        return res.toString();
      }
  }

  public static class RemoveDuplicate extends CustomLambda {
      private final String separator;
      private final String newSeparator;

      public RemoveDuplicate(String separator) {
        this.separator = separator;
        this.newSeparator = separator;
      }

      public RemoveDuplicate(String separator, String newSeparator) {
        this.separator = separator;
        this.newSeparator = newSeparator;
      }

      @Override
      public String formatFragment(String fragment) {
        String[] listParams = fragment.split(separator);
        List<String> al = new ArrayList<String>(Arrays.asList(listParams));
        al = new ArrayList<String>(new LinkedHashSet<String>(al));

        StringBuilder res = new StringBuilder("");
        String prefix = "";

        for (String s : al)
        {
          res.append(prefix).append(s);
          prefix = newSeparator;
        }

        return res.toString();
      }
  }

  public static class RemoveDuplicateParams extends CustomLambda {
      private final String separator;

      public RemoveDuplicateParams(String separator) {
        this.separator = separator;
      }

      @Override
      public String formatFragment(String fragment) {
        String[] listParams = fragment.split(separator);
        List<String> al = new ArrayList<String>(Arrays.asList(listParams));
        al = new ArrayList<String>(new LinkedHashSet<String>(al));

        List<String> check = new ArrayList<String>();
        StringBuilder res = new StringBuilder("");
        String prefix = "";

        for (String s : al)
        {
          boolean shouldBeKept = true;
          for (String c : check)
          {
            String paramName = StringUtils.substringBefore(s, ":");
            shouldBeKept &= !StringUtils.substringBefore(c, ":").equals(paramName);
          }

          if (!shouldBeKept)
            continue;

          check.add(s);
          res.append(prefix).append(s);
          prefix = separator;
        }

        return res.toString();
      }
  }

  public static class ParseRegexp extends CustomLambda {

      public ParseRegexp() {}

      @Override
      public String formatFragment(String fragment) {
          return fragment.replace("\\\\", "\\");
      }
  }

  public static class ApiFolderName extends CustomLambda {
    public ApiFolderName() {}

    @Override
    public String formatFragment(String fragment) {
      String classNameNoApi = fragment.replaceFirst("(\\w*)Api$", "$1");
      String lowerFirst = Character.toLowerCase(classNameNoApi.charAt(0)) + classNameNoApi.substring(1);
      return lowerFirst.replaceAll("([A-Z])", "-$1").toLowerCase();
    }
  }

  public static class ResourceFromPath extends CustomLambda {
    public ResourceFromPath() {}

    @Override
    public String formatFragment(String format) {
      Pattern resourcePath = getPattern();
      Matcher resourceMatcher = resourcePath.matcher(format);
      if (resourceMatcher.find()){
        return handleMatcher(format, resourceMatcher);
      }
      return format;
    }

    public Pattern getPattern() {
      return Pattern.compile("\\/([\\w-]+\\/?){1,2}\\/?");
    }

    public String handleMatcher(String format, Matcher resourceMatcher) {
      String resourceHyphen = resourceMatcher.group(0);
      String[] pathSplit = resourceHyphen.split("\\/");
      for (int index = pathSplit.length -1; index >= 0; index--) {
        if (!pathSplit[index].equals("")) {
          return hyphenToCamel(pathSplit[index]);
        }
      }
      return format;
    }

    public String hyphenToCamel(String hyphenString) {
      Pattern p = Pattern.compile("-(\\w)");
      Matcher m = p.matcher(hyphenString);
      StringBuffer sb = new StringBuffer();
      while (m.find()) {
        m.appendReplacement(sb, "");
        sb.append(m.group(1).toUpperCase());
      }
      m.appendTail(sb);
      return sb.toString();
    }
  }

  public static class AreaFromPath extends ResourceFromPath {
    @Override
    public Pattern getPattern() {
      return Pattern.compile("\\/([\\w-]+)\\/?");
    }

    @Override
    public String handleMatcher(String format, Matcher resourceMatcher) {
      String resourceHyphen = resourceMatcher.group(1);
      return hyphenToCamel(resourceHyphen);
    }
  }

    /**
     * Remove empty lines for the fragment
     */
    public static class RemoveEmptyLines extends CustomLambda {

        public RemoveEmptyLines() {
        }

        @Override public String formatFragment(String fragment) {
            String filteredFragment =  Pattern.compile("^(?:[\\t ]*(?:\\r?\\n|\\r))+", Pattern.MULTILINE).matcher(fragment).replaceAll("");
            return filteredFragment;
        }
    }

    /**
     * Remove unused imports to match the linter We are not able to get this information from the model itself, it's a
     * bit sad but the solution is to postprocess the fragment with a regexp
     */
    public static class RemoveUnusedImports extends CustomLambda {

        public RemoveUnusedImports() {
        }

        @Override public String formatFragment(String fragment) {
            //Retrieve all the imported classes
            List<String> allMatches = new ArrayList<String>();
            Matcher importLinesMatcher = Pattern.compile("import\\s+(?:type\\s+)?\\{(.*)}.*;").matcher(fragment);
            while (importLinesMatcher.find()) {
              Matcher importsMatcher = Pattern.compile("((?:type\\s+)?\\w+)").matcher(importLinesMatcher.group(1));
              while (importsMatcher.find()) {
                allMatches.add(importsMatcher.group(1));
              }
            }
            //For each class check if the import is used
            ListIterator<String> litr = allMatches.listIterator();
            while (litr.hasNext()) {
                String importedClass = litr.next();
                Matcher importTypeMatcher = Pattern.compile("(type\\s+)").matcher(importedClass);
                if (importTypeMatcher.find()) {
                  importedClass = importTypeMatcher.replaceAll("");
                }
                int count =0;
                //Looking if the import is used in the fragment
                Matcher m2 = Pattern.compile(
                  "^(?!(\\s*import\\s+(?:type\\s+)?\\{)|(\\s*\\*)|(/\\*))(?:.*[^\\w'\"])?"+ importedClass + "[^\\w\\/]",
                  Pattern.MULTILINE
                ).matcher(fragment);
                if (!m2.find()) {
                    //Import unused found, removing it
                    fragment = Pattern.compile("(.*import\\s+(?:type\\s+)?\\{(?:.*\\W)?)(?:type\\s+)?" + importedClass +"\\s*,?\\s*(\\W.*)")
                      .matcher(fragment)
                      .replaceAll("$1$2");
                }
            }
          //If an import is empty, remove it
          return Pattern.compile("import\\s+(?:type\\s+)?\\{(\\s,?)*}\\s+from\\s+.*;\n").matcher(fragment).replaceAll("");
        }
    }

    /**
     * Add quotes on property if needed
     */
    public static class PropertyDeclaration extends CustomLambda {

        public PropertyDeclaration() {
        }

        @Override
        public String formatFragment(String fragment) {
            return fragment.matches(VALID_PROPERTY_REGEXP) ? fragment : ("'" + fragment + "'");
        }
    }

    /**
     * Add brackets + quotes or dot on property access
     * Example:
     * - data['weird-segment']
     * - data.normalSegment
     */
    public static class PropertyAccess extends CustomLambda {

        public PropertyAccess() {
        }

        @Override
        public String formatFragment(String fragment) {
            return fragment.matches(VALID_PROPERTY_REGEXP) ? ("." + fragment) : ("['" + fragment + "']");
        }
    }

    /**
     * Select the correct mime type to use (for either Content-Type or Accept)
     * Take the first mime corresponding to JSON format
     * If none is found, use the first mime of the list
     */
    public static class HeaderJsonMimeType extends CustomLambda {

      public HeaderJsonMimeType() {
      }

      @Override
      public String formatFragment(String fragment) {
        if (fragment == null || fragment.equals("")) {
          return "application/json";
        }
        String[] mimeTypes = fragment.split(", ");
        if (mimeTypes.length < 1 || (mimeTypes.length == 1 && mimeTypes[0].equals(""))) {
          return "application/json";
        }
        return HeaderJsonMimeType.getFirstJsonMimeType(mimeTypes);
      }

      public static boolean isJsonMime(String mime) {
        String jsonMime = "^(application\\/json|[^;/ \\t]+\\/[^;/ \\t]+[+]json)[ \\t]*(;.*)?$";
        return mime != null && (mime.matches(jsonMime) || "application/json-patch+json".equalsIgnoreCase(mime));
      }

      public static String getFirstJsonMimeType(String[] mimeTypes) {
        for (String mime : mimeTypes) {
          if (HeaderJsonMimeType.isJsonMime(mime)) {
            return mime;
          }
        }
        return mimeTypes[0];
      }
    }
}
