# Homie - Smart Home Assistant

A conversational AI assistant for controlling your Home Assistant smart home devices.

## Features

- 🎤 Voice input support
- 🎵 Music playback via Music Assistant
- 💡 Light control and scenes
- 🌡️ Climate control
- 🔧 Real-time tool usage visualization
- 📱 Mobile-friendly interface

## Quick Start with Docker

### Using Docker Compose (Recommended)

```bash
# Create .env file
cat > .env << EOF
HOME_ASSISTANT_URL=https://your-home-assistant.duckdns.org
HOME_ASSISTANT_TOKEN=your_long_lived_access_token
JELLYFIN_URL=https://your-jellyfin-server.com
JELLYFIN_API_KEY=your_jellyfin_api_key
JELLYFIN_USERNAME=your_jellyfin_username
JELLYFIN_PASSWORD=your_jellyfin_password
EOF

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Using Docker directly

```bash
docker run -d \
  --name homie \
  -p 3000:3000 \
  -e HOME_ASSISTANT_URL=https://your-ha.duckdns.org \
  -e HOME_ASSISTANT_TOKEN=your_token \
  mrorbitman/homie:main
```

### Using pre-built image from Docker Hub

```bash
docker pull mrorbitman/homie:main
```

Open [http://localhost:3000](http://localhost:3000)

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

- `HOME_ASSISTANT_URL` - Your Home Assistant URL
- `HOME_ASSISTANT_TOKEN` - Long-lived access token from Home Assistant
- `MUSIC_ASSISTANT_URL` - (Optional) Music Assistant server URL for full queue display

Get your token from Home Assistant:

1. Go to Profile → Security → Long-Lived Access Tokens
2. Click "Create Token"
3. Copy the token

## GitHub Actions Setup

Images are automatically built and pushed to Docker Hub on:

- Push to `main` branch → tagged as `main`
- Version tags (e.g., `v1.0.0`) → tagged as `1.0.0` and `1.0`

## License

MIT
