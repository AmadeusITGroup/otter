package com.amadeus.swagger.codegen.javaresteasyclient;

public class FilePostProcessConfig {

  private String filePattern;

  private String targetFolder;

  private boolean forceReplace;

  public FilePostProcessConfig(String filePattern, String targetFolder, boolean forceReplace) {
    this.filePattern = filePattern;
    this.targetFolder = targetFolder;
    this.forceReplace = forceReplace;
  }

  public String getFilePattern() {
    return filePattern;
  }

  public String getTargetFolder() {
    return targetFolder;
  }

  public boolean isForceReplace() {
    return forceReplace;
  }

}
