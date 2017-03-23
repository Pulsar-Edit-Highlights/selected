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

  areaView: null

  activate: (state) ->
    @areaView = new HighlightedAreaView()
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.commands.add "atom-workspace",
        'highlight-selected:toggle': => @toggle()

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
