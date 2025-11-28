package com.amadeus.otterextension.intellisense

import com.intellij.codeInsight.completion.*
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.patterns.PlatformPatterns
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiTreeUtil
import com.intellij.util.ProcessingContext
import org.jetbrains.plugins.scss.psi.SCSSFile

class StylingCompletionContributor : CompletionContributor() {
  
  init {
    extend(
      CompletionType.BASIC,
      PlatformPatterns.psiElement()
        .inFile(PlatformPatterns.psiFile(SCSSFile::class.java)),
      StylingCompletionProvider()
    )
  }
}

class StylingCompletionProvider : CompletionProvider<CompletionParameters>() {
  
  override fun addCompletions(
    parameters: CompletionParameters,
    context: ProcessingContext,
    resultSet: CompletionResultSet
  ) {
    val element = parameters.position
    val file = element.containingFile
    
    // Check if the file contains @use '@o3r/styling'
    val fileText = file.text
    val stylingImportRegex = Regex("""@use\s+['"]@o3r/styling['"](\s+as\s+(\w+))?;""")
    val match = stylingImportRegex.find(fileText)
    
    if (match != null) {
      val libName = match.groupValues[2].ifEmpty { "styling" }
      
      // Check if we're typing after a $ character
      val elementText = element.text
      if (elementText.contains("$") || isAfterDollarSign(element)) {
        val lookupElement = LookupElementBuilder.create("\$o3rVariable")
          .withPresentableText("\$o3rVariable")
          .withTypeText("o3r styling variable")
          .withInsertHandler { insertionContext, _ ->
            val editor = insertionContext.editor
            val document = editor.document
            val startOffset = insertionContext.startOffset
            val tailOffset = insertionContext.tailOffset
            
            // Replace with the o3r variable template
            val template = "\$var-name: $libName.var('var-name', var-value);"
            document.replaceString(startOffset, tailOffset, template)
            
            // Position cursor at var-name
            editor.caretModel.moveToOffset(startOffset + 1)
          }
          .withBoldness(true)
        
        resultSet.addElement(lookupElement)
      }
    }
  }
  
  private fun isAfterDollarSign(element: PsiElement): Boolean {
    val offset = element.textOffset
    val file = element.containingFile
    val fileText = file.text
    
    return offset > 0 && fileText.getOrNull(offset - 1) == '$'
  }
}