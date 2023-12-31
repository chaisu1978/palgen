/** Default configuration **/

Coloris({
  el: '.coloris',
  alpha: false,
  selectInput: true,
  clearButton: true,
  closeButton: true,
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

