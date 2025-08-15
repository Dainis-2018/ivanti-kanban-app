# Ivanti Kanban App

A modern Kanban project management application built with Vue.js and Syncfusion components for managing Projects → Milestones → Tasks workflow.

## Features

- **Three-level hierarchy**: Projects → Milestones → Tasks
- **Multiple views**: List, Card, and Roadmap views for projects
- **Kanban board**: Drag-and-drop task management
- **Rich text editing**: Task descriptions with full formatting
- **Team management**: Assign tasks to teams and individual users
- **Real-time updates**: Live data synchronization
- **Responsive design**: Works on desktop, tablet, and mobile
- **Multi-language support**: Internationalization ready
- **OData integration**: RESTful API with advanced querying

## Tech Stack

- **Frontend**: Vue.js 3, Composition API
- **State Management**: Pinia
- **UI Components**: Syncfusion Vue Components
- **Routing**: Vue Router
- **API Client**: Axios
- **Notifications**: Vue Toastification
- **Build Tool**: Vite
- **Styling**: CSS3 with custom variables

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Syncfusion license key (for production use)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ivanti-kanban-app.git
   cd ivanti-kanban-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.development.local.example .env.development.local
   # Edit .env.development.local with your settings
   ```

4. **Register Syncfusion license** (if you have a license)
   ```bash
   npm run syncfusion-license
   ```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
ivanti-kanban-app/
├── public/
│   └── locales/          # Translation files
├── src/
│   ├── assets/           # Static assets and styles
│   ├── components/       # Vue components
│   │   ├── common/       # Shared components
│   │   ├── projects/     # Project-related components
│   │   ├── milestones/   # Milestone components
│   │   └── tasks/        # Task management components
│   ├── composables/      # Vue composition functions
│   ├── services/         # API and business logic
│   ├── stores/           # Pinia state management
│   ├── utils/            # Utility functions
│   ├── views/            # Route components
│   └── router/           # Vue Router configuration
├── dist/                 # Build output
└── README.md
```

## API Integration

The app integrates with OData REST APIs:

- **Projects**: `/api/odata/businessObject/frs_projects`
- **Milestones**: `/api/odata/businessObject/frs_prj_phases`
- **Tasks**: `/api/odata/businessObject/task__assignments`
- **Teams**: `/api/odata/businessObject/standarduserteams`

Configure your API endpoints in the environment variables.

## Deployment

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your web server

### Package for Distribution

Create a deployment package:
```bash
npm run deploy
```

This creates `ivanti-kanban-app.tar.gz` ready for deployment.

## Configuration

### Environment Variables

- `VITE_API_BASE_URL`: Base URL for your API
- `VITE_API_KEY`: API authentication key
- `VITE_SYNCFUSION_LICENSE_KEY`: Syncfusion license key
- `VITE_ODATA_ENDPOINT`: OData endpoint path

### Proxy Configuration

For development, the app uses Vite's proxy to connect to your backend:

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://ivanti/HEAT/',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
```

## Customization

### Theming

Customize the application theme by modifying:
- `src/assets/styles/main.css` - Main application styles
- `src/assets/styles/syncfusion-theme.css` - Syncfusion component customizations

### Localization

Add new languages by creating translation files in `public/locales/`:
- `en.json` - English (default)
- `de.json` - German
- `fr.json` - French

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release
- Project, Milestone, and Task management
- Kanban board implementation
- Multi-view support
- OData API integration
- Responsive design
- Internationalization support