# Color Palette Generator with Flask

<!-- insert Sample png url -->
<img src="https://github.com/chaisu1978/palgen/blob/main/app/files/ThreeColorPalette/ThreeColorPalette-color-palette.png" alt="Sample Palette">

## Setup

1. Install Python 3.x
2. Clone this repository or download the ZIP file and extract it.
3. Navigate to the project directory and install the required packages:
    ```
    pip install -r requirements.txt
    ```
4. Run the Flask app:
    ```
    python run.py
    ```
5. Open your web browser and go to `http://127.0.0.1:5000`

## What PalGen Does

The Color Palette Generator creates a UI design pallette which includes shades from 100 to 900 for each that the user supplies (Primary, Secondary & Tertiary), as well as shades for the palette's supporting colors: Neutral Grey, Blue, Red, Green, and Orange (for use in interface elements - e.g. backgrounds, buttons, charts, graphs etc.).

## How To Use PalGen

To use PalGen, give your palette a name and select at least a Primary color. Secondary and Tertiary colors are OPTIONAL. Once you have selected your colors, click "Generate Palette". This will create the palette and provide download links for the various file formats provided.

## What It Makes

PalGen provides your shaded color palette in the following formats:

* Palette PNG file
* Labelled Excel file
* Palette CSS variables
* Flutter (Dart) constants
* JSON file
