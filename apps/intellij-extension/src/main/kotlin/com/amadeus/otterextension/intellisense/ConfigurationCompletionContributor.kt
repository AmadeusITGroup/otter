package com.amadeus.otterextension.intellisense

import com.intellij.codeInsight.completion.*
import com.intellij.codeInsight.lookup.LookupElementBuilder
import com.intellij.patterns.PlatformPatterns
import com.intellij.psi.PsiComment
import com.intellij.psi.PsiElement
import com.intellij.psi.util.PsiTreeUtil
import com.intellij.util.ProcessingContext
import com.intellij.lang.javascript.psi.JSFile
import com.intellij.lang.typescript.psi.TypeScriptFile

class ConfigurationCompletionContributor : CompletionContributor() {
  
  init {
    extend(
      CompletionType.BASIC,
      PlatformPatterns.psiElement()
        .inFile(PlatformPatterns.psiFile()
          .withName(PlatformPatterns.string().contains(".ts"))),
      ConfigurationCompletionProvider()
    )
  }
}

class ConfigurationCompletionProvider : CompletionProvider<CompletionParameters>() {
  
  override fun addCompletions(
    parameters: CompletionParameters,
    context: ProcessingContext,
    resultSet: CompletionResultSet
  ) {
    val element = parameters.position
    val file = element.containingFile
    
    // Check if we're in a JSDoc comment and after @
    val comment = PsiTreeUtil.getParentOfType(element, PsiComment::class.java)
    if (comment != null && comment.text.contains("/**")) {
      val caretOffset = parameters.offset
      val commentText = comment.text
      val caretInComment = caretOffset - comment.textOffset
      
      if (caretInComment > 0 && caretInComment < commentText.length) {
        val textBeforeCaret = commentText.substring(0, caretInComment)
        
        if (textBeforeCaret.endsWith("@")) {
          addConfigurationTags(resultSet)
        } else if (textBeforeCaret.contains("@o3rWidget ")) {
          addWidgetParamTag(resultSet)
        }
      }
    }
  }
  
  private fun addConfigurationTags(resultSet: CompletionResultSet) {
    val o3rWidgetTag = LookupElementBuilder.create("@o3rWidget")
      .withPresentableText("@o3rWidget")
      .withTypeText("Widget configuration tag")
      .withInsertHandler { insertionContext, _ ->
        val editor = insertionContext.editor
        val document = editor.document
        val startOffset = insertionContext.startOffset
        val tailOffset = insertionContext.tailOffset
        
        // Insert @o3rWidget with a space for widget name
        document.replaceString(startOffset, tailOffset, "@o3rWidget ")
        editor.caretModel.moveToOffset(tailOffset + 1)
      }
    
    resultSet.addElement(o3rWidgetTag)
  }
  
  private fun addWidgetParamTag(resultSet: CompletionResultSet) {
    val o3rWidgetParamTag = LookupElementBuilder.create("@o3rWidgetParam")
      .withPresentableText("@o3rWidgetParam")
      .withTypeText("Widget parameter tag")
      .withInsertHandler { insertionContext, _ ->
        val editor = insertionContext.editor
        val document = editor.document
        val startOffset = insertionContext.startOffset
        val tailOffset = insertionContext.tailOffset
        
        // Insert @o3rWidgetParam with template
        document.replaceString(startOffset, tailOffset, "@o3rWidgetParam paramName paramValue")
        editor.caretModel.moveToOffset(startOffset + "@o3rWidgetParam ".length)
      }
    
    resultSet.addElement(o3rWidgetParamTag)
  }
}