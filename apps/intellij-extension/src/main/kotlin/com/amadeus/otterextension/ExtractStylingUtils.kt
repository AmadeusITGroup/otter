package com.amadeus.otterextension

import ExtractorConfig
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.editor.Document
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.util.TextRange
import com.intellij.psi.PsiDocumentManager
import com.intellij.psi.PsiElement
import com.intellij.psi.PsiFile
import com.intellij.psi.util.PsiTreeUtil
import org.jetbrains.kotlin.psi.KtFile
import org.jetbrains.kotlin.psi.KtPsiFactory
import org.jetbrains.kotlin.resolve.ImportPath

object ExtractStylingUtils {
  /**
   * Sanitize the selector
   *
   * @param selector to clean
   * @returns the cleaned selector
   */
  fun cleanSelector(selector: String): String {
    return selector.replace(RegExp.trimLeft, "")
      .replace(RegExp.trimRight, "")
      .replace(RegExp.sanitizer, "-")
      .replace(Regex("-+"), "-")
  }

  /**
   * Replace the selected prop/value scss to an otter variable
   * with a dedicated name based on the fileName and selectors tree
   * @param lineRange the line range from which to extract the o3r-var
   * @param editor the active editor instance
   * @returns the name and values
   */
  fun generateScssVariableName(lineRange: TextRange, editor: Editor): Pair<String, String> {
    val text = editor.document.getText(lineRange).trim()

    // Get the current line number
    val currentLine = editor.caretModel.logicalPosition.line

    // Get the end offset of the current line
    val endOffset = editor.document.getLineEndOffset(currentLine)

    // Convert the end offset to a LogicalPosition
    val endPosition = editor.offsetToLogicalPosition(endOffset)

    val lineMatches = RegExp.propValue.find(text)
      ?: throw Exception("Cannot extract o3r-var from \"$text\"")

    val prefixName = createOtterVariable(endPosition, editor)

    val name = prefixName.plus(lineMatches.groups[1]?.value?.trim())
    val value = lineMatches.groups[2]?.value?.trim()

    name.replace(Regex("-+"), "-").trim('-')


    return Pair(name, value!!)
  }

  /**
   * Replace the selection with an o3r variable.
   * @param o3rName the name of the variable.
   * @param value the value.
   * @param selection the range that defines the position of the prop to replace.
   * @param document the document to edit.
   * @param noImport whether to skip importing.
   */
  fun replaceScssSelectionByVariable(o3rName: String, value: String, selection: TextRange, document: Document, noImport: Boolean = false) {
    val o3rVar = generateO3rVar(o3rName, value)
    val selectedText = document.getText(selection)
    val updatedText = selectedText.replace(value, "\$$o3rName")
    val wholeText = document.text
    val lineToInsertVariable = retrieveCssProperLineIndexToWriteContent(wholeText) ?: 0

    val offset = document.getLineStartOffset(lineToInsertVariable)
    WriteCommandAction.runWriteCommandAction(null) {
      document.replaceString(selection.startOffset, selection.endOffset, updatedText)
      document.insertString(offset, "$o3rVar\n")
    }

    if (!noImport) {
      appendO3rImportIfNeeded(document)
    }
  }

  /**
   * Check and send back an edit function to append the import line for the `o3r-var` function
   * @param document the document to edit
   */
  private fun appendO3rImportIfNeeded(document: Document) {
    val wholeText = document.text

    if (!RegExp.o3rUse.containsMatchIn(wholeText)) {
      val importValue = "@use '@o3r/styling' as o3r;\n\n"
      WriteCommandAction.runWriteCommandAction(null) {
        document.insertString(0, importValue)
      }
    }
  }

  /**
   * Retrieves the proper line index in a CSS text where new content can be written.
   * The function scans the text for a suitable free space based on certain patterns, ignoring comments, imports, etc.
   *
   * @param wholeText The entire CSS text.
   * @return The index of the line where new content can be inserted, or null if no suitable spot is found.
   */
  private fun retrieveCssProperLineIndexToWriteContent(wholeText: String?): Int? {
    if (wholeText == null || wholeText.isEmpty()) {
      return null
    }

    val lines = wholeText.split(RegExp.newLine)

    for ((index, line) in lines.withIndex()) {
      if (RegExp.freeSpaceToWriteInCss.containsMatchIn(line)) {
        return index
      }
    }

    return null
  }

  /**
   * Returns the entire line selection in the specified editor.
   *
   * @param editor The editor in which to get the selection.
   * @return The entire line selection.
   */
  fun getWholeLineSelection(editor: Editor): TextRange {
    val caretModel = editor.caretModel
    val lineNumber = caretModel.logicalPosition.line
    val document = editor.document
    return TextRange(document.getLineStartOffset(lineNumber), document.getLineEndOffset(lineNumber))
  }

