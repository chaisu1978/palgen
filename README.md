# PalGen V2 - React Frontend & Django Backend

A modern color palette generator that creates beautiful, accessible color schemes for your design projects.

## ✨ Features

The Color Palette Generator creates a UI design pallette and swatches that includes shades from 100 to 900 for each color that the user supplies (Primary, Secondary & Tertiary), as well as shades for the palette's supporting colors: Neutral Grey, Blue, Red, Green, and Orange (for use in interface elements - e.g. backgrounds, buttons, charts, graphs etc.).

## How To Use PalGen

To use PalGen, Sign Up / Sign In and select a Primary color and Secondary Color. Tertiary colors are OPTIONAL. Once you have selected your colors, click "Generate Palette". This will create the palette and provide download links for the various file formats provided.

## What It Makes

PalGen provides your shaded color palette in the following formats:

- Palette PNG file
- Labelled Excel file
- Palette CSS variables
- Flutter (Dart) constants
- TypeScript Constants

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running with Docker

#### Clone the repository then

```bash

# Start the application
docker compose up -d
```

The application will be available at `http://localhost:5173`

## 🔧 Environment Variables

For local development, create a `.env` file in the root directory with these variables:

```env
DJANGO_DEBUG=True
DJANGO_SECRET_KEY=your-secret-key
DJANGO_ALLOWED_HOSTS=*
# Database settings
DB_HOST=db
DB_NAME=palgen_db
DB_USER=palgenuser
DB_PASS=your-db-password
POSTGRES_DB=palgen_db
POSTGRES_USER=palgenuser
POSTGRES_PASSWORD=your-db-password
DOMAIN='http://localhost:8000'
CORS_ORIGINS=http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173
TRUSTED_REFERER=http://localhost:5173
```

Aslo create /frontend/.env.development file with this variables:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📚 API Documentation

API documentation is automatically generated using drf-spectacular and is available at `/api/docs/` when running the development server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Troubleshooting

- **Docker port conflicts**: Check and modify the ports in `docker-compose.yml`
- **Database issues**: Run `docker compose down -v` to clear volumes and start fresh
- **Frontend not connecting to backend**: Ensure `VITE_API_BASE_URL` is set correctly in `.env`

## 📞 Support

For support, please contact [info@webworkstt.com](mailto:info@webworkstt.com)
