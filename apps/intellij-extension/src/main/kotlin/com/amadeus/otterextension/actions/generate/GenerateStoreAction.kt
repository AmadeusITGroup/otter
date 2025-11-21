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

class GenerateStoreAction : AnAction() {
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE)
    
    val dialog = GenerateStoreDialog(project, virtualFile?.path)
    if (dialog.showAndGet()) {
      val storeName = dialog.storeName
      val storePath = dialog.storePath
      val storeType = dialog.storeType
      val modelName = dialog.modelName
      val modelIdPropName = dialog.modelIdPropName
      
      OtterCommandRunner.runSchematicCommand(
        project,
        "@o3r/core:store",
        storeType,
        mapOf(
          "path" to storePath,
          "store-type" to storeType,
          "store-name" to storeName,
          "model-name" to modelName,
          "model-id-prop-name" to modelIdPropName
        ),
        "Otter Store Generator"
      )
    }
  }
}

private class GenerateStoreDialog(
  private val project: com.intellij.openapi.project.Project,
  private val defaultPath: String?
) : DialogWrapper(project) {
  
  var storeName: String = ""
  var storePath: String = ""
  var storeType: String = "entity-async"
  var modelName: String = ""
  var modelIdPropName: String = "id"
  
  init {
    title = "Generate Otter Store"
    init()
  }
  
  override fun createCenterPanel(): JComponent {
    return panel {
      row("Store Type:") {
        val comboBox = ComboBox(arrayOf("entity-async", "simple-async", "entity-sync", "simple-sync"))
        comboBox.selectedItem = storeType
        cell(comboBox)
          .bind(ComboBox<String>::getSelectedItem, ComboBox<String>::setSelectedItem, ::storeType.toMutableProperty())
          .comment("Entity stores contain collections, simple stores contain single items. Async stores handle API interactions.")
      }
      
      row("Store Name:") {
        textField()
          .bindText(::storeName)
          .focused()
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Store name is required", textField)
            else null
          }
      }
      
      row("Model Name:") {
        textField()
          .bindText(::modelName)
          .comment("The SDK Model to use as store item (e.g. AirOffer)")
          .validationOnInput { textField ->
            if (textField.text.isBlank()) ValidationInfo("Model name is required", textField)
            else null
          }
      }
      
      row("Model ID Property:") {
        textField()
          .bindText(::modelIdPropName)
          .comment("The property name that identifies the model")
      }
      
      row("Path:") {
        textField()
          .bindText(::storePath)
          .comment("Path where the store will be generated")
          .apply {
            storePath = defaultPath ?: ""
          }
      }
    }
  }
  
  override fun doValidate(): ValidationInfo? {
    return when {
      storeName.isBlank() -> ValidationInfo("Store name is required")
      modelName.isBlank() -> ValidationInfo("Model name is required")
      else -> null
    }
  }
}