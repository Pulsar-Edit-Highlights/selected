{Range} = require 'atom'
{View} = require 'atom-space-pen-views'
_ = require 'underscore-plus'

module.exports =
class HighlightedAreaView extends View
  @content: ->
    @div class: 'highlight-selected'

  initialize: ->
    @views = []
    @activeItemSubscription = atom.workspace.onDidChangeActivePaneItem =>
      @subscribeToActiveTextEditor()
    @subscribeToActiveTextEditor()

  attach: ->
    panel = atom.workspace.addBottomPanel(item: this)
    panel.hide()

  destroy: =>
    @activeItemSubscription.dispose()
    @selectionSubscription?.dispose()
    @remove()
    @detach()

  subscribeToActiveTextEditor: ->
    @selectionSubscription?.dispose()
    @selectionSubscription = @getActiveEditor()?.onDidChangeSelectionRange =>
      @handleSelection()
    @handleSelection()

  getActiveEditor: ->
    atom.workspace.getActiveTextEditor()

  handleSelection: =>
    @removeMarkers()

    editor = @getActiveEditor()
    return unless editor
    return if editor.getLastSelection().isEmpty()
    return unless @isWordSelected(editor.getLastSelection())

    @selections = editor.getSelections()

    text = _.escapeRegExp(@selections[0].getText())
    regex = new RegExp("\\S*\\w*\\b", 'gi')
    result = regex.exec(text)

    return unless result?
    return if result[0].length < atom.config.get(
      'highlight-selected.minimumLength') or
              result.index isnt 0 or
              result[0] isnt result.input

    regexFlags = 'g'
    if atom.config.get('highlight-selected.ignoreCase')
      regexFlags = 'gi'

    range =  [[0, 0], editor.getEofBufferPosition()]

    @ranges = []
    regexSearch = result[0]
    if atom.config.get('highlight-selected.onlyHighlightWholeWords')
      regexSearch =  "\\b" + regexSearch + "\\b"

    editor.scanInBufferRange new RegExp(regexSearch, regexFlags), range,
      (result) =>
        unless @showHighlightOnSelectedWord(result.range, @selections)
          marker = editor.markBufferRange(result.range)
          decoration = editor.decorateMarker(marker,
            {type: 'highlight', class: @makeClasses()})
          @views.push marker

  makeClasses: ->
    className = 'highlight-selected'
    if atom.config.get('highlight-selected.lightTheme')
      className += ' light-theme'

    if atom.config.get('highlight-selected.highlightBackground')
      className += ' background'
    className

  showHighlightOnSelectedWord: (range, selections) ->
    return false unless atom.config.get(
      'highlight-selected.hideHighlightOnSelectedWord')
    outcome = false
    for selection in selections
      selectionRange = selection.getBufferRange()
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
      view.destroy()
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