  /**
   * Go through the tree of selectors and keep only the path to the selected property
   *
   * @param css String which contains all the CSS between the beginning of the document and the
   * last character of the selected line, so without the closing curly bracket of the class containing the property.
   * @param selectors List of all selectors found with a Regex in the CSS
   * @return List of used selectors
   */
  fun keepOnlyUsedSelector(css: String, selectors: MutableList<String>): List<String> {
    if (css.isEmpty() || selectors.isEmpty()) {
      return emptyList()
    }

    var mutableCss = css
    val copySelectors = ArrayList(selectors)
    var indexOfCurrentElement = 0

    val iterator = copySelectors.listIterator()
    while (iterator.hasNext()) {
      val element = iterator.next()
      var numberOfBrackets = 0
      val selectorIndexInCssString = mutableCss.indexOf(element)

      if (selectorIndexInCssString >= 0) {
        for (i in selectorIndexInCssString until mutableCss.length) {
          when (mutableCss[i]) {
            '{' -> numberOfBrackets++
            '}' -> {
              numberOfBrackets--
              if (numberOfBrackets == 0) {
                // When it's equal to 0, it means that the selector doesn't apply to our property
                // so we have to remove it and the selectors it contains
                iterator.remove()
                indexOfCurrentElement--
                // Remove all the CSS contained in the selector not used so also the selectors contained in it
                val stringToRemove = mutableCss.substring(selectorIndexInCssString, i + 1)
                if (stringToRemove.isNotEmpty()) {
                  mutableCss = mutableCss.replace(stringToRemove, "")
                }
                break
              }
            }
          }
        }
      } else {
        iterator.remove()
        indexOfCurrentElement--
      }

      // Allows you to advance through the list of selectors or to return to the location of
      // the selector removed in the previous cycle
      indexOfCurrentElement++
    }

    return copySelectors
  }

  /**
   * Generate a proposed name for the variable based on the specified range.
   *
   * @param endPos end range to cut the not needed end part of the file
   * @param editor the active editor instance
   * @return the proposed name for the variable
   */
  fun createOtterVariable(endPos: LogicalPosition, editor: Editor): String {
    val startFilePos = LogicalPosition(0, 0)
    // Replace the next line with code that retrieves the text between startFilePos and endPos from IntelliJ's API
    val docText = editor.document.getText(TextRange(editor.logicalPositionToOffset(startFilePos), editor.logicalPositionToOffset(endPos)))

    val onlyCss = RegExp.css.find(docText)?.value
    val css = onlyCss ?: throw Exception("Could not found any scss in the active editor")

    val allSelectors = RegExp.allSelectors.findAll(css).map { it.value }.toMutableList()
    if (allSelectors.isEmpty()) {
      throw Exception("Could not found any scss selectors in the active editor")
    }

    val usedSelectors = keepOnlyUsedSelector(css, allSelectors)
    val cleanedSelectors = usedSelectors.map { cleanSelector(it) }

    val parsedName = generateO3rVarName(cleanedSelectors)

    return parsedName.lowercase()
  }

  /**
   * Generate the proposed variable name based on the path of selectors.
   * Also ensures to not include any duplicated selectors or any forbidden words from the configuration.
   *
   * @param selectors Used to generate the name.
   * @return The final proposed name.
   */
  fun generateO3rVarName(selectors: List<String>): String {
    var name = StringBuilder()
    val wordsSet = mutableSetOf<String>()

    val settings = ExtractorConfig.instance.state

    wordsSet.addAll(settings.forbiddenWords)
    wordsSet.add("")

    val prefixToAdd = settings.prefix
    val newSelectors = mutableListOf<String>().apply {
      if (prefixToAdd.isNotEmpty()) {
        add(prefixToAdd)
      }
      addAll(selectors)
    }

    newSelectors.forEach { element ->
      val elementWords = element.split(Regex("[-_]"))
      val distinctSelector = elementWords.filterNot { wordsSet.contains(it) }.joinToString("-")
      wordsSet.addAll(elementWords)
      if (distinctSelector.isNotEmpty()) {
        name.append(distinctSelector).append("-")
      }
    }

    return name.toString()
  }

  /**
   * Generate the o3r variable definition
   * @param name the name of the variable
   * @param value the initial value of the variable
   * @returns the generated variable definition
   */
  fun generateO3rVar(name: String, value: String): String {
    return "\$$name: o3r.variable('$name', $value);\n";
  }
}
