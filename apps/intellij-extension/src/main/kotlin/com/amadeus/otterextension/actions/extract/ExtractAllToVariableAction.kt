package com.amadeus.otterextension.actions.extract

import com.amadeus.otterextension.ExtractStylingUtils.generateScssVariableName
import com.amadeus.otterextension.ExtractStylingUtils.getWholeLineSelection
import com.amadeus.otterextension.ExtractStylingUtils.replaceScssSelectionByVariable
import com.amadeus.otterextension.ExtractorConfig
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages

class ExtractAllToVariableAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val editor = e.getData(CommonDataKeys.EDITOR)
    val project = e.getData(CommonDataKeys.PROJECT)
    
    if (editor != null && project != null) {
      extractAllStylingVariables(editor, project)
    }
  }
  
  private fun extractAllStylingVariables(editor: Editor, project: Project) {
    val document = editor.document
    val text = document.text
    val lines = text.split("\n")
    
    // Find all lines that contain CSS properties (property: value;)
    val cssPropertyRegex = Regex("""^\s*([a-zA-Z-]+)\s*:\s*([^;]+);""")
    val linesToProcess = mutableListOf<Pair<Int, String>>()
    
    lines.forEachIndexed { index, line ->
      if (cssPropertyRegex.matches(line.trim())) {
        linesToProcess.add(index to line)
      }
    }
    
    if (linesToProcess.isEmpty()) {
      Messages.showInfoMessage(
        project,
        "No CSS properties found to extract",
        "Extract All Variables"
      )
      return
    }
    
    val config = ExtractorConfig.getInstance()
    val forbiddenWords = config.forbiddenWords.split(",").map { it.trim() }
    
    WriteCommandAction.runWriteCommandAction(project) {
      val variablesExtracted = mutableListOf<String>()
      
      // Process lines in reverse order to maintain line numbers
      linesToProcess.reversed().forEach { (lineIndex, line) ->
        val match = cssPropertyRegex.find(line.trim())
        if (match != null) {
          val property = match.groupValues[1]
          val value = match.groupValues[2]
          
          // Skip if property or value contains forbidden words
          val shouldSkip = forbiddenWords.any { forbidden ->
            property.contains(forbidden, ignoreCase = true) || 
            value.contains(forbidden, ignoreCase = true)
          }
          
          if (!shouldSkip) {
            val variableName = generateVariableName(property, value, config.prefix)
            
            // Replace the line
            val startOffset = document.getLineStartOffset(lineIndex)
            val endOffset = document.getLineEndOffset(lineIndex)
            val indent = line.takeWhile { it.isWhitespace() }
            val newLine = "$indent$property: \$${variableName};"
            
            document.replaceString(startOffset, endOffset, newLine)
            variablesExtracted.add("$${variableName}: $value")
          }
        }
      }
      
      if (variablesExtracted.isNotEmpty()) {
        // Add variables at the top of the file
        val variablesBlock = variablesExtracted.reversed().joinToString("\n") + "\n\n"
        document.insertString(0, variablesBlock)
        
        Messages.showInfoMessage(
          project,
          "Extracted ${variablesExtracted.size} variables",
          "Extract All Variables Complete"
        )
      } else {
        Messages.showInfoMessage(
          project,
          "No variables extracted (all contained forbidden words)",
          "Extract All Variables"
        )
      }
    }
  }
  
  private fun generateVariableName(property: String, value: String, prefix: String): String {
    // Simple variable name generation logic
    val cleanProperty = property.replace("-", "")
    val cleanValue = value.replace(Regex("""[^a-zA-Z0-9]"""), "")
      .take(10) // Limit length
    
    return if (prefix.isNotEmpty()) {
      "${prefix}-${cleanProperty}-${cleanValue}".lowercase()
    } else {
      "${cleanProperty}-${cleanValue}".lowercase()
    }
  }
}