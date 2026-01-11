# Crunch! - Music Streaming Addon

![Crunch Logo](https://files.catbox.moe/kftzeo.png)

Crunch is a lightweight Stremio addon that enables users to discover and stream user-uploaded music content from SoundCloud.

## Features

- **Music Search**: Find your favorite tracks directly in Stremio.
- **Rich Metadata**: High-quality posters, descriptions, and track info.
- **High-Quality Streaming**: Direct audio streaming with persistent playback.
- **One-Click Install**: Seamless installation flow through the web landing page.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Stremio](https://www.stremio.com/) installed on your device

### Installation (Local Development)

1. Clone the repository:
   ```bash
   git clone https://github.com/trliy/Crunch.git
   cd Crunch
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The landing page will be available at `http://localhost:5000`.

### Deployment to Render

This project is pre-configured for deployment on [Render](https://render.com).

1. Connect your GitHub repository to Render.
2. Create a new **Blueprint** service.
3. Render will automatically detect the `render.yaml` file and set up:
   - A Web Service for the addon.
   - A PostgreSQL database for caching.

## Configuration

The following environment variables can be configured:

- `DATABASE_URL`: PostgreSQL connection string (required).
- `PORT`: Port to run the server on (default: 5000).

## License

# Released under MIT License

Copyright (c) 2013 Mark Otto.

Copyright (c) 2017 Andrew Fong.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
