
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
    background-color: #ffff00;
  }
}

.highlight-selected-selected-marker-layer.scroll-marker-layer {
  .scroll-marker {
    background-color: #f71010;
  }
}
```
