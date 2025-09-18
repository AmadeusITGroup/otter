package com.amadeus.otterextension.actions.generate

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.ComboBox
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.ui.dsl.builder.*
import javax.swing.JComponent

class GenerateComponentAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE)
    
    val dialog = GenerateComponentDialog(project, virtualFile?.path)
    if (dialog.showAndGet()) {
      val componentName = dialog.componentName
      val componentPath = dialog.componentPath
      val componentStructure = dialog.componentStructure
      val description = dialog.description
      
      OtterCommandRunner.runSchematicCommand(
        project,
        "@o3r/core:component",
        componentName,
        mapOf(
          "path" to componentPath,
          "component-structure" to componentStructure,
          "description" to description
        ),
        "Otter Component Generator"
      )
    }
  }
}

private class GenerateComponentDialog(
  private val project: com.intellij.openapi.project.Project,
  private val defaultPath: String?
) : DialogWrapper(project) {
  
  var componentName: String = ""
  var componentPath: String = ""
  var componentStructure: String = "full"
  var description: String = ""
  
  init {
    title = "Generate Otter Component"
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row("Component Name:") {
        textField()
          .bindText(::componentName)
          .focused()
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Component name is required", textField)
            else null
          }
      }
      
      row("Path:") {
        textField()
          .bindText(::componentPath)
          .comment("Path where the component will be generated")
          .apply {
            componentPath = defaultPath ?: ""
          }
      }
      
      row("Component Structure:") {
        val comboBox = ComboBox(arrayOf("full", "container", "presenter"))
        comboBox.selectedItem = componentStructure
        cell(comboBox)
          .bind(ComboBox<String>::getSelectedItem, ComboBox<String>::setSelectedItem, ::componentStructure.toMutableProperty())
      }
      
      row("Description:") {
        textField()
          .bindText(::description)
          .comment("Optional description for the component")
      }
    }
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      componentName.isBlank() -> ValidationInfo("Component name is required")
      else -> null
    }
  }
}