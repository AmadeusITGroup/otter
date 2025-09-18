package com.amadeus.otterextension.actions.enrich

import com.amadeus.otterextension.utils.OtterCommandRunner
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.vfs.VirtualFile

/**
 * Base class for component enrichment actions
 */
abstract class BaseComponentEnrichmentAction(
  private val schematic: String,
  private val terminalTitle: String
) : AnAction() {
  
  override fun actionPerformed(e: AnActionEvent) {
    val project = e.getData(CommonDataKeys.PROJECT) ?: return
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE) ?: return
    
    if (!isComponentFile(virtualFile)) {
      return
    }
    
    val componentPath = getComponentPath(virtualFile)
    
    OtterCommandRunner.runSchematicCommand(
      project,
      schematic,
      "",
      mapOf("path" to componentPath),
      terminalTitle
    )
  }
  
  override fun update(e: AnActionEvent) {
    val virtualFile = e.getData(CommonDataKeys.VIRTUAL_FILE)
    e.presentation.isEnabledAndVisible = virtualFile != null && isComponentFile(virtualFile)
  }
  
  private fun isComponentFile(file: VirtualFile): Boolean {
    return file.name.endsWith(".component.ts") || 
           file.name.endsWith(".component.html") ||
           file.name.endsWith(".component.scss") ||
           file.name.endsWith(".component.css")
  }
  
  private fun getComponentPath(file: VirtualFile): String {
    return file.parent?.path ?: ""
  }
}

class AddAnalyticsToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/analytics:add-analytics",
  "Otter Add Analytics"
)

class AddConfigurationToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/configuration:add-config",
  "Otter Add Configuration"
)

class AddContextToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/context:add-context",
  "Otter Add Context"
)

class AddFixtureToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/testing:add-fixture",
  "Otter Add Fixture"
)

class AddIframeToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/iframe:add-iframe",
  "Otter Add Iframe"
)

class AddLocalizationToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/localization:add-localization",
  "Otter Add Localization"
)

class AddRulesEngineToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/rules-engine:add-rules-engine",
  "Otter Add Rules Engine"
)

class AddThemingToComponentAction : BaseComponentEnrichmentAction(
  "@o3r/styling:add-theming",
  "Otter Add Theming"
)

class ConvertComponentAction : BaseComponentEnrichmentAction(
  "@o3r/core:convert-component",
  "Otter Convert Component"
)