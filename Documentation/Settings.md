

## Settings

| Setting                         | Default          | Description                                                                                                                                                                         |
| ------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Only Highlight Whole Words      | true             | This uses the "Allowed Characters To Select" option with Atom's "Non-word characters" to find word boundaries.                                                                      |
| Hide Highlight On Selected Word | false            | When enabled to will not add a box around the selected words.                                                                                                                       |
| Ignore Case                     | false            | Case sensitivity                                                                                                                                                                    |
| Light Theme                     | false            | Different CSS classes get applied (see [styling](#styling)). Should makes it easier to switch between Atom's themes                                                                 |
| Highlight Background            | false            | Adds a background colours via CSS class (see [styling](#styling))                                                                                                                   |
| Minimum Length                  | 2                | How many characters to select before searching for occurrences                                                                                                                      |
| Timeout                         | 20               | Defers searching for matching strings for X ms                                                                                                                                      |
| Highlight In Panes              | true             | Highlight selection in another panes                                                                                                                                                |
| Show In Status Bar              | true             | Show how many matches there are                                                                                                                                                     |
| Status Bar String               | 'Highlighted: %c | The text to show in the status bar. `%c` = number of occurrences                                                                                                                    |
| Allowed Characters To Select    | '\$@%-'          | Non Word Characters that are allowed to be selected. This is useful for languages like PHP where variables like `$test` need to be highlighted                                      |
| Show Results On Scroll Bar      | false            | Show highlight on the scroll bar. Requires [Scroll Marker](https://atom.io/packages/scroll-marker) Package (if you enable this setting you will be prompted to install the package) |
