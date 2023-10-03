"""
UI Palette based on HSB brand color
"""
import os
from PIL import Image, ImageDraw, ImageFont
import colorsys
import openpyxl
from openpyxl.styles import PatternFill, Font, Alignment, Color
from openpyxl.utils import get_column_letter

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
    hex = hex.strip('#')
    hex = tuple(int(hex[i:i+2], 16) for i in (0, 2, 4))
    return hex

def hex_to_hsb(hex):
    rgb = hex_to_rgb(hex)
    hsb = rgb_to_hsb(rgb)
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

def generate_palette(primary, secondary=None, tertiary=None):
    primary_hsb = hex_to_hsb(primary)
    secondary_hsb = hex_to_hsb(secondary) if secondary else None
    tertiary_hsb = hex_to_hsb(tertiary) if tertiary else None
    palette = {}
    palette["Primary"] = generate_shades(primary_hsb)
    if secondary_hsb:
        palette["Secondary"] = generate_shades(secondary_hsb)
    if tertiary_hsb:
        palette["Tertiary"] = generate_shades(tertiary_hsb)
    palette["Neutral"] = generate_shades((primary_hsb[0], 15, 70))

    supporting_colors = {
        "Green": (134, (primary_hsb[1] - 10), (primary_hsb[2] - 2)),
        "Orange": (23, (primary_hsb[1] - 10), (primary_hsb[2] - 2)),
        "Red": (0, (primary_hsb[1] - 10), (primary_hsb[2] - 2)),
        "Blue": (204, (primary_hsb[1] - 10), (primary_hsb[2] - 2))
    }

    for color in supporting_colors:
        palette[color] = generate_shades(supporting_colors[color])

    return palette

class PaletteGenerator:
    def __init__(self, name, primary, secondary=None, tertiary=None):
        self.name = name
        self.primary = primary
        self.secondary = secondary
        self.tertiary = tertiary
        self.user_data = {}
        self.palette = generate_palette(self.primary, self.secondary, self.tertiary)
        self.create_directories()
        self.generate_files()
        self.user_data = {
            'name': self.name,
            'primary': self.primary,
            'secondary': self.secondary,
            'tertiary': self.tertiary,
            'png_file': f'{self.name}-color-palette.png',
            'excel_file': f'{self.name}-color-pallete.xlsx',
            'css_file': f'{self.name}-color-palette.css',
        }

    def create_directories(self):
        if not os.path.exists('app/files'):
            os.mkdir('app/files')
        palette_dir = os.path.join('app/files', self.name)
        if not os.path.exists(palette_dir):
            os.mkdir(palette_dir)

    def generate_files(self):
        self.generate_png_image()
        self.generate_excel_file()
        self.generate_css_file()


    def generate_png_image(self):
        img_width = int(11.69 * 150)
        img_height = int(8.27 * 150)
        img = Image.new('RGB', (img_width, img_height), color='white')
        d = ImageDraw.Draw(img)
        font = ImageFont.truetype("app/arial.ttf", 15)
        total_colors = len(self.palette)

        def draw_rectangle(draw, rgb, text, name, i, j):
            x1 = j * (img_width // total_colors) + 2
            y1 = i * (img_height // len(self.palette[name])) + 2
            x2 = (j + 1) * (img_width // total_colors) - 2
            y2 = (i + 1) * (img_height // len(self.palette[name])) - 2
            draw.rectangle([(x1, y1), (x2, y2)], fill=rgb)

            text_width, text_height = draw.textbbox((0, 0), text, font=font)[2:]
            text_x = x1 + ((img_width // total_colors) - text_width) / 2
            text_y = y1 + ((img_height // len(self.palette[name])) - text_height) / 2

            text_color = contrast_color(rgb)

            draw.text((text_x, text_y), text, fill=text_color, font=font)

            if i == len(self.palette[name]) - 1:
                name_width, name_height = draw.textbbox((0, 0), name, font=font)[2:]
                name_x = x1 + ((img_width // total_colors) - name_width) / 2
                name_y = y2 + 5
                draw.text((name_x, name_y), name, fill=(0, 0, 0), font=font)

        for j, (name, palette) in enumerate(self.palette.items()):
            for i, shade in enumerate(palette):
                rgb = hsb_to_rgb(palette[shade])
                hex_rgb = hsb_to_hex(palette[shade])
                text = f"Weight - {shade}\nHSB - {palette[shade]}\nRGB - {rgb}\nHEX - {hex_rgb}"
                draw_rectangle(d, rgb, text, name, i, j)

        img.save(f'app/files/{self.name}/{self.name}-color-palette.png')

    def generate_excel_file(self):
        wb = openpyxl.Workbook()
        ws = wb.active
        total_colors = len(self.palette)
        shade_row_mapping = {shade: i + 2 for i, shade in enumerate(["100", "200", "300", "400", "500", "600", "700", "800", "900"])}

        for j, (name, palette) in enumerate(self.palette.items()):
            ws.column_dimensions[get_column_letter(j + 2)].width = 30
            ws.cell(row=1, column=j + 2, value=name)

            for shade, hsb in palette.items():
                ws.row_dimensions[shade_row_mapping[shade]].height = 100
                rgb = hsb_to_rgb(hsb)
                hex_rgb = hsb_to_hex(hsb)
                fill = PatternFill(start_color=hex_rgb[1:], end_color=hex_rgb[1:], fill_type="solid")
                cell = ws.cell(row=shade_row_mapping[shade], column=j + 2)
                cell.fill = fill
                font_color_rgb = contrast_color(rgb)
                font_color_rgb_str = f'{font_color_rgb[0]:02X}{font_color_rgb[1]:02X}{font_color_rgb[2]:02X}'
                font_color = Font(color=Color(rgb=font_color_rgb_str))
                cell.font = font_color
                alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
                cell.alignment = alignment
                font_color_rgb = contrast_color(rgb)
                font_color_rgb_str = f'{font_color_rgb[0]:02X}{font_color_rgb[1]:02X}{font_color_rgb[2]:02X}'
                font_color = Font(color=Color(rgb=font_color_rgb_str))
                cell.font = font_color
                cell.value = f"Weight - {shade}\nHSB - {hsb}\nRGB - {rgb}\nHEX - {hex_rgb}"

        wb.save(f'app/files/{self.name}/{self.name}-color-pallete.xlsx')

    def generate_css_file(self):
        css_filename = f'app/files/{self.name}/{self.name}-color-palette.css'
        with open(css_filename, 'w') as css_file:
            css_file.write(':root {\n')
            for name, palette in self.palette.items():
                for shade, hsb in palette.items():
                    hex_rgb = hsb_to_hex(hsb)
                    css_file.write(f'  --{name.lower()}-{shade}: {hex_rgb};\n')
            css_file.write('}\n')
