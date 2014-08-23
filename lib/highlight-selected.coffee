HighlightedAreaView = require './highlighted-area-view'

module.exports =
  configDefaults:
    onlyHighlightWholeWords: false
    hideHighlightOnSelectedWord: false
    ignoreCase: false
    lightTheme: false
    highlightBackground: false
  areaView: null

  activate: (state) ->
    @areaView = new HighlightedAreaView()
    @areaView.attach()

  deactivate: ->
    @areaView.destroy()
    @areaView = null
