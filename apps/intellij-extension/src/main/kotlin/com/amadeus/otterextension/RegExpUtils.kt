package com.amadeus.otterextension

object RegExp {
  private const val baseSanitizer = """[\.*\,\s~+\[\]=_^$"':()#{}&-]"""

  /**
   * New line `\r\n` or `\n`
   */
  val newLine = Regex("""\r?\n""")

  /**
   * Check for the first free space to append new line in the styling file
   * Ignore the first import statement and comments and will give a match on the first selector or variable
   */
  val freeSpaceToWriteInCss = Regex("""((?:^[^\/\@\n\r](?:.*)[\{\(])|(?:^[^\/\@\n\r].*?$)|(?:^[^\/\n\r].*?\())""")

  /**
   * Match the whole css selectors excluding imports, variables and comments
   */
  val css = Regex(".*\\{(.|(\r\n|\r|\n))*;")

  /**
   * Retrieves all selectors attributes without the content. Only the name with the opening bracket
   */
  val allSelectors = Regex("(?:\\s?&?\\.?)([^\\s]*)(?:\\s?)(?:\\{)")

  /**
   * Trim and sanitize all the characters matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  val sanitizer = Regex(baseSanitizer)

  /**
   * Trim and sanitize the start part of the string matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  val trimLeft = Regex("^$baseSanitizer+")

  /**
   * Trim and sanitize the end part of the string matching
   * `.` `*` `,` ` ` `~` `+` `\` `=` `_` `^` `$` `"` `'` `:` `(` `)` `#` `{` `}` `&`
   */
  val trimRight = Regex("$baseSanitizer+\\$")

  /**
   * Match a css property with his value like `prop: value;` (without spaces)
   * Work only with non-variable values
   */
  val propValue = Regex("""(^[^$#](?:.*)(?: *).*):(?: )([^$]+.*);""")

  /**
   * Look for the otter import functions
   */
  val o3rImport = Regex("""^@import.*@otter.*functions.*;""")

  /**
   * Look for the otter import functions
   */
  val o3rUse = Regex("""^@use.*@o3r\/styling.*;""")

  /**
   * Match any import statement
   */
  val import = Regex("""^@.*;""", setOf(RegexOption.MULTILINE))

  /**
   * Match all declared variables
   */
  val o3rDeclaredVariables = Regex("""(?:\$)(.*):(?:(?:.*o3r\.variable\((?:[^;]|\n)*?,))((?:[^;]|\n)*)\)(?:[^;]+|);""", setOf(RegexOption.MULTILINE))

  /**
   * Match tenant name in a path
   */
  val tenantNameInPath = Regex(""".*\/apps\/(.*)\/customization\/.*""", setOf(RegexOption.MULTILINE))

  /**
   * Match all overrided variables
   */
  val o3rOverridedVariables = Regex("""(?:@include.o3r\.override-theme\({2})((.|\r|\n)*)(?:\){2})""", setOf(RegexOption.MULTILINE))

  /**
   * Match key and value for overrided variable
   */
  val o3rVariableKeyValue = Regex("""(?: |)(.*):(?: |)(.+[^,])(?:,|)""")
}
