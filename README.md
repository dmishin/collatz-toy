# Interactive Graph Application

A single-page web application for creating and manipulating interactive graphs with nodes and edges. Built with Cytoscape.js and Vite.

## Features

- **Interactive Graph Visualization**: Create, edit, and visualize graphs with labeled nodes and edges
- **Node Management**: Add nodes with custom labels, select and remove nodes
- **Edge Management**: Create edges between selected nodes with optional labels
- **Graph Controls**: 
  - Toggle between directed and undirected graphs
  - Show/hide labels
  - Randomize layout
  - Clear entire graph
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Interactive editing with immediate visual feedback

## Prerequisites

- Node.js 18.x or higher
- npm (comes with Node.js)

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server with hot reloading:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Building for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be generated in the `dist/` directory.

## Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist/` directory to your hosting service.

### Manual Deployment

1. Run the build command
2. Copy all files from the `dist/` directory to your web server
3. Serve the files using any static file server

## Project Structure

```
├── index.html          # Main HTML file
├── package.json        # Project dependencies and scripts
├── src/
│   ├── css/
│   │   └── style.css   # Application styles
│   └── js/
│       └── app.js      # Main application logic
└── dist/               # Production build output (generated)
```

## Usage

1. **Adding Nodes**: Enter a label and click "Add Node" or press Enter
2. **Adding Edges**: Select two nodes, optionally enter an edge label, then click "Add Edge"
3. **Removing Elements**: Select nodes or edges and click the respective remove button
4. **Graph Options**:
   - **Show Labels**: Toggle visibility of node and edge labels
   - **Directed Graph**: Switch between directed and undirected edges
   - **Randomize Layout**: Randomly repositions all nodes
   - **Clear Graph**: Removes all nodes and edges

## Dependencies

- **cytoscape**: Graph theory library for visualization and analysis
- **vite**: Build tool and development server

## Browser Support

Modern browsers that support ES6+ features:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

ISC