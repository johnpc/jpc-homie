# Homie - Smart Home Assistant

A conversational AI assistant for controlling your Home Assistant smart home devices.

## Features

- 🎤 Voice input support
- 🎵 Music playback via Music Assistant
- 💡 Light control and scenes
- 🌡️ Climate control
- 🔧 Real-time tool usage visualization
- 📱 Mobile-friendly interface

## Quick Start

### Docker (Recommended)

```bash
# Create .env file
cp .env.example .env
# Edit .env with your Home Assistant URL and token

# Run with Docker Compose
docker-compose up -d

# Or run directly
docker run -d \
  -p 3000:3000 \
  -e HOME_ASSISTANT_URL=https://your-ha.duckdns.org \
  -e HOME_ASSISTANT_TOKEN=your_token \
  your-dockerhub-username/homie:latest
```

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `HOME_ASSISTANT_URL` - Your Home Assistant URL
- `HOME_ASSISTANT_TOKEN` - Long-lived access token from Home Assistant

## GitHub Actions Setup

To enable automatic Docker Hub publishing:

1. Go to your GitHub repository Settings → Secrets and variables → Actions
2. Add these secrets:
   - `DOCKERHUB_USERNAME` - Your Docker Hub username
   - `DOCKERHUB_TOKEN` - Docker Hub access token (create at hub.docker.com/settings/security)

Images will be automatically built and pushed on:
- Push to `main` branch
- Version tags (e.g., `v1.0.0`)

## License

MIT
