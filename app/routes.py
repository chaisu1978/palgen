from flask import Blueprint, render_template, request, redirect, send_from_directory
from . import generator as gen

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return render_template('home.html')

@main_bp.route('/clear')
def clear():
    return render_template('clear.html')

@main_bp.route('/download/<palette_name>/<filename>')
def download_file(palette_name, filename):
    directory = f'files/{palette_name}'  # Specify the directory where your palettes are stored
    return send_from_directory(directory, filename, as_attachment=True)

@main_bp.route('/display_image/<palette_name>/<filename>')
def display_image(palette_name, filename):
    directory = f'files/{palette_name}'  # Adjust the directory path as needed
    return send_from_directory(directory, filename)

@main_bp.route('/generate', methods=['GET', 'POST'])
def generate():
    if request.method == 'POST':
        # Get data from POST request
        # Name of palette
        name = request.form.get('name').title().replace(" ", "")
        # Strip non-alphanumeric characters from name
        name = ''.join(e for e in name if e.isalnum())
        # Primary color hex code
        primary_hex = request.form.get('primary')
        # Secondary color hex code
        if request.form.get('secondary'):
            secondary_hex = request.form.get('secondary')
        else:
            secondary_hex = None
        # Tertiary color hex code
        if request.form.get('tertiary'):
            tertiary_hex = request.form.get('tertiary')
        else:
            tertiary_hex = None

        # Generate the palette
        palette = gen.PaletteGenerator(name, primary_hex, secondary_hex, tertiary_hex)
        #Test data for output
        data = {'name': palette.user_data['name'],
                'primary': palette.user_data['primary'],
                'secondary': palette.user_data['secondary'],
                'tertiary': palette.user_data['tertiary'],
                'excel_file': palette.user_data['excel_file'],
                'png_file': palette.user_data['png_file'],
                }
        return render_template('generate.html', data=data)
    else:
        # Return to the homepage if GET request
        return redirect('/')

# Route to File Management page to allow for deleltion of palettes
@main_bp.route('/manage', methods=['GET', 'POST'])
def manage():
    # Get all palettes
    palettes = gen.get_all_palettes()
    if request.method == 'POST':
        # Get the name of the palette(s) to delete
        palette_names = request.form.get('palette_name')
        #Check what action to take against the palette
        if request.form.get('action') == 'delete':
            # Delete the palette
            gen.delete_palette(palette_names)
        elif request.form.get('action') == 'rename':
            # Rename the palette
            new_name = request.form.get('new_name')
            gen.rename_palette(palette_names, new_name)
        # Get all palettes again
        palettes = gen.get_all_palettes()
        return render_template('manage_files.html', palettes=palettes)
    print(palettes)
    return render_template('manage_files.html', palettes=palettes)
