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
    @subscribe @editorView, "selection:changed", @handleSelection
    @subscribe @editorView, 'core:close', @destroy

  destroy: =>
    @unsubscribe()
    @remove()
    @detach()

  getEditorView: ->
    activeView = atom.workspaceView.getActiveView()
    if activeView instanceof EditorView then activeView else null

  getActiveEditor: ->
    atom.workspace.getActiveEditor()

  handleSelection: =>
    @removeMarkers()
    text = _.escapeRegExp(@getActiveEditor()?.getSelectedText())
    return if text.length <= 1
    regex = new RegExp("\\w*\\b", 'gi')
    result = regex.exec(text)
    return unless result?
    return if result.length == 0 or
              result.index != 0 or
              result[0] != result.input
    editor = @getActiveEditor()

    range =  [[0, 0], editor.getEofBufferPosition()]

    @ranges = []
    editor.scanInBufferRange new RegExp(result[0], 'g'), range,
      (result) =>
        if prefix = result.match[1]
          result.range = result.range.translate([0, prefix.length], [0, 0])
        @ranges.push editor.markBufferRange(result.range).getScreenRange()

    for range in @ranges
      view = new MarkerView(range, this, @getEditorView())
      @append view.element
      @views.push view

  removeMarkers: =>
    return unless @views?
    return if @views.length == 0
    for view in @views
      view.element.remove()
      view = null
    @views = []
