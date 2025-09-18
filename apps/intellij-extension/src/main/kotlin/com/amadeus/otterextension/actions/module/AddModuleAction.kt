package com.amadeus.otterextension.actions.module

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.ui.DialogWrapper
import com.intellij.openapi.ui.Messages
import com.intellij.ui.components.JBList
import com.intellij.ui.dsl.builder.*
import java.awt.Dimension
import javax.swing.DefaultListModel
import javax.swing.JComponent
import javax.swing.ListSelectionModel

data class OtterModule(
  val name: String,
  val description: String
)

class AddModuleAction : AnAction() {
  
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    
    val dialog = AddModuleDialog(project)
    if (dialog.showAndGet()) {
      val selectedModules = dialog.selectedModules
      
      if (selectedModules.isNotEmpty()) {
        selectedModules.forEach { module ->
          OtterCommandRunner.runAddModuleCommand(
            project,
            module.name,
            "Add module ${module.name}"
          )
        }
      }
    }
  }
}

private class AddModuleDialog(
  private val project: com.intellij.openapi.project.Project
) : DialogWrapper(project) {
  
  var selectedModules: List<OtterModule> = emptyList()
  private val listModel = DefaultListModel<OtterModule>()
  private lateinit var moduleList: JBList<OtterModule>
  
  // Common Otter modules that can be added
  private val commonOtterModules = listOf(
    OtterModule("@o3r/analytics", "Analytics module for tracking user interactions"),
    OtterModule("@o3r/apis-manager", "APIs management module for handling API configurations"),
    OtterModule("@o3r/application", "Application module with core application features"),
    OtterModule("@o3r/components", "Component library with reusable UI components"),
    OtterModule("@o3r/configuration", "Configuration module for dynamic configuration"),
    OtterModule("@o3r/context", "Context module for managing application context"),
    OtterModule("@o3r/design", "Design system module with design tokens"),
    OtterModule("@o3r/dynamic-content", "Dynamic content module for runtime content"),
    OtterModule("@o3r/eslint-config", "ESLint configuration for Otter projects"),
    OtterModule("@o3r/eslint-plugin", "ESLint plugin with Otter-specific rules"),
    OtterModule("@o3r/iframe", "IFrame module for embedding external content"),
    OtterModule("@o3r/localization", "Localization module for multi-language support"),
    OtterModule("@o3r/logger", "Logging module for application logging"),
    OtterModule("@o3r/rules-engine", "Rules engine module for business logic"),
    OtterModule("@o3r/stylelint-plugin", "Stylelint plugin with Otter-specific rules"),
    OtterModule("@o3r/styling", "Styling module with theming capabilities"),
    OtterModule("@o3r/testing", "Testing utilities and fixtures"),
    OtterModule("@o3r/workspace", "Workspace tools and schematics")
  )
  
  init {
    title = "Add Otter Modules"
    init()
    loadAvailableModules()
  }
  
  override fun createCenterPanel(): JComponent {
    moduleList = JBList(listModel).apply {
      selectionMode = ListSelectionModel.MULTIPLE_INTERVAL_SELECTION
      cellRenderer = ModuleListCellRenderer()
    }
    
    return panel {
      row {
        label("Select Otter modules to add to your project:")
      }
      
      row {
        scrollCell(moduleList)
          .resizableColumn()
          .comment("These modules will be added using 'ng add' command")
      }.resizableRow()
    }.apply {
      preferredSize = Dimension(600, 400)
    }
  }
  
  override fun doOKAction() {
    selectedModules = moduleList.selectedValuesList
    
    if (selectedModules.isEmpty()) {
      Messages.showWarningDialog(
        project,
        "Please select at least one module to add",
        "Add Modules"
      )
      return
    }
    
    super.doOKAction()
  }
  
  private fun loadAvailableModules() {
    listModel.clear()
    commonOtterModules.forEach { module ->
      listModel.addElement(module)
    }
  }
}

private class ModuleListCellRenderer : javax.swing.DefaultListCellRenderer() {
  override fun getListCellRendererComponent(
    list: javax.swing.JList<*>?,
    value: Any?,
    index: Int,
    isSelected: Boolean,
    cellHasFocus: Boolean
  ): java.awt.Component {
    val component = super.getListCellRendererComponent(list, value, index, isSelected, cellHasFocus)
    
    if (value is OtterModule) {
      text = "<html><b>${value.name}</b><br/><small>${value.description}</small></html>"
    }
    
    return component
  }
}