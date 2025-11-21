# Collatz mod P - Interactive Graph Visualizer

An interactive web application for visualizing generalized Collatz processes modulo P as directed graphs. Explore how different parameters (N, M, shortcut) affect the structure of these mathematical sequences.

## 🌐 Live Demo

**Try it online:** [https://dmishin.github.io/collatz-toy/](https://dmishin.github.io/collatz-toy/)

## 📖 What is it?

This application generalizes the famous [Collatz conjecture](https://en.wikipedia.org/wiki/Collatz_conjecture) by allowing custom parameters:
- **Standard Collatz**: If odd, multiply by 3 and add 1; if even, divide by 2
- **Generalized**: If odd, multiply by N and add M; if even, divide by 2
- **Modular arithmetic**: All operations performed modulo P

The visualization shows how numbers flow between residue classes, revealing cycles, attractors, and mathematical structures.

## ✨ Features

- **Interactive 2D graph** with multiple layout algorithms
- **3D visualization** for exploring complex structures  
- **Cycle detection** and highlighting
- **Parameter manipulation** tools (double/halve modulo, symmetrize)
- **Export capabilities** (PNG images, shareable links)
- **Real-time updates** as you change parameters
- **Responsive design** works on desktop and mobile

## 🤖 Development Note

This project was created almost entirely through AI-assisted development using **Claude (Anthropic)**. The mathematical concepts, UI design, interactive features, and 3D visualization were all implemented through natural language conversations with the AI assistant.

## 🚀 Build Instructions

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

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **2D Graphs**: [Cytoscape.js](https://cytoscape.org/) with Dagre layout
- **3D Graphs**: [3D-Force-Graph](https://github.com/vasturiano/3d-force-graph)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Math**: MathML for formula rendering

## 🧮 Mathematical Background

The application explores the dynamics of the generalized Collatz function:
```
f(x) = { x/2           if x ≡ 0 (mod 2)
       { Nx + M        if x ≡ 1 (mod 2)
```

With optional "shortcut" mode:
```
f(x) = { x/2           if x ≡ 0 (mod 2)  
       { (Nx + M)/2    if x ≡ 1 (mod 2)
```

All operations are performed modulo P, creating finite directed graphs that reveal the underlying structure of these sequences.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

While this was primarily an AI-assisted development experiment, contributions are welcome! Please feel free to open issues or submit pull requests.