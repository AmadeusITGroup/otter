package com.amadeus.otterextension

data class ExtractorSettings(
  var prefix: String = "",
  var forbiddenWords: List<String> = listOf()
)
