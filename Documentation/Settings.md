
# Settings

<br>

### Only Highlight Whole Words

Default : `true`

<br>

This uses the `Allowed Characters To Select` option  
with Pulsar's `Non-word Characters` to find words.

<br>
<br>

### Hide Highlight On Selected Word

Default : `false`

<br>

Only highlights occurrences, not the selected word.

<br>
<br>

### Ignore Case

Default : `false`

<br>

Matches words even if the case isn't the same.

<br>
<br>

### Light Theme

Default : `false`

<br>

Uses the light theme styling described in [`Customize.md`].

<br>
<br>

### Highlight Background

Default : `false`

<br>

Highlights the background of the matched occurrences.

<br>
<br>

### Minimum Length

Default : `2`

<br>

Minimum length of chars you need to select  
before other occurrences are highlighted.

<br>
<br>

### Timeout

Default : `20`

<br>

Stop searching after the given amount of milliseconds.

<br>
<br>

### Highlight In Panes

Default : `true`

<br>

Also highlight in other editor panes.

<br>
<br>

### Show In Status Bar

Default : `true`

<br>

Display the amount of matched  
occurrences in the status bar.

<br>
<br>

### Status Bar String

Default : `Highlighted: %c`

<br>

The template for the text shown in the status bar,  
at `%c` the number of occurrences is inserted.

<br>
<br>

### Allowed Characters To Select

Default : `\$@%-`

<br>

Non word characters that will be matched in your selection.

This can be useful in languages like PHP  
where variables names start with `$`.

<br>
<br>

### Show Results On Scroll Bar

Default : `false`

<br>

Displays highlighted sections on the scroll bar.

This requires the **[Scroll Marker]** package.

<br>


<!----------------------------------------------------------------------------->

[`Customize.md`]: Customize.md

[Scroll Marker]: https://web.pulsar-edit.dev/packages/scroll-marker
