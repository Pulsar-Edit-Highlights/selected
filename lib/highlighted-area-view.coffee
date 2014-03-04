MarkerView = require './marker-view'
{EditorView, View} = require 'atom'
_ = require 'underscore-plus'

module.exports =
class HighlightedAreaView extends View
  @content: ->
    @div class: 'highlight-selected'

  initialize: (editorView) ->
    @views = []
    @editorView = editorView

  attach: =>
    @editorView.underlayer.append(this)
    atom.workspaceView.eachPaneView (paneView) =>
      paneView.on "selection:changed", @handleSelection

  destroy: ->
    atom.workspaceView.eachPaneView (paneView) ->
      paneView.off "selection:changed"

  getEditorView: ->
    activeView = atom.workspaceView.getActiveView()
    if activeView instanceof EditorView then activeView else null

  getActiveEditor: ->
    atom.workspace.getActiveEditor()

  handleSelection: =>
    @removeMarkers()
    text = _.escapeRegExp(@getActiveEditor()?.getSelectedText())
    regex = new RegExp("\\w*\\b", 'gi')
    result = regex.exec(text)
    return unless result?
    return if result.length == 0 or
              result.index != 0 or
              result[0] != result.input
    editor = @getActiveEditor()

    range =  [[0, 0], editor.getEofBufferPosition()]

    @results = []
    editor.scanInBufferRange new RegExp(result[0], 'g'), range,
      (result) =>
        if prefix = result.match[1]
          result.range = result.range.translate([0, prefix.length], [0, 0])
        @results.push result

    for result in @results
      view = new MarkerView(result.range, this, @getEditorView())
      @append view.element
      @views.push view

  removeMarkers: =>
    return unless @views?
    return if @views.length == 0
    for view in @views
      view.element.remove()
    @views = []
