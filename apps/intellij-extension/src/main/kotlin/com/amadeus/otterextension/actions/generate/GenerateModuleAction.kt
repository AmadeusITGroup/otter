package com.amadeus.otterextension.actions.generate

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.ui.dsl.builder.*
import javax.swing.JComponent

class GenerateModuleAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE)
    
    val dialog = GenerateModuleDialog(project, virtualFile?.path)
    if (dialog.showAndGet()) {
      val moduleName = dialog.moduleName
      val modulePath = dialog.modulePath
      val description = dialog.description
      
      OtterCommandRunner.runSchematicCommand(
        project,
        "@o3r/core:module",
        moduleName,
        mapOf(
          "path" to modulePath,
          "description" to description
        ),
        "Otter Module Generator"
      )
    }
  }
}

private class GenerateModuleDialog(
  private val project: com.intellij.openapi.project.Project,
  private val defaultPath: String?
) : DialogWrapper(project) {
  
  var moduleName: String = ""
  var modulePath: String = ""
  var description: String = ""
  
  init {
    title = "Generate Otter Module"
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row("Module Name:") {
        textField()
          .bindText(::moduleName)
          .focused()
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Module name is required", textField)
            else null
          }
      }
      
      row("Path:") {
        textField()
          .bindText(::modulePath)
          .comment("Path where the module will be generated")
          .apply {
            modulePath = defaultPath ?: ""
          }
      }
      
      row("Description:") {
        textField()
          .bindText(::description)
          .comment("Optional description for the module")
      }
    }
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      moduleName.isBlank() -> ValidationInfo("Module name is required")
      else -> null
    }
  }
}