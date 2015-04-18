HighlightSelectedModel = require './highlight-selected-model'

module.exports =
  config:
    onlyHighlightWholeWords:
      type: 'boolean'
      default: false
    hideHighlightOnSelectedWord:
      type: 'boolean'
      default: false
    ignoreCase:
      type: 'boolean'
      default: false
    lightTheme:
      type: 'boolean'
      default: false
    highlightBackground:
      type: 'boolean'
      default: false
    minimumLength:
      type: 'integer'
      default: 0

  areaView: null

  activate: (state) ->
    @areaView = new HighlightSelectedModel()

  deactivate: ->
    @areaView?.destroy()
    @areaView = null
