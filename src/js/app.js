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

    // Mathematical modulo that always returns positive result in [0, b-1]
    mod(a, b) {
        return ((a % b) + b) % b;
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
            this.debouncedRebuildPreserveLayout();
        });

        // Export link button
        const exportBtn = document.getElementById('export-link');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLink();
            });
        }

        // Export SVG button
        const exportSvgBtn = document.getElementById('export-svg');
        if (exportSvgBtn) {
            exportSvgBtn.addEventListener('click', () => {
                this.exportSvg();
            });
        }

        // Double modulo button
        const doubleBtn = document.getElementById('double-modulo');
        if (doubleBtn) {
            doubleBtn.addEventListener('click', () => {
                this.doubleModulo();
            });
        }

        // Halve modulo button
        const halveBtn = document.getElementById('halve-modulo');
        if (halveBtn) {
            halveBtn.addEventListener('click', () => {
                this.halveModulo();
            });
        }

        // Symmetrize button
        const symmetryBtn = document.getElementById('make-symmetric');
        if (symmetryBtn) {
            symmetryBtn.addEventListener('click', () => {
                this.makeSymmetric();
            });
        }

        // Show cycle button
        const cycleBtn = document.getElementById('show-cycle');
        if (cycleBtn) {
            cycleBtn.addEventListener('click', () => {
                this.showCycle();
            });
        }

        // Label visibility toggles
        const nodeLabelsCheckbox = document.getElementById('show-node-labels');
        if (nodeLabelsCheckbox) {
            nodeLabelsCheckbox.addEventListener('change', (e) => {
                this.toggleNodeLabels(e.target.checked);
            });
        }

        const edgeLabelsCheckbox = document.getElementById('show-edge-labels');
        if (edgeLabelsCheckbox) {
            edgeLabelsCheckbox.addEventListener('change', (e) => {
                this.toggleEdgeLabels(e.target.checked);
            });
        }

        // Scale buttons
        const scaleUpBtn = document.getElementById('scale-up');
        if (scaleUpBtn) {
            scaleUpBtn.addEventListener('click', () => {
                this.scaleLayout(1.2);
            });
        }

        const scaleDownBtn = document.getElementById('scale-down');
        if (scaleDownBtn) {
            scaleDownBtn.addEventListener('click', () => {
                this.scaleLayout(0.83);
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

    debouncedRebuildPreserveLayout() {
        // Clear any existing timeout
        if (this.rebuildTimeout) {
            clearTimeout(this.rebuildTimeout);
        }
        
        // Set new timeout for 500ms
        this.rebuildTimeout = setTimeout(() => {
            if (this.validateAllInputs()) {
                console.log('Auto-rebuilding graph with preserved layout...');
                
                // Store current node positions
                const positions = {};
                this.cy.nodes().forEach(node => {
                    const pos = node.position();
                    positions[node.id()] = { x: pos.x, y: pos.y };
                });
                
                // Rebuild graph
                this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut, positions);
                
                // Restore positions immediately
                this.restoreNodePositions(positions);
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
        const layoutConfig = this.getLayoutConfig(layoutName, animated);
        this.cy.layout(layoutConfig).run();
    }

    getLayoutConfig(layoutName, animated = true) {
        const baseConfig = {
            fit: true,
            padding: 30,
            animate: animated,
            animationDuration: animated ? 1000 : 0,
            animationEasing: animated ? 'ease-out' : 'none'
        };

        switch (layoutName) {
            case 'dagre':
                return { ...baseConfig, name: 'dagre', rankDir: 'TB', spacingFactor: 1.2, nodeSep: 50, rankSep: 80 };
            case 'circle':
                return { ...baseConfig, name: 'circle', radius: Math.min(400, Math.max(100, this.cy.nodes().length * 20)) };
            case 'grid':
                return { ...baseConfig, name: 'grid', avoidOverlap: true, rows: Math.ceil(Math.sqrt(this.cy.nodes().length)) };
            case 'concentric':
                return { ...baseConfig, name: 'concentric', concentric: (node) => node.degree(), levelWidth: () => 1, minNodeSpacing: 50 };
            case 'cose':
                return {
                    ...baseConfig, name: 'cose', idealEdgeLength: 100, nodeOverlap: 20, refresh: 20,
                    randomize: false, componentSpacing: 100, nodeRepulsion: 400000, edgeElasticity: 100,
                    nestingFactor: 5, gravity: 80, numIter: 1000, initialTemp: 200, coolingFactor: 0.95,
                    minTemp: 1.0, animate: animated ? 'end' : false
                };
            case 'breadthfirst':
                return { ...baseConfig, name: 'breadthfirst', directed: true, spacingFactor: 1.5, maximal: false };
            case 'random':
                return { ...baseConfig, name: 'random' };
            default:
                return { ...baseConfig, name: layoutName };
        }
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

    validateInput(input, validationFn, errorMessage, propertyName, errorId) {
        const value = parseInt(input.value);
        const errorSpan = document.getElementById(errorId);
        
        if (isNaN(value) || !Number.isInteger(value) || !validationFn(value)) {
            input.classList.add('invalid');
            errorSpan.textContent = errorMessage;
            return false;
        } else {
            input.classList.remove('invalid');
            errorSpan.textContent = '';
            if (propertyName) {
                this[propertyName] = value;
                this.updateRuleDisplay();
            }
            return true;
        }
    }

    validateAndUpdateModulo(input) {
        return this.validateInput(input, (v) => v >= 1, 'Must be a positive integer', 'modulo', 'modulo-error');
    }

    validateAndUpdateN(input) {
        return this.validateInput(input, (v) => Math.abs(v) % 2 === 1, 'Must be an odd integer', 'nValue', 'n-error');
    }

    validateAndUpdateM(input) {
        return this.validateInput(input, (v) => Math.abs(v) % 2 === 1, 'Must be an odd integer', 'mValue', 'm-error');
    }

    validateAllInputs() {
        const moduloValid = this.validateAndUpdateModulo(document.getElementById('modulo'));
        const nValid = this.validateAndUpdateN(document.getElementById('n-value'));
        const mValid = this.validateAndUpdateM(document.getElementById('m-value'));
        
        return moduloValid && nValid && mValid;
    }

    updateRuleDisplay() {
        const oddRuleMath = document.getElementById('odd-rule-math');
        if (!oddRuleMath) return;
        
        // Update the first cell (the formula)
        const formulaCell = oddRuleMath.querySelector('mtd:first-child');
        if (formulaCell) {
            // Handle sign for M value
            const mSign = this.mValue >= 0 ? '+' : '−';
            const mAbs = Math.abs(this.mValue);
            
            if (this.shortcut) {
                // (Nx + M)/2 formula
                formulaCell.innerHTML = `
                    <mfrac>
                        <mrow>
                            <mn>${this.nValue}</mn>
                            <mi>x</mi>
                            <mo>${mSign}</mo>
                            <mn>${mAbs}</mn>
                        </mrow>
                        <mn>2</mn>
                    </mfrac>
                `;
            } else {
                // Nx + M formula
                formulaCell.innerHTML = `
                    <mn>${this.nValue}</mn>
                    <mi>x</mi>
                    <mo>${mSign}</mo>
                    <mn>${mAbs}</mn>
                `;
            }
        }
        
        // Update the condition cell for the second row
        const conditionCell = oddRuleMath.querySelector('mtd:last-child');
        if (conditionCell) {
            conditionCell.innerHTML = `
                <mspace width="1em"/>
                <mtext>if </mtext>
                <mi>x</mi>
                <mo>≡</mo>
                <mn>1</mn>
                <mspace width="0.3em"/>
                <mo>mod</mo>
                <mspace width="0.3em"/>
                <mn>2</mn>
            `;
        }
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
                j = this.mod(Math.floor(i / 2), P);
                label = 'x/2';
            } else {
                // Odd i: depends on shortcut
                if (shortcut) {
                    // j = (N*i + M)/2 % P
                    j = this.mod(Math.floor((N * i + M) / 2), P);
                    label = `(${N}x+${M})/2`;
                } else {
                    // j = (N*i + M) % P
                    j = this.mod(N * i + M, P);
                    label = `${N}x+${M}`;
                }
            }

            const sourceNode = this.mod(i, P);  // Source node is i mod P
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

    doubleModulo() {
        if (!this.validateAllInputs()) {
            alert('Please fix validation errors before doubling modulo.');
            return;
        }

        console.log('Doubling modulo from', this.modulo, 'to', this.modulo * 2);
        
        // Store current node positions
        const oldPositions = {};
        this.cy.nodes().forEach(node => {
            const pos = node.position();
            const nodeId = parseInt(node.id().replace('n', ''));
            oldPositions[nodeId] = { x: pos.x, y: pos.y };
        });
        
        // Double the modulo value
        const oldModulo = this.modulo;
        this.modulo = this.modulo * 2;
        document.getElementById('modulo').value = this.modulo;
        
        // Calculate new positions for the doubled graph
        const newPositions = {};
        
        // For even nodes in the new graph: map from old positions
        for (let i = 0; i < this.modulo; i += 2) {
            const oldNode = Math.floor(i / 2);
            if (oldPositions[oldNode]) {
                newPositions[i] = oldPositions[oldNode];
            }
        }
        
        // For odd nodes in the new graph: calculate average of two related even nodes
        for (let n = 1; n < this.modulo; n += 2) {
            const pos1Node = (2 * n) % this.modulo;
            const pos2Node = this.mod(this.nValue * n + this.mValue, this.modulo);
            
            let avgPos = null;
            
            if (newPositions[pos1Node] && newPositions[pos2Node]) {
                // Both reference positions exist, calculate average
                avgPos = {
                    x: (newPositions[pos1Node].x + newPositions[pos2Node].x) / 2,
                    y: (newPositions[pos1Node].y + newPositions[pos2Node].y) / 2
                };
            } else if (newPositions[pos1Node]) {
                // Only first reference exists
                avgPos = { ...newPositions[pos1Node] };
            } else if (newPositions[pos2Node]) {
                // Only second reference exists  
                avgPos = { ...newPositions[pos2Node] };
            }
            
            if (avgPos) {
                newPositions[n] = avgPos;
            }
        }
        
        console.log(`Mapped ${Object.keys(oldPositions).length} old positions to ${Object.keys(newPositions).length} new positions`);
        
        // Rebuild graph with new modulo and apply calculated positions
        this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut, newPositions);
        
        // Restore the calculated positions
        Object.keys(newPositions).forEach(nodeId => {
            const node = this.cy.getElementById(`n${nodeId}`);
            if (node.length > 0) {
                const pos = newPositions[nodeId];
                node.position({ x: pos.x, y: pos.y });
            }
        });
        
        // Fit the graph to show all nodes
        this.cy.fit();
        
        this.showNotification(`Modulo doubled from ${oldModulo} to ${this.modulo}!`, 'success');
    }

    exportSvg() {
        console.log('Exporting graph as PNG...');
        
        try {
            // Get PNG representation of the graph
            const pngContent = this.cy.png({ scale: 2, full: true, bg: 'white' });
            
            // Create download link
            const link = document.createElement('a');
            link.href = pngContent;
            link.download = `collatz-graph-P${this.modulo}-N${this.nValue}-M${this.mValue}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showNotification('PNG exported successfully!', 'success');
        } catch (err) {
            console.error('PNG export failed:', err);
            this.showNotification('Image export failed', 'error');
        }
    }

    scaleLayout(factor) {
        console.log(`Scaling layout by factor: ${factor}`);
        
        // Get center point of current layout
        const nodes = this.cy.nodes();
        if (nodes.length === 0) return;
        
        let centerX = 0, centerY = 0;
        nodes.forEach(node => {
            const pos = node.position();
            centerX += pos.x;
            centerY += pos.y;
        });
        centerX /= nodes.length;
        centerY /= nodes.length;
        
        // Scale each node's position relative to center
        nodes.forEach(node => {
            const pos = node.position();
            const newX = centerX + (pos.x - centerX) * factor;
            const newY = centerY + (pos.y - centerY) * factor;
            node.position({ x: newX, y: newY });
        });
        
        // Fit the graph to show all nodes after scaling
        this.cy.fit();
        
        this.showNotification(`Layout scaled ${factor > 1 ? 'up' : 'down'}!`, 'success');
    }

    makeSymmetric() {
        console.log('Making layout centrally symmetric...');
        
        const nodes = this.cy.nodes();
        if (nodes.length === 0) return;
        
        // Calculate center of mass of all nodes
        let centerX = 0, centerY = 0;
        nodes.forEach(node => {
            const pos = node.position();
            centerX += pos.x;
            centerY += pos.y;
        });
        centerX /= nodes.length;
        centerY /= nodes.length;
        
        console.log(`Center of mass: (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
        
        // For each pair (x, N-1-x), make them symmetric around center
        const P = this.modulo;
        const processedPairs = new Set();
        
        for (let x = 0; x < P; x++) {
            const partner = (P - 1 - x) % P;
            
            // Skip if we already processed this pair
            const pairKey = `${Math.min(x, partner)}-${Math.max(x, partner)}`;
            if (processedPairs.has(pairKey)) continue;
            processedPairs.add(pairKey);
            
            const nodeX = this.cy.getElementById(`n${x}`);
            const nodePartner = this.cy.getElementById(`n${partner}`);
            
            if (nodeX.length === 0 || nodePartner.length === 0) continue;
            
            if (x === partner) {
                // Self-symmetric node (only when P is odd and x = (P-1)/2)
                // Place it exactly at center of mass
                nodeX.position({ x: centerX, y: centerY });
                console.log(`Centered self-symmetric node ${x} at (${centerX.toFixed(1)}, ${centerY.toFixed(1)})`);
            } else {
                // Get current positions
                const posX = nodeX.position();
                const posPartner = nodePartner.position();
                
                // Calculate current midpoint
                const midX = (posX.x + posPartner.x) / 2;
                const midY = (posX.y + posPartner.y) / 2;
                
                // Calculate displacement to center the midpoint on center of mass
                const displaceX = centerX - midX;
                const displaceY = centerY - midY;
                
                // Apply symmetric displacement
                const newPosX = { x: posX.x + displaceX, y: posX.y + displaceY };
                const newPosPartner = { x: posPartner.x + displaceX, y: posPartner.y + displaceY };
                
                nodeX.position(newPosX);
                nodePartner.position(newPosPartner);
                
                console.log(`Symmetrized pair (${x}, ${partner}): midpoint moved by (${displaceX.toFixed(1)}, ${displaceY.toFixed(1)})`);
            }
        }
        
        // Fit the graph to show all nodes after symmetrizing
        this.cy.fit();
        
        this.showNotification('Layout made symmetric!', 'success');
    }

    halveModulo() {
        if (!this.validateAllInputs()) {
            alert('Please fix validation errors before halving modulo.');
            return;
        }

        if (this.modulo % 2 !== 0) {
            alert('Modulo must be even to halve it.');
            return;
        }

        if (this.modulo < 2) {
            alert('Modulo must be at least 2 to halve it.');
            return;
        }

        console.log('Halving modulo from', this.modulo, 'to', this.modulo / 2);
        
        // Store current positions of even nodes only
        const evenPositions = {};
        this.cy.nodes().forEach(node => {
            const nodeId = parseInt(node.id().replace('n', ''));
            if (nodeId % 2 === 0) {
                const pos = node.position();
                const newNodeId = nodeId / 2; // Map even node to its half
                evenPositions[newNodeId] = { x: pos.x, y: pos.y };
            }
        });
        
        // Halve the modulo value
        const oldModulo = this.modulo;
        this.modulo = this.modulo / 2;
        document.getElementById('modulo').value = this.modulo;
        
        console.log(`Mapped ${Object.keys(evenPositions).length} even node positions to new graph`);
        
        // Rebuild graph with new modulo and apply mapped positions
        this.buildGraph(this.modulo, this.nValue, this.mValue, this.shortcut, evenPositions);
        
        // Restore the mapped positions
        Object.keys(evenPositions).forEach(nodeId => {
            const node = this.cy.getElementById(`n${nodeId}`);
            if (node.length > 0) {
                const pos = evenPositions[nodeId];
                node.position({ x: pos.x, y: pos.y });
            }
        });
        
        // Fit the graph to show all nodes
        this.cy.fit();
        
        this.showNotification(`Modulo halved from ${oldModulo} to ${this.modulo}!`, 'success');
    }

    showCycle() {
        const input = prompt('Enter comma-separated integers for the cycle path:');
        if (!input) return;
        
        try {
            // Parse input and apply modulo
            const numbers = input.split(',').map(s => {
                const num = parseInt(s.trim());
                if (isNaN(num)) throw new Error(`Invalid number: ${s.trim()}`);
                return this.mod(num, this.modulo);
            });
            
            if (numbers.length < 2) {
                alert('Please enter at least 2 numbers for a cycle.');
                return;
            }
            
            console.log('Drawing cycle path:', numbers);
            this.drawCyclePath(numbers);
            
        } catch (err) {
            alert(`Error parsing input: ${err.message}`);
        }
    }
    
    drawCyclePath(numbers) {
        // Remove existing canvas if any
        const existingCanvas = document.getElementById('cycle-canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }
        
        // Create canvas overlay
        const canvas = document.createElement('canvas');
        canvas.id = 'cycle-canvas';
        
        // Position it over the cytoscape container
        const cyContainer = document.getElementById('cy');
        canvas.width = cyContainer.offsetWidth;
        canvas.height = cyContainer.offsetHeight;
        
        // Add to cytoscape container directly (positioned absolutely)
        cyContainer.appendChild(canvas);
        
        // Set up canvas context
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Get node positions and draw lines
        const positions = [];
        for (const num of numbers) {
            const node = this.cy.getElementById(`n${num}`);
            if (node.length === 0) {
                alert(`Node ${num} not found in graph.`);
                canvas.remove();
                return;
            }
            
            const pos = node.renderedPosition(); // Get position in rendered coordinates
            positions.push({ x: pos.x, y: pos.y });
        }
        
        // Draw the cycle path
        ctx.beginPath();
        ctx.moveTo(positions[0].x, positions[0].y);
        
        for (let i = 1; i < positions.length; i++) {
            ctx.lineTo(positions[i].x, positions[i].y);
        }
        
        // Close the cycle by connecting back to first node
        ctx.lineTo(positions[0].x, positions[0].y);
        ctx.stroke();
        
        // Add click handler to remove canvas
        canvas.addEventListener('click', () => {
            canvas.remove();
            this.showNotification('Cycle path cleared!', 'success');
        });
        
        this.showNotification(`Cycle path drawn! Click on red line to clear.`, 'success');
    }

    toggleNodeLabels(show) {
        if (show) {
            this.cy.style().selector('node').style('label', 'data(label)').update();
        } else {
            this.cy.style().selector('node').style('label', '').update();
        }
    }

    toggleEdgeLabels(show) {
        if (show) {
            this.cy.style().selector('edge').style('label', 'data(label)').update();
        } else {
            this.cy.style().selector('edge').style('label', '').update();
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