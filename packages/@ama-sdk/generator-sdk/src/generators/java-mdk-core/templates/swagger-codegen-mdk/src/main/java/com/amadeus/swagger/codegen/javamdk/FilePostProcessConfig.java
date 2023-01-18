package com.amadeus.swagger.codegen.javamdk;

public class FilePostProcessConfig {

  private String filePattern;

  private String targetFolder;

  private boolean forceReplace;

  private boolean toDelete;

  public FilePostProcessConfig(String filePattern, String targetFolder, boolean forceReplace, boolean toDelete) {
    this.filePattern = filePattern;
    this.targetFolder = targetFolder;
    this.forceReplace = forceReplace;
    this.toDelete = toDelete;
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

  public boolean isToDelete() {
    return toDelete;
  }
}
