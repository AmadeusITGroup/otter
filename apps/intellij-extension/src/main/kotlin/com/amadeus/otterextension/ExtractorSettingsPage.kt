package com.amadeus.otterextension

import ExtractorConfig
import com.intellij.openapi.options.Configurable
import org.jdesktop.swingx.painter.AbstractLayoutPainter.HorizontalAlignment
import org.jetbrains.annotations.Nls
import java.awt.Component
import java.awt.Dimension
import java.awt.FlowLayout
import javax.swing.*

class ExtractorSettingsPage : Configurable {
  private val settings = ExtractorSettings()
  private var isModified = false
  private val prefixField = JTextField()
  private val forbiddenWordsField = JTextField()

  override fun isModified(): Boolean {
    // Compare the prefixField and forbiddenWordsField with the settings
    val modified = prefixField.text != settings.prefix || forbiddenWordsField.text != settings.forbiddenWords.joinToString(",")
    isModified = modified
    return modified
  }

  override fun getDisplayName(): @Nls(capitalization = Nls.Capitalization.Title) String {
    return "Extractor Settings"
  }

  override fun apply() {
    val newForbiddenWords = forbiddenWordsField.text.split(",").map { it.trim() }
    val settingsNewState = ExtractorConfig.instance.state.copy(prefixField.text, newForbiddenWords)
    ExtractorConfig.instance.loadState(settingsNewState)
  }

  override fun createComponent(): JComponent? {
    val panel = JPanel()
    panel.layout = BoxLayout(panel, BoxLayout.Y_AXIS)

    val prefixPanel = JPanel()
    prefixPanel.setLayout(FlowLayout(FlowLayout.LEFT))
    val prefixLabel = JLabel("Prefix:")
    prefixLabel.alignmentX = Component.LEFT_ALIGNMENT
    prefixPanel.add(prefixLabel)
    prefixPanel.maximumSize = Dimension(Short.MAX_VALUE.toInt(), forbiddenWordsField.preferredSize.height + 3) // Set maximum width to preferred height
    prefixField.text = settings.prefix
    prefixPanel.add(prefixField)

    panel.add(prefixPanel)

    panel.add(Box.createVerticalStrut(5)) // Add vertical space (5 pixels) here

    val forbiddenWordsLabelPanel = JPanel()
    forbiddenWordsLabelPanel.setLayout(FlowLayout(FlowLayout.LEFT))
    val forbiddenWordsLabel = JLabel("Forbidden Words (comma-separated):", HorizontalAlignment.LEFT.ordinal)
    forbiddenWordsLabel.alignmentX = Component.LEFT_ALIGNMENT
    forbiddenWordsLabelPanel.add(forbiddenWordsLabel)
    forbiddenWordsLabelPanel.maximumSize = Dimension(Short.MAX_VALUE.toInt(), 20) // Set maximum width to preferred height

    panel.add(forbiddenWordsLabelPanel)

    panel.add(Box.createVerticalStrut(2)) // Add vertical space (2 pixels) here

    forbiddenWordsField.maximumSize = Dimension(Short.MAX_VALUE.toInt(), forbiddenWordsField.preferredSize.height) // Set maximum width to preferred height
    forbiddenWordsField.text = settings.forbiddenWords.joinToString(",")
    panel.add(forbiddenWordsField)

    return panel
  }

  override fun reset() {
    val settings = ExtractorConfig.instance.state
    prefixField.text = settings.prefix
    forbiddenWordsField.text = settings.forbiddenWords.joinToString(",")
  }
}
