"""
UI Palette based on HSB brand color
Written by: Terrence Hosang with copilot
"""
import os
from PIL import Image, ImageDraw, ImageFont
import colorsys
import random
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Color
from openpyxl.utils import get_column_letter

# Get All Palette Folder and File Names from files directory
def get_all_palettes():
    palettes = []
    for root, dirs, files in os.walk('app/files'):
        for dir in dirs:
            palette = {}
            palette['name'] = dir
            palette['files'] = []
            for file in os.listdir(os.path.join(root, dir)):
                palette['files'].append(file)
            palettes.append(palette)
    return palettes

def hsb_to_rgb(hsb):
    rgb = tuple(int(x * 255) for x in colorsys.hsv_to_rgb(hsb[0] / 360, hsb[1] / 100, hsb[2] / 100))
    return rgb

def rgb_to_hsb(rgb):
    hsb = colorsys.rgb_to_hsv(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255)
    return (hsb[0] * 360, hsb[1] * 100, hsb[2] * 100)

def hsb_to_hex(hsb):
    return '#%02x%02x%02x' % hsb_to_rgb(hsb)

def hex_to_rgb(hex):
    # Strip # from hex if present
    hex = hex.strip('#')
    # Limit tupple values to whole numbers
    hex = tuple(int(hex[i:i+2], 16) for i in (0, 2, 4))
    return hex

def hex_to_hsb(hex):
    rgb = hex_to_rgb(hex)
    hsb = rgb_to_hsb(rgb)
    # Remove decimal places from hsb values
    hsb = tuple(int(round(x)) for x in hsb)
    return hsb

def generate_shades(base_color):
    h, s, b = base_color

    shades = {}
    shades["500"] = base_color

    shades["100"] = (h, round(max(0, s - 40)), round(min(b + 50, 100)))
    shades["900"] = (h, round(min(s + 40, 100)), round(max(b - 70, 0)))

    shades["300"] = (h, round(max(0, s - 20)), round(min(b + 25, 100)))
    shades["700"] = (h, round(min(s + 20, 100)), round(max(b - 35, 0)))

    shades["200"] = (h, round(max(0, s - 30)), round(min(b + 37.5, 100)))
    shades["400"] = (h, round(max(0, s - 10)), round(min(b + 12.5, 100)))
    shades["600"] = (h, round(min(s + 10, 100)), round(max(b - 17.5, 0)))
    shades["800"] = (h, round(min(s + 30, 100)), round(max(b - 52.5, 0)))

    shades = dict(sorted(shades.items(), key=lambda item: int(item[0])))

    return shades

def brightness(rgb):
    return (rgb[0]*299 + rgb[1]*587 + rgb[2]*2.2) / 1000

def contrast_color(rgb):
    return (0, 0, 0) if brightness(rgb) > 128 else (255, 255, 255)

# Palette Generator Function
def generate_palette(primary, secondary=None, tertiary=None):
    # Convert hex codes to HSB
    primary_hsb = hex_to_hsb(primary)
    if secondary:
        secondary_hsb = hex_to_hsb(secondary)
    else:
        secondary_hsb = None
    if tertiary:
        tertiary_hsb = hex_to_hsb(tertiary)
    else:
        tertiary_hsb = None

    # Generate the palette
    palette = {}
    palette["Primary"] = generate_shades(primary_hsb)
    if secondary_hsb:
        palette["Secondary"] = generate_shades(secondary_hsb)
    if tertiary_hsb:
        palette["Tertiary"] = generate_shades(tertiary_hsb)

    # Neutral color
    palette["Neutral"] = generate_shades((primary_hsb[0], 15, 70)) # Old value was (primary.h, 40, 50)

    # Supporting colors
    supporting_colors = {
        # Adjusting saturation and brightness by random amounts - can be adjusted for more control
            "Green": (134, (primary_hsb[1] + -10), (primary_hsb[2] + -2)),
            "Orange": (23, (primary_hsb[1] + -10), (primary_hsb[2] + -2)),
            "Red": (0, (primary_hsb[1] + -10), (primary_hsb[2] + -2)),
            "Blue": (204, (primary_hsb[1] + -10), (primary_hsb[2] + -2))
            }

    for color in supporting_colors:
        palette[color] = generate_shades(supporting_colors[color])

    return palette

