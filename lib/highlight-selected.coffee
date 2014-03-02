HighlightedAreaView = require './highlighted-area-view'

module.exports =
  activate: (state) ->
    @areas = []
    atom.workspaceView.eachEditorView (editorView) =>
      area = new HighlightedAreaView(editorView)
      area.attach()
      @areas.push = area

  deactivate: =>
    for area in @areas
      area.destroy()
