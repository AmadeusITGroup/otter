package com.amadeus.otterextension.actions.generate

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.ui.dsl.builder.*
import javax.swing.JComponent

class GenerateServiceAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE)
    
    val dialog = GenerateServiceDialog(project, virtualFile?.path)
    if (dialog.showAndGet()) {
      val serviceName = dialog.serviceName
      val servicePath = dialog.servicePath
      val featureName = dialog.featureName
      
      OtterCommandRunner.runSchematicCommand(
        project,
        "@o3r/core:service",
        serviceName,
        mapOf(
          "path" to servicePath,
          "feature-name" to featureName
        ),
        "Otter Service Generator"
      )
    }
  }
}

private class GenerateServiceDialog(
  private val project: com.intellij.openapi.project.Project,
  private val defaultPath: String?
) : DialogWrapper(project) {
  
  var serviceName: String = ""
  var servicePath: String = ""
  var featureName: String = "base"
  
  init {
    title = "Generate Otter Service"
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row("Service Name:") {
        textField()
          .bindText(::serviceName)
          .focused()
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Service name is required", textField)
            else null
          }
      }
      
      row("Path:") {
        textField()
          .bindText(::servicePath)
          .comment("Path where the service will be generated")
          .apply {
            servicePath = defaultPath ?: ""
          }
      }
      
      row("Feature Name:") {
        textField()
          .bindText(::featureName)
          .comment("Name of the service feature")
      }
    }
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      serviceName.isBlank() -> ValidationInfo("Service name is required")
      else -> null
    }
  }
}