package com.amadeus.otterextension.utils

import com.intellij.execution.ExecutionManager
import com.intellij.execution.executors.DefaultRunExecutor
import com.intellij.execution.process.ProcessEvent
import com.intellij.execution.process.ProcessListener
import com.intellij.execution.runners.ExecutionEnvironment
import com.intellij.execution.runners.ExecutionEnvironmentBuilder
import com.intellij.execution.ui.ConsoleViewContentType
import com.intellij.execution.util.ExecutionErrorDialog
import com.intellij.javascript.nodejs.npm.NpmUtil
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Key
import com.intellij.openapi.vfs.VirtualFileManager
import com.intellij.terminal.TerminalView
import java.io.File

object OtterCommandRunner {
  
  /**
   * Run an Otter schematic command using Angular CLI
   */
  fun runSchematicCommand(
    project: Project,
    schematic: String,
    name: String,
    options: Map<String, String>,
    terminalTitle: String = "Otter Generator"
  ) {
    val optionsStr = options.entries.joinToString(" ") { (key, value) -> 
      if (value.isNotEmpty()) "--$key=\"$value\"" else ""
    }.trim()
    
    val command = buildString {
      append(getPackageRunner(project))
      append(" ng generate ")
      append(schematic)
      append(" ")
      append(optionsStr)
      if (name.isNotEmpty()) {
        append(" \"")
        append(name)
        append("\"")
      }
    }
    
    runCommandInTerminal(project, command, terminalTitle)
  }
  
  /**
   * Run an ng add command for adding modules
   */
  fun runAddModuleCommand(
    project: Project,
    moduleName: String,
    terminalTitle: String = "Add Otter Module"
  ) {
    val command = "${getPackageRunner(project)} ng add $moduleName --defaults"
    runCommandInTerminal(project, command, terminalTitle)
  }
  
  /**
   * Get the appropriate package runner (npm, yarn, or npx)
   */
  private fun getPackageRunner(project: Project): String {
    val projectDir = File(project.basePath ?: return "npx")
    
    return when {
      File(projectDir, "yarn.lock").exists() -> "yarn"
      File(projectDir, "package-lock.json").exists() -> "npm run"
      else -> "npx"
    }
  }
  
  /**
   * Run a command in the terminal
   */
  private fun runCommandInTerminal(project: Project, command: String, title: String) {
    val terminalView = TerminalView.getInstance(project)
    val terminalWidget = terminalView.createLocalShellWidget(project.basePath ?: "", title)
    
    // Show the terminal
    val toolWindow = terminalView.toolWindow
    toolWindow.show()
    
    // Execute the command
    terminalWidget.executeCommand(command)
  }
}