class PaletteGenerator:
    """This class generates a color palette based on the primary, secondary and tertiary colors provided.

    Keyword arguments:
    name -- this is the name of the color palette,
    primary -- this is the primary color in hex format,
    secondary -- this is the secondary color in hex format,
    tertiary -- this is the tertiary color in hex format,
    Return: the necessary information about the files generated to be sent back to the user
    """
    def __init__(self, name, primary, secondary=None, tertiary=None):
        self.name = name
        self.primary = primary
        self.secondary = secondary
        self.tertiary = tertiary
        self.palette = generate_palette(self.primary, self.secondary, self.tertiary)

        # Ensure the 'files' directory exists
        if not os.path.exists('app/files'):
            os.mkdir('app/files')

        # Ensure the specific directory for this palette exists (use self.name)
        palette_dir = os.path.join('app/files', self.name)
        if not os.path.exists(palette_dir):
            os.mkdir(palette_dir)

        # PNG Image settings
        self.img_width = int(11.69 * 150)
        self.img_height = int(8.27 * 150)
        self.img = Image.new('RGB', (self.img_width, self.img_height), color='white')
        self.d = ImageDraw.Draw(self.img)
        self.font = ImageFont.truetype("app/arial.ttf", 15)

        # Create a workbook and select the active sheet
        self.wb = openpyxl.Workbook()
        self.ws = self.wb.active


        # Create a dictionary to store user data to be returned to the user
        self.user_data = {
            'name': self.name,
            'primary': self.primary,
            'secondary': self.secondary,
            'tertiary': self.tertiary,
        }

        # Calculate total number of colors
        total_colors = len(self.palette)

        def draw_rectangle(draw, rgb, text, name, i, j):
            x1 = j * (self.img_width // total_colors) + 2
            y1 = i * (self.img_height // len(self.palette[name])) + 2
            x2 = (j + 1) * (self.img_width // total_colors) - 2
            y2 = (i + 1) * (self.img_height // len(self.palette[name])) - 2
            draw.rectangle([(x1, y1), (x2, y2)], fill=rgb)

            text_width, text_height = draw.textbbox((0, 0), text, font=self.font)[2:]
            text_x = x1 + ((self.img_width // total_colors) - text_width) / 2
            text_y = y1 + ((self.img_height // len(self.palette[name])) - text_height) / 2

            # choose text color based on color brightness for better visibility
            text_color = contrast_color(rgb)

            draw.text((text_x, text_y), text, fill=text_color, font=self.font)

            if i == len(self.palette[name]) - 1:
                name_width, name_height = draw.textbbox((0, 0), name, font=self.font)[2:]
                name_x = x1 + ((self.img_width // total_colors) - name_width) / 2
                name_y = y2 + 5
                draw.text((name_x, name_y), name, fill=(0, 0, 0), font=self.font)

        # Create PNG image
        # Draw the rectangles for each color shade and write the color information
        for j, (name, palette) in enumerate(self.palette.items()):
            for i, shade in enumerate(palette):
                rgb = hsb_to_rgb(palette[shade])
                hex_rgb = hsb_to_hex(palette[shade])
                text = f"Weight - {shade}\nHSB - {palette[shade]}\nRGB - {rgb}\nHEX - {hex_rgb}"
                draw_rectangle(self.d, rgb, text, name, i, j)

        # Save the image
        self.img.save(f'app/files/{self.name}/{self.name}-color-palette.png')

        # Add image path to user data
        self.user_data['png_file'] = f'{self.name}-color-palette.png'

        # Create Excel workbook
        # Map the shades to Excel row indices
        shade_row_mapping = {shade: i + 2 for i, shade in enumerate(["100", "200", "300", "400", "500", "600", "700", "800", "900"])}
        for j, (name, palette) in enumerate(self.palette.items()):
            # Adjust column width
            self.ws.column_dimensions[get_column_letter(j + 2)].width = 30

            # Write color name in the first row
            self.ws.cell(row=1, column=j + 2, value=name)

            for shade, hsb in palette.items():
                # Adjust row height
                self.ws.row_dimensions[shade_row_mapping[shade]].height = 100

                # Convert HSB to RGB
                rgb = hsb_to_rgb(hsb)
                hex_rgb = hsb_to_hex(hsb)

                # Create a fill with RGB color
                fill = PatternFill(start_color=hex_rgb[1:], end_color=hex_rgb[1:], fill_type="solid")
                # Write shade information in the cell
                cell = self.ws.cell(row=shade_row_mapping[shade], column=j + 2)
                cell.fill = fill

                # Set the font color explicitly based on brightness (use the contrast_color function)
                font_color_rgb = contrast_color(rgb)
                # Convert the RGB tuple to a valid RGB string
                font_color_rgb_str = f'{font_color_rgb[0]:02X}{font_color_rgb[1]:02X}{font_color_rgb[2]:02X}'
                font_color = Font(color=Color(rgb=font_color_rgb_str))
                cell.font = font_color

                # Set text alignment to center
                alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
                cell.alignment = alignment

                # Set the font color explicitly based on brightness (use the contrast_color function)
                font_color_rgb = contrast_color(rgb)
                font_color_rgb_str = f'{font_color_rgb[0]:02X}{font_color_rgb[1]:02X}{font_color_rgb[2]:02X}'
                font_color = Font(color=Color(rgb=font_color_rgb_str))
                cell.font = font_color

                cell.value = f"Weight - {shade}\nHSB - {hsb}\nRGB - {rgb}\nHEX - {hex_rgb}"

        # Save the workbook
        self.wb.save(f'app/files/{self.name}/{self.name}-color-pallete.xlsx')

        # Add excel file path to user data
        self.user_data['excel_file'] = f'{self.name}-color-pallete.xlsx'
