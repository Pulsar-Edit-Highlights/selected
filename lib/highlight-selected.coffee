HighlightedAreaView = require './highlighted-area-view'

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
    timeout:
      type: 'integer'
      default: 20
      description: 'Defers searching for matching strings for X ms'

  areaView: null

  activate: (state) ->
    @areaView = new HighlightedAreaView()

  deactivate: ->
    @areaView?.destroy()
    @areaView = null
