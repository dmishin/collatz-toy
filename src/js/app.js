import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

class CollatzApp {
    constructor() {
        this.cy = null;
        this.modulo = 6;
        this.nValue = 3;
        this.mValue = 1;
        this.shortcut = false;
        this.rebuildTimeout = null;
        this.currentLayout = 'dagre'; // Track current layout
        this.init();
    }

    init() {
        cytoscape.use(dagre);
        this.initCytoscape();
        this.bindEvents();
        this.updateRuleDisplay();
        
        // Check if there are URL parameters before building initial graph
        const urlParams = new URLSearchParams(window.location.search);
        const hasGraphData = urlParams.get('graph');
        
        if (hasGraphData) {
            // Load from URL parameters - this will build the graph
            this.loadFromUrl();
        } else {
            // Build graph automatically on page load with default parameters
            this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut);
        }
    }

    initCytoscape() {
        this.cy = cytoscape({
            container: document.getElementById('cy'),
            
            elements: [],
            
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': '#667eea',
                        'label': 'data(label)',
                        'color': '#fff',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'font-size': '12px',
                        'font-weight': 'bold',
                        'width': '60px',
                        'height': '60px',
                        'border-width': '2px',
                        'border-color': '#4a5bd8'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'label': 'data(label)',
                        'color': '#666',
                        'font-size': '10px',
                        'text-rotation': 'autorotate',
                        'text-margin-y': '-10px'
                    }
                },
                {
                    selector: 'edge.dashed',
                    style: {
                        'line-style': 'dashed'
                    }
                },
                {
                    selector: 'node.cycle',
                    style: {
                        'background-color': '#ff6b6b',
                        'border-color': '#ee5a52'
                    }
                },
                {
                    selector: 'edge.cycle',
                    style: {
                        'line-color': '#ff6b6b',
                        'target-arrow-color': '#ff6b6b'
                    }
                },
                {
                    selector: 'node.node-grey',
                    style: {
                        'background-color': '#bbb',
                        'border-color': '#000',
                        'color': '#000',
                        'border-width': '2px'
                    }
                },
                {
                    selector: 'node.node-white',
                    style: {
                        'background-color': '#fff',
                        'border-color': '#000',
                        'color': '#000',
                        'border-width': '2px'
                    }
                },
                {
                    selector: 'node.node-black',
                    style: {
                        'background-color': '#000',
                        'border-color': 'transparent',
                        'color': '#fff',
                        'border-width': '0px'
                    }
                }
            ],
            
            layout: {
                name: 'dagre',
                rankDir: 'TB',
                padding: 30,
                spacingFactor: 1.2
            }
        });
    }

    bindEvents() {
        console.log('Binding events...');
        
        // Check if elements exist
        const modulo = document.getElementById('modulo');
        const nValue = document.getElementById('n-value');
        const mValue = document.getElementById('m-value');
        const shortcut = document.getElementById('shortcut');
        
        console.log('Elements found:', { modulo, nValue, mValue, shortcut });
        
        if (!modulo || !nValue || !mValue || !shortcut) {
            console.error('Some required elements not found!');
            return;
        }
        
        // Input validation and auto-rebuild on every change (with debouncing)
        modulo.addEventListener('input', (e) => {
            if (this.validateAndUpdateModulo(e.target)) {
                this.debouncedRebuild();
            }
        });

        nValue.addEventListener('input', (e) => {
            if (this.validateAndUpdateN(e.target)) {
                this.debouncedRebuild();
            }
        });

        mValue.addEventListener('input', (e) => {
            if (this.validateAndUpdateM(e.target)) {
                this.debouncedRebuild();
            }
        });

        shortcut.addEventListener('change', (e) => {
            this.shortcut = e.target.checked;
            this.updateRuleDisplay();
            this.debouncedRebuild();
        });

        // Export link button
        const exportBtn = document.getElementById('export-link');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLink();
            });
        }

        // Layout button event listeners
        this.bindLayoutButtons();

        // Initialize validation
        this.validateAllInputs();
    }

    debouncedRebuild() {
        // Clear any existing timeout
        if (this.rebuildTimeout) {
            clearTimeout(this.rebuildTimeout);
        }
        
        // Set new timeout for 500ms
        this.rebuildTimeout = setTimeout(() => {
            if (this.validateAllInputs()) {
                console.log('Auto-rebuilding graph after parameter change...');
                this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut);
                
                // Layout is applied directly in buildGraph, no need for additional application
            }
        }, 500);
    }

    bindLayoutButtons() {
        const layoutButtons = [
            { id: 'layout-dagre', layout: 'dagre' },
            { id: 'layout-circle', layout: 'circle' },
            { id: 'layout-grid', layout: 'grid' },
            { id: 'layout-concentric', layout: 'concentric' },
            { id: 'layout-cose', layout: 'cose' },
            { id: 'layout-breadthfirst', layout: 'breadthfirst' },
            { id: 'layout-random', layout: 'random' }
        ];

        layoutButtons.forEach(({ id, layout }) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.applyLayout(layout, true);  // Always animate manual layout changes
                    this.setActiveLayoutButton(id);
                });
            }
        });

        // Set dagre as initial active layout
        this.setActiveLayoutButton('layout-dagre');
    }

    setActiveLayoutButton(activeId) {
        // Remove active class from all layout buttons
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    applyLayout(layoutName, animated = true) {
        console.log(`Applying layout: ${layoutName} (${animated ? 'animated' : 'immediate'})`);
        
        let layoutConfig = {
            name: layoutName,
            fit: true,
            padding: 30,
            animate: animated,
            animationDuration: animated ? 1000 : 0,
            animationEasing: animated ? 'ease-out' : 'none'
        };

        // Customize layout configurations
        switch (layoutName) {
            case 'dagre':
                layoutConfig = {
                    name: 'dagre',
                    rankDir: 'TB',
                    padding: 30,
                    spacingFactor: 1.2,
                    nodeSep: 50,
                    rankSep: 80,
                    animate: animated,
                    animationDuration: animated ? 1000 : 0,
                    animationEasing: animated ? 'ease-out' : 'none'
                };
                break;
            
            case 'circle':
                layoutConfig = {
                    name: 'circle',
                    fit: true,
                    padding: 30,
                    radius: Math.min(400, Math.max(100, this.cy.nodes().length * 20))
                };
                break;
            
            case 'grid':
                layoutConfig = {
                    name: 'grid',
                    fit: true,
                    padding: 30,
                    avoidOverlap: true,
                    rows: Math.ceil(Math.sqrt(this.cy.nodes().length))
                };
                break;
            
            case 'concentric':
                layoutConfig = {
                    name: 'concentric',
                    fit: true,
                    padding: 30,
                    concentric: (node) => node.degree(),
                    levelWidth: () => 1,
                    minNodeSpacing: 50
                };
                break;
            
            case 'cose':
                layoutConfig = {
                    name: 'cose',
                    idealEdgeLength: 100,
                    nodeOverlap: 20,
                    refresh: 20,
                    fit: true,
                    padding: 30,
                    randomize: false,
                    componentSpacing: 100,
                    nodeRepulsion: 400000,
                    edgeElasticity: 100,
                    nestingFactor: 5,
                    gravity: 80,
                    numIter: 1000,
                    initialTemp: 200,
                    coolingFactor: 0.95,
                    minTemp: 1.0,
                    animate: animated ? 'end' : false,  // Special animation mode for physics layouts
                    animationDuration: animated ? 1000 : 0,
                    animationEasing: animated ? 'ease-out' : 'none'
                };
                break;
            
            case 'breadthfirst':
                layoutConfig = {
                    name: 'breadthfirst',
                    fit: true,
                    padding: 30,
                    directed: true,
                    spacingFactor: 1.5,
                    maximal: false
                };
                break;
            
            case 'random':
                layoutConfig = {
                    name: 'random',
                    fit: true,
                    padding: 30
                };
                break;
        }

        // Ensure all layouts have animation properties (except those that handle it specially)
        if (!layoutConfig.hasOwnProperty('animate')) {
            layoutConfig.animate = animated;
            layoutConfig.animationDuration = animated ? 1000 : 0;
            layoutConfig.animationEasing = animated ? 'ease-out' : 'none';
        }

        this.cy.layout(layoutConfig).run();
    }

    exportLink() {
        console.log('Exporting current graph state...');
        
        // Get current parameters
        const params = {
            P: this.modulo,
            N: this.nValue,
            M: this.mValue,
            shortcut: this.shortcut
        };
        
        // Get node positions
        const positions = {};
        this.cy.nodes().forEach(node => {
            const pos = node.position();
            positions[node.id()] = {
                x: Math.round(pos.x * 100) / 100, // Round to 2 decimal places
                y: Math.round(pos.y * 100) / 100
            };
        });
        
        // Create export data
        const exportData = {
            ...params,
            positions: positions
        };
        
        // Encode to URL parameter
        const encodedData = btoa(JSON.stringify(exportData));
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set('graph', encodedData);
        
        const exportUrl = currentUrl.toString();
        console.log('Export URL:', exportUrl);
        
        // Copy to clipboard
        this.copyToClipboard(exportUrl);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Link copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            
            // Fallback: show the URL in a prompt
            prompt('Copy this URL:', text);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#28a745' : '#667eea'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 0.9rem;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    loadFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const graphData = urlParams.get('graph');
        
        if (!graphData) {
            return false; // No saved state found
        }
        
        try {
            const decoded = atob(graphData);
            const data = JSON.parse(decoded);
            
            console.log('Loading graph state from URL:', data);
            
            // Restore parameters
            if (data.P !== undefined) {
                this.modulo = data.P;
                document.getElementById('modulo').value = data.P;
            }
            if (data.N !== undefined) {
                this.nValue = data.N;
                document.getElementById('n-value').value = data.N;
            }
            if (data.M !== undefined) {
                this.mValue = data.M;
                document.getElementById('m-value').value = data.M;
            }
            if (data.shortcut !== undefined) {
                this.shortcut = data.shortcut;
                document.getElementById('shortcut').checked = data.shortcut;
            }
            
            // Update rule display
            this.updateRuleDisplay();
            
            // Rebuild graph with new parameters, but skip automatic layout if we have positions
            this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut, data.positions);
            
            // Restore node positions immediately after graph is built
            if (data.positions) {
                this.restoreNodePositions(data.positions);
            }
            
            this.showNotification('Graph loaded from URL!', 'success');
            
            // Clear URL parameters after successful load
            this.clearUrlParameters();
            
            return true;
        } catch (err) {
            console.error('Failed to load graph from URL:', err);
            this.showNotification('Failed to load graph from URL', 'error');
            return false;
        }
    }

    restoreNodePositions(positions) {
        console.log('Restoring node positions:', positions);
        
        Object.keys(positions).forEach(nodeId => {
            const node = this.cy.getElementById(nodeId);
            if (node.length > 0) {
                const pos = positions[nodeId];
                node.position({ x: pos.x, y: pos.y });
            }
        });
        
        // Fit the graph to show all nodes
        this.cy.fit();
    }

    clearUrlParameters() {
        // Create clean URL without parameters
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('graph');
        
        // Update browser URL without page reload
        window.history.replaceState({}, '', cleanUrl.toString());
        
        console.log('URL parameters cleared');
    }

    validateModulo(input) {
        const value = parseInt(input.value);
        const errorSpan = document.getElementById('modulo-error');
        
        if (isNaN(value) || value < 1 || !Number.isInteger(value)) {
            input.classList.add('invalid');
            errorSpan.textContent = 'Must be a positive integer';
            return false;
        } else {
            input.classList.remove('invalid');
            errorSpan.textContent = '';
            return true;
        }
    }

    validateAndUpdateModulo(input) {
        const value = parseInt(input.value);
        const isValid = this.validateModulo(input);
        if (isValid) {
            this.modulo = value;
            this.updateRuleDisplay();
        }
        return isValid;
    }

    validateN(input) {
        const value = parseInt(input.value);
        const errorSpan = document.getElementById('n-error');
        
        if (isNaN(value) || value % 2 === 0 || !Number.isInteger(value)) {
            input.classList.add('invalid');
            errorSpan.textContent = 'Must be an odd integer';
            return false;
        } else {
            input.classList.remove('invalid');
            errorSpan.textContent = '';
            return true;
        }
    }

    validateAndUpdateN(input) {
        const value = parseInt(input.value);
        const isValid = this.validateN(input);
        if (isValid) {
            this.nValue = value;
            this.updateRuleDisplay();
        }
        return isValid;
    }

    validateM(input) {
        const value = parseInt(input.value);
        const errorSpan = document.getElementById('m-error');
        
        if (isNaN(value) || !Number.isInteger(value) || value % 2 === 0) {
            input.classList.add('invalid');
            errorSpan.textContent = 'Must be an odd integer';
            return false;
        } else {
            input.classList.remove('invalid');
            errorSpan.textContent = '';
            return true;
        }
    }

    validateAndUpdateM(input) {
        const value = parseInt(input.value);
        const isValid = this.validateM(input);
        if (isValid) {
            this.mValue = value;
            this.updateRuleDisplay();
        }
        return isValid;
    }

    validateAllInputs() {
        const moduloValid = this.validateAndUpdateModulo(document.getElementById('modulo'));
        const nValid = this.validateAndUpdateN(document.getElementById('n-value'));
        const mValid = this.validateAndUpdateM(document.getElementById('m-value'));
        
        return moduloValid && nValid && mValid;
    }

    updateRuleDisplay() {
        const oddRule = document.getElementById('odd-rule');
        if (this.shortcut) {
            oddRule.textContent = `When x ≡ 1 mod 2, x ↦ (${this.nValue}x+${this.mValue})/2`;
        } else {
            oddRule.textContent = `When x ≡ 1 mod 2, x ↦ ${this.nValue}x+${this.mValue}`;
        }
    }

    rebuildGraph() {
        if (!this.validateAllInputs()) {
            alert('Please fix validation errors before rebuilding the graph.');
            return;
        }

        this.cy.elements().remove();
        this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut);
    }

    /**
     * Builds a modular arithmetic graph with given parameters
     * @param {number} P - The modulo value (must be >= 1)
     * @param {number} N - The multiplier for odd numbers (must be odd)
     * @param {number} M - The additive constant (must be odd)
     * @param {boolean} shortcut - Whether to apply shortcut (divide by 2 after Nx+M for odd numbers)
     * @param {object} positions - Optional node positions to skip automatic layout
     */
    buildGraph(P, N, M, shortcut, positions = null) {
        // Clear existing graph
        this.cy.elements().remove();

        // Parameter validation
        if (P < 1) {
            alert('P (modulo) must be >= 1');
            return;
        }
        if (N % 2 === 0) {
            alert('N must be an odd integer');
            return;
        }
        if (M % 2 === 0) {
            alert('M must be an odd integer');
            return;
        }

        const nodes = [];
        const edges = [];

        // CYTOSCAPE NODE CREATION EXAMPLES:
        // 
        // 1. Basic node with just an ID and label:
        // this.cy.add({
        //     group: 'nodes',
        //     data: {
        //         id: 'node1',           // Unique identifier
        //         label: 'My Label'      // Text displayed on the node
        //     }
        // });
        //
        // 2. Node with custom styling class:
        // this.cy.add({
        //     group: 'nodes',
        //     data: { id: 'node2', label: 'Special Node' },
        //     classes: 'special-class'   // CSS class for custom styling
        // });

        // Create nodes for i ranging from 0 to P-1
        for (let i = 0; i < P; i++) {
            let nodeClass = '';
            
            if (P % 2 === 1) {
                // P is odd: all nodes are grey circles with black outline and black text
                nodeClass = 'node-grey';
            } else {
                // P is even: even i = white circle with black outline and black text
                //           odd i = black circle with white text and no outline
                nodeClass = (i % 2 === 0) ? 'node-white' : 'node-black';
            }

            nodes.push({
                group: 'nodes',
                data: {
                    id: `n${i}`,
                    label: i.toString()
                },
                classes: nodeClass
            });
        }

        // CYTOSCAPE EDGE CREATION EXAMPLES:
        //
        // 1. Basic edge between two nodes:
        // this.cy.add({
        //     group: 'edges',
        //     data: {
        //         id: 'edge1',           // Unique identifier
        //         source: 'node1',       // ID of source node
        //         target: 'node2',       // ID of target node
        //         label: 'Edge Label'    // Text displayed on the edge
        //     }
        // });

        // Track existing edges to avoid duplicates (source-target-label combinations)
        const existingEdges = new Set();
        let totalAttempts = 0;
        let duplicatesSkipped = 0;
        
        console.log(`Creating edges for P=${P}, N=${N}, M=${M}, shortcut=${shortcut}`);
        
        // Create edges for i ranging from 0 to 2*P-1
        for (let i = 0; i < 2 * P; i++) {
            totalAttempts++;
            let j, label;
            
            if (i % 2 === 0) {
                // Even i: j = i/2
                j = Math.floor(i / 2) % P;
                label = 'x/2';
            } else {
                // Odd i: depends on shortcut
                if (shortcut) {
                    // j = (N*i + M)/2 % P
                    j = Math.floor((N * i + M) / 2) % P;
                    label = `(${N}x+${M})/2`;
                } else {
                    // j = (N*i + M) % P
                    j = (N * i + M) % P;
                    label = `${N}x+${M}`;
                }
            }

            const sourceNode = i % P;  // Source node is i mod P
            const targetNode = j;      // Target node is calculated j
            
            // Create unique key for this edge (source-target-label)
            const edgeKey = `${sourceNode}-${targetNode}-${label}`;
            
            console.log(`i=${i}: ${sourceNode} → ${targetNode} (${label}) | key: ${edgeKey}`);
            
            // Only add edge if this exact combination doesn't already exist
            if (!existingEdges.has(edgeKey)) {
                existingEdges.add(edgeKey);
                
                // Add dashed class for x/2 edges
                const edgeClasses = label === 'x/2' ? 'dashed' : '';
                
                edges.push({
                    group: 'edges',
                    data: {
                        id: `e${sourceNode}-${targetNode}-${edges.length}`,
                        source: `n${sourceNode}`,
                        target: `n${targetNode}`,
                        label: label
                    },
                    classes: edgeClasses
                });
                console.log(`  ✓ Added edge`);
            } else {
                duplicatesSkipped++;
                console.log(`  ✗ Duplicate skipped`);
            }
        }

        console.log(`Summary: ${totalAttempts} attempts, ${edges.length} edges created, ${duplicatesSkipped} duplicates skipped`);
        console.log('Final edges:', edges.map(e => `${e.data.source} → ${e.data.target} (${e.data.label})`));

        // Add all nodes and edges to the graph
        this.cy.add([...nodes, ...edges]);
        
        // Only run layout if no positions are provided (i.e., not loading from URL)
        if (!positions) {
            this.applyLayout(this.currentLayout, false);  // Use current layout without animation
        }
    }

    applyCollatzStep(x, nValue = 3, mValue = 1, shortcut = false) {
        if (x % 2 === 0) {
            return Math.floor(x / 2);
        } else {
            const result = nValue * x + mValue;
            return shortcut ? Math.floor(result / 2) : result;
        }
    }

    generateCollatzGraph(modulo = 2, nValue = 3, mValue = 1, shortcut = false) {
        const startingValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const maxIterations = 50;
        const visited = new Set();
        const nodes = [];
        const edges = [];
        const cycles = new Set();

        for (const start of startingValues) {
            let current = start;
            const path = [current];
            const pathSet = new Set([current]);

            for (let i = 0; i < maxIterations; i++) {
                const next = this.applyCollatzStep(current, nValue, mValue, shortcut);
                
                if (pathSet.has(next)) {
                    // Found a cycle
                    const cycleStart = path.indexOf(next);
                    for (let j = cycleStart; j < path.length; j++) {
                        cycles.add(path[j]);
                    }
                    cycles.add(next);
                    path.push(next);
                    break;
                }

                path.push(next);
                pathSet.add(next);
                current = next;

                if (next === 1) {
                    break;
                }
            }

            // Add nodes and edges from this path
            for (let i = 0; i < path.length; i++) {
                const value = path[i];
                
                if (!visited.has(value)) {
                    nodes.push({
                        group: 'nodes',
                        data: {
                            id: `n${value}`,
                            label: value.toString()
                        },
                        classes: cycles.has(value) ? 'cycle' : ''
                    });
                    visited.add(value);
                }

                if (i < path.length - 1) {
                    const nextValue = path[i + 1];
                    const edgeId = `e${value}-${nextValue}`;
                    
                    if (!edges.some(edge => edge.data.id === edgeId)) {
                        edges.push({
                            group: 'edges',
                            data: {
                                id: edgeId,
                                source: `n${value}`,
                                target: `n${nextValue}`,
                                label: this.getTransitionLabel(value, nextValue, nValue, mValue, shortcut)
                            },
                            classes: cycles.has(value) && cycles.has(nextValue) ? 'cycle' : ''
                        });
                    }
                }
            }
        }

        this.cy.add([...nodes, ...edges]);
        this.applyLayout('dagre', false);  // Use dagre layout without animation for legacy method
    }

    getTransitionLabel(from, to, nValue = 3, mValue = 1, shortcut = false) {
        if (from % 2 === 0) {
            return '÷2';
        } else {
            if (shortcut) {
                return `(${nValue}×+${mValue})÷2`;
            } else {
                return `${nValue}×+${mValue}`;
            }
        }
    }

    runLayout(animated = true) {
        this.cy.layout({
            name: 'dagre',
            rankDir: 'TB',
            padding: 30,
            spacingFactor: 1.2,
            nodeSep: 50,
            rankSep: 80,
            animate: animated,
            animationDuration: animated ? 1000 : 0,
            animationEasing: animated ? 'ease-out' : 'none'
        }).run();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating CollatzApp...');
    new CollatzApp();
});