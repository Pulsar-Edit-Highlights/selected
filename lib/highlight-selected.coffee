{CompositeDisposable} = require "atom"
HighlightedAreaView = require './highlighted-area-view'

module.exports =
  config:
    onlyHighlightWholeWords:
      type: 'boolean'
      default: true
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
      default: 2
    timeout:
      type: 'integer'
      default: 20
      description: 'Defers searching for matching strings for X ms'
    showInStatusBar:
      type: 'boolean'
      default: true
      description: 'Show how many matches there are'
    highlightInPanes:
      type: 'boolean'
      default: true
      description: 'Highlight selection in another panes'
    statusBarString:
      type: 'string'
      default: 'Highlighted: %c'
      description: 'The text to show in the status bar. %c = number of occurrences'
    allowedCharactersToSelect:
      type: 'string'
      default: '$@%-'
      description: 'Non Word Characters that are allowed to be selected'
    showResultsOnScrollBar:
      type: 'boolean'
      default: false
      description: 'Show highlight on the scroll bar'

  areaView: null

  activate: (state) ->
    @areaView = new HighlightedAreaView()
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.commands.add "atom-workspace",
        'highlight-selected:toggle': => @toggle()
        'highlight-selected:select-all': => @selectAll()

  deactivate: ->
    @areaView?.destroy()
    @areaView = null
    @subscriptions?.dispose()
    @subscriptions = null

  provideHighlightSelectedV1Deprecated: -> @areaView

  provideHighlightSelectedV2: -> @areaView

  consumeStatusBar: (statusBar) ->
    @areaView.setStatusBar statusBar

  toggle: ->
    if @areaView.disabled
      @areaView.enable()
    else
      @areaView.disable()

  selectAll: ->
    @areaView.selectAll()

  consumeScrollMarker: (scrollMarkerAPI) ->
    @areaView.setScrollMarker scrollMarkerAPI
