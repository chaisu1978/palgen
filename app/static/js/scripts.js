
/** Default configuration **/

Coloris({
  el: '.coloris',
  alpha: false,
  selectInput: true,
  clearButton: true,
  closeButton: true,
});

/** Instances **/

Coloris.setInstance('.instance1', {
  theme: 'pill',
  themeMode: 'dark',
  formatToggle: true,
  closeButton: true,
  clearButton: true,
  swatches: [
    '#067bc2',
    '#84bcda',
    '#80e377',
    '#ecc30b',
    '#f37748',
    '#d56062'
  ]
});

Coloris.setInstance('.instance2', { theme: 'polaroid' });

Coloris.setInstance('.instance3', {
  theme: 'polaroid',
  swatchesOnly: true
});


  document.addEventListener('DOMContentLoaded', function () {
    const enableSecondaryCheckbox = document.getElementById('enableSecondary');
    const enableTertiaryCheckbox = document.getElementById('enableTertiary');
    const secondaryInput = document.getElementById('secondary');
    const tertiaryInput = document.getElementById('tertiary');

    // Function to enable/disable secondary and tertiary inputs based on checkbox state
    function toggleSecondaryTertiary() {
      secondaryInput.disabled = !enableSecondaryCheckbox.checked;
      tertiaryInput.disabled = !enableTertiaryCheckbox.checked || !enableSecondaryCheckbox.checked;
    }

    // Initial toggle based on checkbox states
    toggleSecondaryTertiary();

    // Add event listeners to checkboxes
    enableSecondaryCheckbox.addEventListener('change', toggleSecondaryTertiary);
    enableTertiaryCheckbox.addEventListener('change', toggleSecondaryTertiary);
  });

