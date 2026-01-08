package com.amadeus.otterextension.actions.enrich

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.openapi.vfs.VirtualFile
import com.intellij.ui.dsl.builder.*
import javax.swing.JComponent

class AddLocalizationKeyToComponentAction : AnAction() {
  
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val editor = e.getData(CommonDataKeys.EDITOR) ?: return
    val file = e.getData(CommonDataKeys.PSI_FILE) ?: return
    
    // Check if it's an HTML template file
    if (!file.name.endsWith("template.html")) {
      Messages.showErrorMessage(
        project,
        "This action can only be executed on HTML template files",
        "Add Localization Key"
      )
      return
    }
    
    // Get selected text
    val selectedText = getSelectedText(editor)
    if (selectedText.isBlank()) {
      Messages.showErrorMessage(
        project,
        "Please select some text in the template file to localize",
        "Add Localization Key"
      )
      return
    }
    
    val dialog = AddLocalizationKeyDialog(project, selectedText)
    if (dialog.showAndGet()) {
      val key = dialog.key
      val description = dialog.description
      val value = dialog.value
      
      // Get component path (replace template.html with component.ts)
      val componentPath = file.virtualFile.path.replace("template.html", "component.ts")
      
      val options = mapOf(
        "key" to key,
        "description" to description,
        "value" to value,
        "path" to componentPath,
        "update-template" to "true"
      )
      
      OtterCommandRunner.runSchematicCommand(
        project,
        "@o3r/localization:localization-key-to-component",
        "",
        options,
        "Otter Add Localization Key"
      )
    }
  }
  
  override fun update(e: AnActionEvent) {
    val file = e.getData(CommonDataKeys.PSI_FILE)
    val editor = e.getData(CommonDataKeys.EDITOR)
    e.presentation.isEnabledAndVisible = file != null && 
      file.name.endsWith("template.html") && 
      editor != null &&
      getSelectedText(editor).isNotBlank()
  }
  
  private fun getSelectedText(editor: Editor): String {
    val selectionModel = editor.selectionModel
    return if (selectionModel.hasSelection()) {
      selectionModel.selectedText ?: ""
    } else {
      ""
    }
  }
}

private class AddLocalizationKeyDialog(
  private val project: com.intellij.openapi.project.Project,
  private val selectedText: String
) : DialogWrapper(project) {
  
  var key: String = ""
  var description: String = ""
  var value: String = selectedText
  
  init {
    title = "Add Localization Key to Component"
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row {
        label("Selected Text:")
        comment(selectedText.take(50) + if (selectedText.length > 50) "..." else "")
      }
      
      row("Key Name:") {
        textField()
          .bindText(::key)
          .focused()
          .comment("Name for the localization key")
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Key name is required", textField)
            else null
          }
      }
      
      row("Description:") {
        textField()
          .bindText(::description)
          .comment("Description of the localization")
      }
      
      row("Value:") {
        textArea()
          .bindText(::value)
          .comment("The localized text value")
          .validationOnInput { textArea ->
            if (textArea.text.isBlank()) ValidationInfo("Value is required", textArea)
            else null
          }
      }
    }
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      key.isBlank() -> ValidationInfo("Key name is required")
      value.isBlank() -> ValidationInfo("Value is required")
      else -> null
    }
  }
}