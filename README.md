# Collatz mod P - Interactive Graph Visualizer

An interactive web application for visualizing generalized [Collatz processes](https://en.wikipedia.org/wiki/Collatz_conjecture) modulo P as directed graphs. This tool explores how different parameters (N, M, shortcut) affect the structure of these fascinating mathematical sequences.

## What is it?

This application generalizes the famous [Collatz conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture) by allowing custom parameters and visualizing the resulting [directed graph](https://en.wikipedia.org/wiki/Directed_graph) modulo P.

### Mathematical Background

The standard Collatz conjecture involves iterating the function:
- If x is even: x → x/2  
- If x is odd: x → 3x + 1

This application generalizes this to **Nx + M** for odd numbers and visualizes the resulting dynamics on [residue classes](https://en.wikipedia.org/wiki/Modular_arithmetic) modulo P.

The generalized Collatz function is:
```
f(x) = { x/2           if x ≡ 0 (mod 2)
       { Nx + M        if x ≡ 1 (mod 2)
```

With optional "shortcut" mode:
```
f(x) = { x/2           if x ≡ 0 (mod 2)  
       { (Nx + M)/2    if x ≡ 1 (mod 2)
```

### Graph Interpretation

- **Nodes**: Represent [residue classes](https://en.wikipedia.org/wiki/Equivalence_class) modulo P, labeled 0 to P-1. Each node [i] represents all integers congruent to i modulo P.
- **Edges**: Represent function transitions between residue classes according to the generalized Collatz rules.
- **Solid edges**: Transitions from odd residue classes via Nx + M (or (Nx + M)/2 if shortcut is enabled)
- **Dashed edges**: Transitions from even residue classes via x/2

### Node Colors (Parity Indication)
- **When P is odd**: All nodes are grey (parity is not well-defined since both even and odd numbers can belong to the same residue class)
- **When P is even**:
  - **White nodes**: Even residue classes (contain only even numbers)
  - **Black nodes**: Odd residue classes (contain only odd numbers)

## Parameters

- **Modulo (P)**: The modular arithmetic base. All calculations are done modulo P.
- **N**: Multiplier for odd numbers (must be odd to ensure the function is well-defined)
- **M**: Additive constant for odd numbers (must be odd to ensure odd numbers map to even numbers)  
- **Shortcut**: When enabled, applies **(Nx + M)/2** instead of **Nx + M** for odd numbers. This simulates the "shortcut" optimization used in Collatz analysis, where since Nx + M is always even (when x is odd and N,M are odd), we can immediately divide by 2.

## Features

### Interactive Visualization
- **2D Graph**: Multiple layout algorithms (Dagre, Circle, Grid, Concentric, Force-Directed, Breadth-First, Spectral, Random)
- **3D Visualization**: Explore complex structures in three dimensions
- **Layout Controls**: Scale, rotate (10° increments), and flip graphs horizontally/vertically
- **Real-time Updates**: Graph rebuilds automatically as you change parameters

### Cycle Analysis
- **Search**: Find cycles in the current Collatz process
- **Click Cycle**: Highlight cycle paths on the graph
- **Show Cycle**: Manually input and highlight specific cycles

### Manipulation Tools
- **P→2P**: Double the modulo while preserving layout
- **2P→P**: Halve the modulo (P must be even)
- **Symmetrize**: Apply central symmetry (requires P to be a power of 2)
- **Export**: Save as PNG images or create shareable links

### Special Cases
When P is a power of 2, the graph becomes a [De Bruijn graph](https://en.wikipedia.org/wiki/De_Bruijn_graph), and the symmetrize function applies a special transformation based on binary representations.

## Building and Running

### Prerequisites
- [Node.js](https://nodejs.org/) (version 14 or higher)
- npm (comes with Node.js)

### Local Development
```bash
# Clone the repository
git clone https://github.com/dmishin/collatz-toys.git
cd collatz-toys

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Build for Production
```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Built files will be in the dist/ directory
```

### Deploy
Copy the contents of `dist/` to your web server:
```
dist/
├── index.html
├── help.html  
├── 3d.html
└── assets/
    ├── main-[hash].js
    └── style-[hash].css
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **2D Graphs**: [Cytoscape.js](https://cytoscape.org/) with Dagre layout
- **3D Graphs**: [3D-Force-Graph](https://github.com/vasturiano/3d-force-graph)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Math**: MathML for formula rendering

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.
