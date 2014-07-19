MarkerView = require './marker-view'
{EditorView, View, Range} = require 'atom'
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
    atom.workspaceView.on 'pane:item-removed', @destroy

  destroy: =>
    found = false
    for editor in atom.workspaceView.getEditorViews()
      found = true if editor.id is @editorView.id
    return if found
    atom.workspaceView.off 'pane:item-removed', @destroy
    @unsubscribe()
    @remove()
    @detach()

  getActiveEditor: ->
    atom.workspace.getActiveEditor()

  handleSelection: =>
    @removeMarkers()

    return unless editor = @getActiveEditor()
    return if editor.getSelection().isEmpty()
    return unless @isWordSelected(editor.getSelection())

    @selections = editor.getSelections()

    text = _.escapeRegExp(@selections[0].getText())
    regex = new RegExp("\\W*\\w*\\b", 'gi')
    result = regex.exec(text)

    return unless result?
    return if result.length is 0 or
              result.index isnt 0 or
              result[0] isnt result.input

    range =  [[0, 0], editor.getEofBufferPosition()]

    @ranges = []
    regexSearch = result[0]
    if atom.config.get('highlight-selected.onlyHighlightWholeWords')
      regexSearch =  "\\b" + regexSearch + "\\b"
    editor.scanInBufferRange new RegExp(regexSearch, 'g'), range,
      (result) =>
        if prefix = result.match[1]
          result.range = result.range.translate([0, prefix.length], [0, 0])
        @ranges.push editor.markBufferRange(result.range).getScreenRange()

    for range in @ranges
      unless @showHighlightOnSelectedWord(range, @selections)
        view = new MarkerView(range, this, @editorView)
        @append view.element
        @views.push view

  showHighlightOnSelectedWord: (range, selections) ->
    return false unless atom.config.get('highlight-selected.hideHighlightOnSelectedWord')
    outcome = false
    for selection in selections
      selectionRange = selection.getScreenRange()
      outcome = (range.start.column is selectionRange.start.column) and
                (range.start.row is selectionRange.start.row) and
                (range.end.column is selectionRange.end.column) and
                (range.end.row is selectionRange.end.row)
      break if outcome
    outcome

  removeMarkers: =>
    return unless @views?
    return if @views.length is 0
    for view in @views
      view.element.remove()
      view = null
    @views = []

  isWordSelected: (selection) ->
    if selection.getBufferRange().isSingleLine()
      selectionRange = selection.getBufferRange()
      lineRange = @getActiveEditor().bufferRangeForBufferRow(
        selectionRange.start.row)
      nonWordCharacterToTheLeft =
        _.isEqual(selectionRange.start, lineRange.start) or
        @isNonWordCharacterToTheLeft(selection)
      nonWordCharacterToTheRight =
        _.isEqual(selectionRange.end, lineRange.end) or
        @isNonWordCharacterToTheRight(selection)

      nonWordCharacterToTheLeft and nonWordCharacterToTheRight
    else
      false

  isNonWordCharacter: (character) ->
    nonWordCharacters = atom.config.get('editor.nonWordCharacters')
    new RegExp("[ \t#{_.escapeRegExp(nonWordCharacters)}]").test(character)

  isNonWordCharacterToTheLeft: (selection) ->
    selectionStart = selection.getBufferRange().start
    range = Range.fromPointWithDelta(selectionStart, 0, -1)
    @isNonWordCharacter(@getActiveEditor().getTextInBufferRange(range))

  isNonWordCharacterToTheRight: (selection) ->
    selectionEnd = selection.getBufferRange().end
    range = Range.fromPointWithDelta(selectionEnd, 0, 1)
    @isNonWordCharacter(@getActiveEditor().getTextInBufferRange(range))
