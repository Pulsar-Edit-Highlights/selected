# Highlight Selected

[![Version](https://img.shields.io/apm/v/highlight-selected.svg?style=flat-square)](https://atom.io/packages/highlight-selected)
[![Travis CI](https://img.shields.io/travis/richrace/highlight-selected.svg?style=flat-square)](https://travis-ci.org/richrace/highlight-selected)
[![Gitter](https://img.shields.io/badge/chat-Gitter-ff69b4.svg?style=flat-square)](https://gitter.im/richrace/highlight-selected)
[![Downloads](https://img.shields.io/apm/dm/highlight-selected.svg?style=flat-square)](https://atom.io/packages/highlight-selected)
[![Licence](https://img.shields.io/apm/l/highlight-selected.svg?style=flat-square)](https://atom.io/packages/highlight-selected)
[![David](https://img.shields.io/david/richrace/highlight-selected.svg?style=flat-square)](https://david-dm.org/richrace/highlight-selected)


Highlight occurrences of a selection within the open editor.

Can be triggered by either double clicking a word, or selecting a word/text with your cursor.

![Gif in action](http://i.imgur.com/C5FnzzQ.gif)

## Commands

|Command Name|Command Code|Keymap|Description|
|---|---|---|---|
|Toggle|`highlight-selected:toggle`|<kbd>ctrl</kbd>+<kbd>cmd</kbd>+<kbd>h</kbd>|Enables/Disabled this package|
|Select all markers|`highlight-selected:select-all`||Select all markers|

To set a Keymap for select all open your `Keymap` file and add:
```coffeescript
'atom-text-editor:not([mini])':
  'cmd-*': 'highlight-selected:select-all'
```


## Settings

|Setting|Default|Description|
|---|---|---|
|Only Highlight Whole Words|true|This uses the "Allowed Characters To Select" option with Atom's "Non-word characters" to find word boundaries.|
|Hide Highlight On Selected Word|false|When enabled to will not add a box around the selected words.|
|Ignore Case|false|Case sensitivity|
|Light Theme|false|Different CSS classes get applied (see [styling](#styling)). Should makes it easier to switch between Atom's themes|
|Highlight Background|false|Adds a background colours via CSS class (see [styling](#styling))|
|Minimum Length|2|How many characters to select before searching for occurrences|
|Timeout|20|Defers searching for matching strings for X ms|
|Highlight In Panes|true|Highlight selection in another panes|
|Show In Status Bar|true|Show how many matches there are|
|Status Bar String|'Highlighted: %c|The text to show in the status bar. `%c` = number of occurrences|
|Allowed Characters To Select|'$@%-'|Non Word Characters that are allowed to be selected. This is useful for languages like PHP where variables like `$test` need to be highlighted|
|Show Results On Scroll Bar|false|Show highlight on the scroll bar. Requires [Scroll Marker](https://atom.io/packages/scroll-marker) Package (if you enable this setting you will be prompted to install the package)|

## Styling

If you want to change any of the styling of the region use the following as a guide:

```scss
atom-text-editor .highlights {
  // Box
  .highlight-selected .region {
    border-color: #ddd;
    border-radius: 3px;
    border-width: 1px;
    border-style: solid;
  }
  // Background (set in settings)
  .highlight-selected.background .region {
    background-color: rgba(155, 149, 0, 0.6);
  }
  // Light theme box (set in settings)
  .highlight-selected.light-theme .region {
    border-color: rgba(255, 128, 64, 0.4);
  }
  // Light theme background (set in settings)
  .highlight-selected.light-theme.background .region {
    background-color: rgba(255, 128, 64, 0.2);
  }
  }

// If you have the Scroll Marker package installed https://atom.io/packages/scroll-marker
// These are the colours that will be shown in the scroller
.highlight-selected-marker-layer.scroll-marker-layer {
  .scroll-marker {
    background-color: #ffff00
  }
}

.highlight-selected-selected-marker-layer.scroll-marker-layer {
  .scroll-marker {
    background-color: #f71010
  }
}
```

## Contributing

Please look at the [Contributing Guide](https://github.com/richrace/highlight-selected/blob/master/CONTRIBUTING.md)
