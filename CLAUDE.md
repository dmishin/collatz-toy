# Collatz mod P - Project Overview

This is an interactive web application for visualizing generalized Collatz processes modulo P as directed graphs. Built with vanilla JavaScript, Cytoscape.js for 2D graphs, and 3D-Force-Graph for 3D visualization.

## Important Source Files

### Core Application Files
- **`index.html`** - Main application page with UI controls and graph container
- **`src/js/app.js`** - Main application logic (CollatzApp class with all functionality)
- **`src/css/style.css`** - Complete styling for the application interface
- **`3d.html`** - 3D visualization page with separate 3D graph implementation
- **`help.html`** - Comprehensive help documentation and mathematical background

### Configuration Files
- **`package.json`** - Node.js dependencies and build scripts
- **`vite.config.js`** - Vite build tool configuration
- **`CLAUDE.md`** - Project documentation for AI assistant
- **`README.md`** - User-facing project documentation

## Core Features and Implementing Functions

### Graph Visualization (`src/js/app.js`)
- **Graph Building**: `buildGraph(P, N, M, shortcut, positions)` - Creates nodes and edges for modular Collatz process
- **Cytoscape Initialization**: `initCytoscape()` - Sets up 2D graph with styling and layout
- **3D Visualization**: `show3D()` - Opens 3D view in new window

### Layout Management
- **Layout Application**: `applyLayout(layoutName, animated)` - Applies different layout algorithms
- **Layout Configuration**: `getLayoutConfig(layoutName, animated)` - Returns layout-specific parameters
- **Layout Button Binding**: `bindLayoutButtons()` - Sets up event handlers for layout controls

### Transform Controls
- **Scaling**: `scaleLayout(factor)` - Scales graph layout up/down
- **Rotation**: `rotateLayout(degrees)` - Rotates layout by specified degrees (±10°)
- **Flipping**: `flipLayout(direction)` - Flips layout horizontally or vertically

### Parameter Management
- **Input Validation**: `validateAndUpdateModulo()`, `validateAndUpdateN()`, `validateAndUpdateM()`
- **Auto-rebuild**: `debouncedRebuild()` - Rebuilds graph after parameter changes
- **Rule Display**: `updateRuleDisplay()` - Updates mathematical formula display

### Cycle Analysis
- **Cycle Search**: `searchCyclesModified(n, m, range, maxValue, useShortcut)` - Finds cycles in Collatz process
- **Cycle Display**: `displayCycles()` - Shows found cycles in UI list
- **Cycle Highlighting**: `drawCyclePath(numbers)` - Draws cycle path overlay on graph

### Export/Import Features
- **Link Export**: `exportLink()` - Creates shareable URL with graph state
- **PNG Export**: `exportSvg()` - Exports graph as PNG image
- **URL Loading**: `loadFromUrl()` - Restores graph from URL parameters
- **Position Management**: `restoreNodePositions(positions)` - Restores saved node positions

### Manipulation Tools
- **Modulo Doubling**: `doubleModulo()` - Doubles P while preserving layout
- **Modulo Halving**: `halveModulo()` - Halves P (requires even P)
- **Symmetrization**: `makeSymmetric()` - Applies central symmetry (requires P = power of 2)
- **Manual Cycles**: `showCycle()` - Allows manual cycle input and highlighting

### Label and Display Controls
- **Label Toggles**: `toggleNodeLabels(show)`, `toggleEdgeLabels(show)`
- **Notifications**: `showNotification(message, type)` - Shows user feedback

### Mathematical Core Functions
- **Modular Arithmetic**: `mod(a, b)` - Proper modulo operation
- **W-Function**: `makeWFunction(p, n, m)` - Creates W-function for De Bruijn graphs
- **Cycle Search**: `searchCycles(n, m, range, maxValue)` - Legacy cycle search function

## Available Layout Algorithms
1. **Dagre (Tree)** - Hierarchical directed graph layout
2. **Circle** - Circular arrangement
3. **Grid** - Grid-based positioning
4. **Concentric** - Concentric circles by node degree
5. **Force-Directed (COSE)** - Physics-based layout
6. **Breadth-First** - Tree layout from root
7. **Spectral** - Eigenvalue-based layout (custom COSE configuration)
8. **Random** - Random positioning

## Key Technologies
- **2D Graphs**: Cytoscape.js with dagre extension
- **3D Graphs**: 3D-Force-Graph library
- **Build Tool**: Vite for development and production builds
- **Math Rendering**: MathML for mathematical formulas
- **Styling**: Pure CSS with flexbox and grid layouts