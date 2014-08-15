HighlightedAreaView = require './highlighted-area-view'
areas = []

module.exports =
  configDefaults:
    onlyHighlightWholeWords: false
    hideHighlightOnSelectedWord: false
    ignoreCase: false

  activate: (state) ->
    atom.workspaceView.eachEditorView (editorView) ->
      area = new HighlightedAreaView(editorView)
      area.attach()
      areas.push = area

  deactivate: ->
    for area in areas
      area.destroy()
