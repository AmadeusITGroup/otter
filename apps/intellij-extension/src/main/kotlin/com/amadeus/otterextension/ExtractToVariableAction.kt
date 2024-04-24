package com.amadeus.otterextension

import com.amadeus.otterextension.ExtractStylingUtils.generateScssVariableName
import com.amadeus.otterextension.ExtractStylingUtils.getWholeLineSelection
import com.amadeus.otterextension.ExtractStylingUtils.replaceScssSelectionByVariable
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.InputValidator
import com.intellij.openapi.ui.Messages

class ExtractToVariableAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    // Get the current editor and document
    val editor = e.getData(CommonDataKeys.EDITOR)
    val project = e.getData(CommonDataKeys.PROJECT)

    if (editor != null && project != null) {
      // Get the line text
      val document = editor.document
      var lineRange = getWholeLineSelection(editor)

      val (name, value) = generateScssVariableName(lineRange, editor)
      // Show an input dialog to get the variable name from the user, prefilled with the generated scss variable name
      val variableName = Messages.showInputDialog(
        project,
        "Do you want to change the variable name?",
        "Extract to variable",
        Messages.getQuestionIcon(),
        name,
        object : InputValidator {
          override fun checkInput(inputString: String): Boolean {
            // Check if the variable name is valid (no spaces)
            return inputString.matches(Regex("""^[\w-]+$"""))
          }

          override fun canClose(inputString: String): Boolean {
            // Allow closing the dialog if the input is valid
            return checkInput(inputString)
          }
        }
      )

      if (variableName != null) {
        replaceScssSelectionByVariable(variableName, value, lineRange, document)
      }
    }
  }
}
