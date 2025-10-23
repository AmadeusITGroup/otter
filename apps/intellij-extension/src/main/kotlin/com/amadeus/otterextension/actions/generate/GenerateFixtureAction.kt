package com.amadeus.otterextension.actions.generate

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.ui.ValidationInfo
import com.intellij.openapi.util.TextRange
import com.intellij.ui.components.JBCheckBox
import com.intellij.ui.dsl.builder.*
import javax.swing.JComponent

class GenerateFixtureAction : AnAction() {
  
  private val availableMethods = listOf(
    "clickOnButton",
    "getText", 
    "getInputValue",
    "setInputValue",
    "getTextInList",
    "clickButtonInList",
    "getNumberOfItems"
  )
  
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val editor = e.getData(CommonDataKeys.EDITOR) ?: return
    val file = e.getData(CommonDataKeys.PSI_FILE) ?: return
    
    // Check if it's an HTML template file
    if (!file.name.endsWith("template.html")) {
      Messages.showErrorMessage(
        project,
        "This action can only be executed on HTML template files",
        "Generate Fixture"
      )
      return
    }
    
    // Get selected text
    val selectedText = getSelectedText(editor)
    if (selectedText.isBlank()) {
      Messages.showErrorMessage(
        project,
        "Please select some text in the template file",
        "Generate Fixture"
      )
      return
    }
    
    val dialog = GenerateFixtureDialog(project, selectedText)
    if (dialog.showAndGet()) {
      val selectedMethods = dialog.selectedMethods
      val selector = dialog.selector
      
      if (selectedMethods.isNotEmpty()) {
        // Get fixture file path (replace template.html with fixture.ts)
        val fixturePath = file.virtualFile.path.replace("template.html", "fixture.ts")
        
        val options = mutableMapOf<String, String>()
        options["path"] = fixturePath
        options["selector"] = selector
        
        // Add each selected method
        selectedMethods.forEach { method ->
          val currentMethods = options["methods"] ?: ""
          options["methods"] = if (currentMethods.isEmpty()) method else "$currentMethods,$method"
        }
        
        OtterCommandRunner.runSchematicCommand(
          project,
          "@o3r/testing:add-functions-to-fixture",
          "",
          options,
          "Otter Fixture Generator"
        )
      }
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

private class GenerateFixtureDialog(
  private val project: com.intellij.openapi.project.Project,
  private val selectedText: String
) : DialogWrapper(project) {
  
  var selectedMethods: List<String> = emptyList()
  var selector: String = ""
  
  private val availableMethods = listOf(
    "clickOnButton",
    "getText", 
    "getInputValue",
    "setInputValue",
    "getTextInList",
    "clickButtonInList",
    "getNumberOfItems"
  )
  
  private val methodCheckboxes = mutableMapOf<String, JBCheckBox>()
  
  init {
    title = "Generate Fixture Functions"
    // Extract selector from selected text (look for class attribute)
    selector = extractSelector(selectedText)
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row {
        label("Selected Text:")
        comment(selectedText.take(50) + if (selectedText.length > 50) "..." else "")
      }
      
      row("Selector:") {
        textField()
          .bindText(::selector)
          .comment("CSS selector for the fixture functions")
      }
      
      group("Select Fixture Methods:") {
        availableMethods.forEach { method ->
          row {
            val checkbox = checkBox(method)
              .component
            methodCheckboxes[method] = checkbox
          }
        }
      }
    }
  }
  
  override fun doOKAction() {
    selectedMethods = methodCheckboxes.filter { it.value.isSelected }.keys.toList()
    super.doOKAction()
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      selector.isBlank() -> ValidationInfo("Selector is required")
      selectedMethods.isEmpty() -> ValidationInfo("At least one method must be selected")
      else -> null
    }
  }
  
  private fun extractSelector(text: String): String {
    // Look for class="..." in the selected text
    val classMatch = Regex("""class="([^"]+)"""").find(text)
    return if (classMatch != null) {
      val classes = classMatch.groupValues[1]
      "." + classes.replace(" ", ".")
    } else {
      text.trim()
    }
  }
}