import com.amadeus.otterextension.ExtractorSettings

import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.service
import com.intellij.openapi.components.Service
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage

@State(name = "ExtractorSettings", storages = [Storage("ExtractorSettings.xml")])
@Service(Service.Level.PROJECT)
class ExtractorConfig : PersistentStateComponent<ExtractorSettings> {

  private var state: ExtractorSettings = ExtractorSettings()

  override fun getState(): ExtractorSettings {
    return state
  }

  override fun loadState(state: ExtractorSettings) {
    this.state = state
  }

  companion object {
    val instance: ExtractorConfig
      get() = service<ExtractorConfig>()
  }
}
