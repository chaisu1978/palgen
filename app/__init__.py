from flask import Flask
from .routes import main_bp  # Import the blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_pyfile('config.py')  # Load the configuration file

    # Register blueprints here
    app.register_blueprint(main_bp)  # Register the blueprint with the Flask app

    return app
