
## Commands

| Command Name       | Command Code                    | Keymap                                      | Description                   |
| ------------------ | ------------------------------- | ------------------------------------------- | ----------------------------- |
| Toggle             | `highlight-selected:toggle`     | <kbd>ctrl</kbd>+<kbd>cmd</kbd>+<kbd>h</kbd> | Enables/Disabled this package |
| Select all markers | `highlight-selected:select-all` |                                             | Select all markers            |

To set a Keymap for select all open your `Keymap` file and add:

```coffeescript
'atom-text-editor:not([mini])':
  'cmd-*': 'highlight-selected:select-all'
```
