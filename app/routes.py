from flask import Blueprint, render_template, request, redirect, send_from_directory
from . import generator as gen

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return render_template('home.html')

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
        # Get file extensions for pallette.user_data['files'] for data
        for i, file in enumerate(palette.user_data['files']):
            palette.user_data['files'][i] = {'name': file, 'extension': file.split('.')[-1]}

        data = {'name': palette.user_data['name'],
                'primary': palette.user_data['primary'],
                'secondary': palette.user_data['secondary'],
                'tertiary': palette.user_data['tertiary'],
                'png_file': palette.user_data['png_file'],
                'files': palette.user_data['files'],
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
    for palette in palettes:
        for i, file in enumerate(palette['files']):
            palette['files'][i] = {'name': file, 'extension': file.split('.')[-1]}

    return render_template('manage_files.html', palettes=palettes)

# Route to delete folder taking in the name of the folder
@main_bp.route('/delete/<palette_name>')
def delete(palette_name):
    # Delete the palette
    gen.delete_palette(palette_name)
    # Redirect to manage page
    return redirect('/manage')
