// js/app.js
class ChemistryWorkbench {
    constructor() {
        this.currentModule = 'kinetics';
        this.reagentDB = reagentDB;
        this.periodicTable = periodicTable;
        this.reactionEngine = reactionEngine;
        this.stoichCalc = stoichCalc;
        this.notebook = notebook;
        this.exporter = exporter;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderReagentShelf();
        this.loadModule(this.currentModule);
        this.setupThemeToggle();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        // Toolbar buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadModule(e.target.dataset.module);
            });
        });

        // Header buttons
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('notebook-btn').addEventListener('click', () => this.openNotebook());
        document.getElementById('export-btn').addEventListener('click', () => this.showExportOptions());

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Reagent search
        document.getElementById('reagent-search').addEventListener('input', (e) => {
            this.filterReagents(e.target.value);
        });

        // Solution preparation
        document.getElementById('calculate-prep').addEventListener('click', () => this.calculateSolutionPrep());
    }

    setupThemeToggle() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    setupDragAndDrop() {
        const workbench = document.getElementById('workbench-area');
        
        workbench.addEventListener('dragover', (e) => {
            e.preventDefault();
            workbench.classList.add('drop-target');
        });

        workbench.addEventListener('dragleave', () => {
            workbench.classList.remove('drop-target');
        });

        workbench.addEventListener('drop', (e) => {
            e.preventDefault();
            workbench.classList.remove('drop-target');
            
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            this.handleDrop(data);
        });
    }

    handleDrop(data) {
        if (data.type === 'reagent') {
            this.addReagentToWorkbench(data.reagent);
        } else if (data.type === 'glassware') {
            this.addGlasswareToWorkbench(data.glassware);
        }
    }

    renderReagentShelf() {
        const list = document.getElementById('reagent-list');
        const reagents = this.reagentDB.getAllReagents();
        
        list.innerHTML = reagents.map(reagent => `
            <div class="reagent-item" draggable="true" data-reagent-id="${reagent.id}">
                <div class="reagent-color" style="background-color: ${reagent.color}"></div>
                <div class="reagent-info">
                    <div class="reagent-name">${reagent.name}</div>
                    <div class="reagent-formula">${reagent.formula}</div>
                </div>
            </div>
        `).join('');

        // Add drag listeners
        list.querySelectorAll('.reagent-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const reagentId = item.dataset.reagentId;
                const reagent = this.reagentDB.getReagent(reagentId);
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'reagent',
                    reagent: reagent
                }));
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('click', () => {
                this.showReagentInfo(item.dataset.reagentId);
            });
        });
    }

    filterReagents(query) {
        const list = document.getElementById('reagent-list');
        const filtered = this.reagentDB.searchReagents(query);
        
        list.innerHTML = filtered.map(reagent => `
            <div class="reagent-item" draggable="true" data-reagent-id="${reagent.id}">
                <div class="reagent-color" style="background-color: ${reagent.color}"></div>
                <div class="reagent-info">
                    <div class="reagent-name">${reagent.name}</div>
                    <div class="reagent-formula">${reagent.formula}</div>
                </div>
            </div>
        `).join('');

        // Re-add drag listeners
        list.querySelectorAll('.reagent-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const reagentId = item.dataset.reagentId;
                const reagent = this.reagentDB.getReagent(reagentId);
                e.dataTransfer.setData('application/json', JSON.stringify({
                    type: 'reagent',
                    reagent: reagent
                }));
            });
        });
    }

    showReagentInfo(reagentId) {
        const reagent = this.reagentDB.getReagent(reagentId);
        if (!reagent) return;

        const info = `
${reagent.name} (${reagent.formula})
Molecular Weight: ${reagent.mw} g/mol
CAS: ${reagent.cas}
Density: ${reagent.density} g/cm³
State: ${reagent.state}
${reagent.concentration ? `Concentration: ${reagent.concentration}%` : ''}
Melting Point: ${reagent.meltingPoint}°C
Boiling Point: ${reagent.boilingPoint}°C
Solubility: ${reagent.solubility}

Hazards: ${reagent.hazards.join(', ') || 'None'}
        `;

        alert(info);
    }

    loadModule(moduleName) {
        this.currentModule = moduleName;
        const workbench = document.getElementById('workbench-area');

        switch (moduleName) {
            case 'kinetics':
                this.loadKineticsModule(workbench);
                break;
            case 'equilibrium':
                this.loadEquilibriumModule(workbench);
                break;
            case 'titration':
                this.loadTitrationModule(workbench);
                break;
            case 'thermo':
                this.loadThermoModule(workbench);
                break;
            case 'stoichiometry':
                this.loadStoichiometryModule(workbench);
                break;
        }
    }

    loadKineticsModule(container) {
        container.innerHTML = `
            <div class="module-content">
                <h2>⚡ Chemical Kinetics</h2>
                <div class="simulation-controls">
                    <div class="control-group">
                        <label>Reaction Order:</label>
                        <select id="reaction-order">
                            <option value="0">0th Order</option>
                            <option value="1" selected>1st Order</option>
                            <option value="2">2nd Order</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Initial Concentration [A]₀ (M):</label>
                        <input type="number" id="initial-conc" value="1.00" step="0.01">
                    </div>
                    <div class="control-group">
                        <label>Rate Constant k:</label>
                        <input type="number" id="rate-constant" value="0.150" step="0.001">
                    </div>
                    <button id="run-kinetics" class="btn-primary">Run Simulation</button>
                </div>
                <div class="simulation-display">
                    <div id="kinetics-beaker" class="beaker-animation"></div>
                    <div id="kinetics-graph"></div>
                </div>
            </div>
        `;

        document.getElementById('run-kinetics').addEventListener('click', () => this.runKineticsSimulation());
    }

    runKineticsSimulation() {
        const order = parseInt(document.getElementById('reaction-order').value);
        const initialConc = parseFloat(document.getElementById('initial-conc').value);
        const k = parseFloat(document.getElementById('rate-constant').value);

        const time = [];
        const concentration = [];
        
        for (let t = 0; t <= 20; t += 0.1) {
            time.push(t);
            let conc;
            
            switch (order) {
                case 0:
                    conc = Math.max(0, initialConc - k * t);
                    break;
                case 1:
                    conc = initialConc * Math.exp(-k * t);
                    break;
                case 2:
                    conc = initialConc / (1 + initialConc * k * t);
                    break;
            }
            
            concentration.push(conc);
        }

        // Calculate half-life
        let halfLife;
        switch (order) {
            case 0:
                halfLife = initialConc / (2 * k);
                break;
            case 1:
                halfLife = Math.LN2 / k;
                break;
            case 2:
                halfLife = 1 / (initialConc * k);
                break;
        }

        // Plot results
        const trace = {
            x: time,
            y: concentration,
            type: 'scatter',
            mode: 'lines',
            name: '[A] vs Time',
            line: { color: '#2563eb', width: 2 }
        };

        const layout = {
            title: 'Concentration vs Time',
            xaxis: { title: 'Time (s)' },
            yaxis: { title: 'Concentration (M)' },
            margin: { t: 40 }
        };

        Plotly.newPlot('kinetics-graph', [trace], layout, { responsive: true });

        // Update results
        document.getElementById('results-content').innerHTML = `
            <div class="result-item">
                <strong>Half-life (t½):</strong> ${halfLife.toFixed(3)} s
            </div>
            <div class="result-item">
                <strong>Initial Rate:</strong> ${(k * Math.pow(initialConc, order)).toFixed(4)} M/s
            </div>
            <div class="result-item">
                <strong>Rate Law:</strong> Rate = k[A]${order > 0 ? `<sup>${order}</sup>` : ''}
            </div>
        `;

        // Save to notebook
        this.notebook.createExperiment({
            title: `Kinetics Simulation - ${order}${this.getOrdinal(order)} Order`,
            objective: 'Study reaction kinetics',
            procedure: `Simulated ${order}${this.getOrdinal(order)} order reaction with k=${k}`,
            results: `Half-life: ${halfLife.toFixed(3)} s`,
            data: { time, concentration }
        });
    }

    getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    loadEquilibriumModule(container) {
        container.innerHTML = `
            <div class="module-content">
                <h2>⚖️ Chemical Equilibrium</h2>
                <div class="simulation-controls">
                    <div class="control-group">
                        <label>Reaction:</label>
                        <select id="equilibrium-reaction">
                            <option value="abc">A + B ⇌ C + D</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Equilibrium Constant Kc:</label>
                        <input type="number" id="kc-value" value="4.0" step="0.1">
                    </div>
                    <div class="control-group">
                        <label>Initial [A]₀ (M):</label>
                        <input type="number" id="eq-initial-a" value="1.00" step="0.01">
                    </div>
                    <div class="control-group">
                        <label>Initial [B]₀ (M):</label>
                        <input type="number" id="eq-initial-b" value="1.00" step="0.01">
                    </div>
                    <button id="run-equilibrium" class="btn-primary">Calculate Equilibrium</button>
                </div>
                <div class="stress-tests">
                    <h3>Le Chatelier's Principle</h3>
                    <button class="btn-secondary" data-stress="add-a">+ Add A</button>
                    <button class="btn-secondary" data-stress="remove-c">- Remove C</button>
                    <button class="btn-secondary" data-stress="dilute">⇌ Dilute</button>
                    <button class="btn-secondary" data-stress="reset">Reset</button>
                </div>
            </div>
        `;

        document.getElementById('run-equilibrium').addEventListener('click', () => this.calculateEquilibrium());
    }

    calculateEquilibrium() {
        const kc = parseFloat(document.getElementById('kc-value').value);
        const initialA = parseFloat(document.getElementById('eq-initial-a').value);
        const initialB = parseFloat(document.getElementById('eq-initial-b').value);

        // ICE table calculation
        // A + B ⇌ C + D
        // Initial: [A]₀, [B]₀, 0, 0
        // Change: -x, -x, +x, +x
        // Equilibrium: [A]₀-x, [B]₀-x, x, x

        // Kc = x² / (([A]₀-x)([B]₀-x))
        // Solve for x using quadratic formula

        const a = kc - 1;
        const b = -kc * (initialA + initialB);
        const c = kc * initialA * initialB;

        const discriminant = b * b - 4 * a * c;
        const x = (-b + Math.sqrt(discriminant)) / (2 * a);

        const eqA = initialA - x;
        const eqB = initialB - x;
        const eqC = x;
        const eqD = x;

        document.getElementById('results-content').innerHTML = `
            <h4>ICE Table Results:</h4>
            <table class="ice-table">
                <tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
                <tr><td>Initial</td><td>${initialA.toFixed(3)}</td><td>${initialB.toFixed(3)}</td><td>0</td><td>0</td></tr>
                <tr><td>Change</td><td>-${x.toFixed(3)}</td><td>-${x.toFixed(3)}</td><td>+${x.toFixed(3)}</td><td>+${x.toFixed(3)}</td></tr>
                <tr><td>Equilibrium</td><td>${eqA.toFixed(3)}</td><td>${eqB.toFixed(3)}</td><td>${eqC.toFixed(3)}</td><td>${eqD.toFixed(3)}</td></tr>
            </table>
            <div class="result-item">
                <strong>Verification:</strong> Kc = ${((eqC * eqD) / (eqA * eqB)).toFixed(3)}
            </div>
        `;
    }

    loadTitrationModule(container) {
        container.innerHTML = `
            <div class="module-content">
                <h2>💧 Acid-Base Titration</h2>
                <div class="simulation-controls">
                    <div class="control-group">
                        <label>Titration Type:</label>
                        <select id="titration-type">
                            <option value="strong-strong">Strong Acid / Strong Base</option>
                            <option value="weak-strong">Weak Acid / Strong Base</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Acid Concentration (M):</label>
                        <input type="number" id="acid-conc" value="0.10" step="0.01">
                    </div>
                    <div class="control-group">
                        <label>Acid Volume (mL):</label>
                        <input type="number" id="acid-vol" value="25" step="1">
                    </div>
                    <div class="control-group">
                        <label>Base Concentration (M):</label>
                        <input type="number" id="base-conc" value="0.10" step="0.01">
                    </div>
                    <div class="control-group">
                        <label>pKa (for weak acid):</label>
                        <input type="number" id="pka-value" value="4.76" step="0.01">
                    </div>
                    <button id="run-titration" class="btn-primary">Run Titration</button>
                </div>
                <div id="titration-graph"></div>
            </div>
        `;

        document.getElementById('run-titration').addEventListener('click', () => this.runTitration());
    }

    runTitration() {
        const type = document.getElementById('titration-type').value;
        const acidConc = parseFloat(document.getElementById('acid-conc').value);
        const acidVol = parseFloat(document.getElementById('acid-vol').value);
        const baseConc = parseFloat(document.getElementById('base-conc').value);
        const pka = parseFloat(document.getElementById('pka-value').value);

        const equivVol = (acidConc * acidVol) / baseConc;
        
        const volumes = [];
        const pHValues = [];

        for (let v = 0; v <= equivVol * 1.5; v += 0.5) {
            volumes.push(v);
            
            let pH;
            if (type === 'strong-strong') {
                if (v < equivVol) {
                    // Before equivalence: excess acid
                    const excessAcid = (acidConc * acidVol - baseConc * v) / (acidVol + v);
                    pH = -Math.log10(excessAcid);
                } else if (v === equivVol) {
                    pH = 7;
                } else {
                    // After equivalence: excess base
                    const excessBase = (baseConc * v - acidConc * acidVol) / (acidVol + v);
                    pH = 14 + Math.log10(excessBase);
                }
            } else {
                // Weak acid / strong base
                if (v < equivVol) {
                    // Buffer region
                    const molesAcid = acidConc * acidVol;
                    const molesBase = baseConc * v;
                    const ratio = (molesAcid - molesBase) / molesBase;
                    pH = pka + Math.log10(molesBase / (molesAcid - molesBase));
                } else if (v === equivVol) {
                    // Equivalence point: conjugate base
                    const concBase = (acidConc * acidVol) / (acidVol + v);
                    const kb = 1e-14 / Math.pow(10, -pka);
                    const oh = Math.sqrt(kb * concBase);
                    pH = 14 + Math.log10(oh);
                } else {
                    // After equivalence: excess strong base
                    const excessBase = (baseConc * v - acidConc * acidVol) / (acidVol + v);
                    pH = 14 + Math.log10(excessBase);
                }
            }
            
            pHValues.push(pH);
        }

        const trace = {
            x: volumes,
            y: pHValues,
            type: 'scatter',
            mode: 'lines',
            name: 'pH vs Volume',
            line: { color: '#2563eb', width: 2 }
        };

        const layout = {
            title: 'Titration Curve',
            xaxis: { title: 'Volume of Base Added (mL)' },
            yaxis: { title: 'pH' },
            margin: { t: 40 }
        };

        Plotly.newPlot('titration-graph', [trace], layout, { responsive: true });

        document.getElementById('results-content').innerHTML = `
            <div class="result-item">
                <strong>Equivalence Volume:</strong> ${equivVol.toFixed(2)} mL
            </div>
            <div class="result-item">
                <strong>pH at Equivalence:</strong> ${pHValues[volumes.indexOf(equivVol)] || pHValues[Math.floor(volumes.length/2)].toFixed(2)}
            </div>
        `;
    }
    // js/app.js (continued)
    loadThermoModule(container) {
        container.innerHTML = `
            <div class="module-content">
                <h2>🔥 Thermochemistry</h2>
                <div class="simulation-controls">
                    <div class="control-group">
                        <label>Mass of Solution (g):</label>
                        <input type="number" id="mass-solution" value="100" step="1">
                    </div>
                    <div class="control-group">
                        <label>Specific Heat c (J/g·°C):</label>
                        <input type="number" id="specific-heat" value="4.184" step="0.001">
                    </div>
                    <div class="control-group">
                        <label>Temperature Change ΔT (°C):</label>
                        <input type="number" id="delta-temp" value="8.0" step="0.1">
                    </div>
                    <div class="control-group">
                        <label>Moles of Reactant (mol):</label>
                        <input type="number" id="moles-reactant" value="0.050" step="0.001">
                    </div>
                    <div class="control-group">
                        <label>Activation Energy Ea (kJ/mol):</label>
                        <input type="number" id="activation-energy" value="45" step="1">
                    </div>
                    <button id="run-thermo" class="btn-primary">Calculate</button>
                </div>
                <div class="simulation-display">
                    <div id="thermo-flask" class="flask-animation"></div>
                    <div id="thermo-graph"></div>
                </div>
            </div>
        `;

        document.getElementById('run-thermo').addEventListener('click', () => this.runThermoCalculation());
    }

    runThermoCalculation() {
        const mass = parseFloat(document.getElementById('mass-solution').value);
        const c = parseFloat(document.getElementById('specific-heat').value);
        const deltaT = parseFloat(document.getElementById('delta-temp').value);
        const moles = parseFloat(document.getElementById('moles-reactant').value);
        const Ea = parseFloat(document.getElementById('activation-energy').value);

        // q = mcΔT
        const q = mass * c * deltaT;
        const qKJ = q / 1000;
        
        // ΔH = -q/n (negative because heat released by reaction = heat absorbed by solution)
        const deltaH = -q / moles;
        const deltaHkJ = deltaH / 1000;

        // Classification
        let classification = 'Exothermic';
        let classificationColor = '#ef4444';
        if (deltaT < 0) {
            classification = 'Endothermic';
            classificationColor = '#3b82f6';
        }

        // Update results
        document.getElementById('results-content').innerHTML = `
            <div class="result-item">
                <strong>Heat exchanged (q):</strong> ${q.toFixed(2)} J (${qKJ.toFixed(3)} kJ)
            </div>
            <div class="result-item">
                <strong>ΔH (reaction):</strong> ${deltaH.toFixed(2)} J/mol
            </div>
            <div class="result-item">
                <strong>ΔH molar:</strong> ${deltaHkJ.toFixed(2)} kJ/mol
            </div>
            <div class="result-item">
                <strong>Classification:</strong> 
                <span style="color: ${classificationColor}; font-weight: bold;">${classification}</span>
            </div>
        `;

        // Update calculations panel
        document.getElementById('calc-concentration').textContent = `${(moles / (mass / 1000)).toFixed(3)} M`;
        document.getElementById('calc-ph').textContent = '—';
        document.getElementById('calc-temp').textContent = `${deltaT > 0 ? '+' : ''}${deltaT.toFixed(1)} °C`;

        // Plot energy diagram
        this.plotEnergyDiagram(Ea, deltaHkJ, classification);

        // Animate flask
        const flask = document.getElementById('thermo-flask');
        flask.className = 'flask-animation';
        flask.style.background = classificationColor;
        flask.classList.add(classification === 'Exothermic' ? 'animate-pulse' : 'animate-bubble');

        // Save to notebook
        this.notebook.createExperiment({
            title: `Thermochemistry - ${classification} Reaction`,
            objective: 'Determine enthalpy of reaction via calorimetry',
            procedure: `Mass: ${mass}g, c: ${c} J/g·°C, ΔT: ${deltaT}°C, n: ${moles} mol`,
            results: `q = ${q.toFixed(2)} J, ΔH = ${deltaHkJ.toFixed(2)} kJ/mol`,
            conclusion: `Reaction is ${classification.toLowerCase()}`,
            data: { mass, c, deltaT, moles, Ea, q, deltaHkJ, classification }
        });
    }

    plotEnergyDiagram(Ea, deltaH, classification) {
        const reactantsEnergy = 0;
        const transitionState = Ea;
        const productsEnergy = classification === 'Exothermic' ? deltaH : -deltaH;

        const trace = {
            x: [0, 0.5, 1],
            y: [reactantsEnergy, transitionState, productsEnergy],
            type: 'scatter',
            mode: 'lines+markers+text',
            name: 'Energy Profile',
            line: { color: '#2563eb', width: 3, shape: 'spline' },
            marker: { size: 10, color: ['#10b981', '#ef4444', '#f59e0b'] },
            text: ['Reactants', 'Transition State', 'Products'],
            textposition: 'top center'
        };

        const layout = {
            title: 'Reaction Energy Diagram',
            xaxis: { title: 'Reaction Coordinate', showgrid: false },
            yaxis: { title: 'Potential Energy (kJ/mol)' },
            margin: { t: 40 },
            showlegend: false
        };

        const graphDiv = document.getElementById('thermo-graph') || document.getElementById('plotly-chart');
        if (graphDiv) {
            Plotly.newPlot(graphDiv, [trace], layout, { responsive: true });
        }
    }

    loadStoichiometryModule(container) {
        container.innerHTML = `
            <div class="module-content">
                <h2>🧮 Stoichiometry Calculator</h2>
                <div class="simulation-controls">
                    <div class="control-group">
                        <label>Reaction:</label>
                        <select id="stoich-reaction">
                            <option value="precipitation">AgNO₃ + NaCl → AgCl + NaNO₃</option>
                            <option value="neutralization">HCl + NaOH → NaCl + H₂O</option>
                            <option value="combustion">C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O</option>
                            <option value="redox">2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂ + 2KOH + 2H₂O</option>
                        </select>
                    </div>
                    <div class="control-group">
                        <label>Mass of Reactant 1 (g):</label>
                        <input type="number" id="mass-r1" value="5.00" step="0.01">
                    </div>
                    <div class="control-group">
                        <label>Mass of Reactant 2 (g):</label>
                        <input type="number" id="mass-r2" value="3.00" step="0.01">
                    </div>
                    <button id="run-stoich" class="btn-primary">Calculate</button>
                </div>
                <div id="stoich-results"></div>
            </div>
        `;

        document.getElementById('run-stoich').addEventListener('click', () => this.runStoichiometry());
    }

    runStoichiometry() {
        const reactionType = document.getElementById('stoich-reaction').value;
        const mass1 = parseFloat(document.getElementById('mass-r1').value);
        const mass2 = parseFloat(document.getElementById('mass-r2').value);

        const reactions = {
            precipitation: {
                name: 'AgNO₃ + NaCl → AgCl + NaNO₃',
                r1: { id: 'agno3', mw: 169.87, coeff: 1 },
                r2: { id: 'nacl', mw: 58.44, coeff: 1 },
                products: [
                    { id: 'agcl', name: 'AgCl', mw: 143.32, coeff: 1 },
                    { id: 'nano3', name: 'NaNO₃', mw: 84.99, coeff: 1 }
                ]
            },
            neutralization: {
                name: 'HCl + NaOH → NaCl + H₂O',
                r1: { id: 'hcl', mw: 36.46, coeff: 1 },
                r2: { id: 'naoh', mw: 40.00, coeff: 1 },
                products: [
                    { id: 'nacl', name: 'NaCl', mw: 58.44, coeff: 1 },
                    { id: 'h2o', name: 'H₂O', mw: 18.02, coeff: 1 }
                ]
            },
            combustion: {
                name: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
                r1: { id: 'ethanol', mw: 46.07, coeff: 1 },
                r2: { id: 'o2', mw: 32.00, coeff: 3 },
                products: [
                    { id: 'co2', name: 'CO₂', mw: 44.01, coeff: 2 },
                    { id: 'h2o', name: 'H₂O', mw: 18.02, coeff: 3 }
                ]
            },
            redox: {
                name: '2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂ + 2KOH + 2H₂O',
                r1: { id: 'kmno4', mw: 158.03, coeff: 2 },
                r2: { id: 'h2o2', mw: 34.01, coeff: 3 },
                products: [
                    { id: 'mno2', name: 'MnO₂', mw: 86.94, coeff: 2 },
                    { id: 'o2', name: 'O₂', mw: 32.00, coeff: 3 }
                ]
            }
        };

        const rxn = reactions[reactionType];
        const moles1 = mass1 / rxn.r1.mw;
        const moles2 = mass2 / rxn.r2.mw;

        // Find limiting reagent
        const ratio1 = moles1 / rxn.r1.coeff;
        const ratio2 = moles2 / rxn.r2.coeff;
        
        let limiting, excess, limitingMoles, excessMoles, excessRemaining;
        if (ratio1 < ratio2) {
            limiting = rxn.r1;
            excess = rxn.r2;
            limitingMoles = moles1;
            excessMoles = moles2;
            excessRemaining = moles2 - (moles1 * rxn.r2.coeff / rxn.r1.coeff);
        } else {
            limiting = rxn.r2;
            excess = rxn.r1;
            limitingMoles = moles2;
            excessMoles = moles1;
            excessRemaining = moles1 - (moles2 * rxn.r1.coeff / rxn.r2.coeff);
        }

        const theoreticalYields = rxn.products.map(p => ({
            name: p.name,
            moles: (limitingMoles / limiting.coeff) * p.coeff,
            mass: ((limitingMoles / limiting.coeff) * p.coeff) * p.mw
        }));

        document.getElementById('stoich-results').innerHTML = `
            <div class="panel">
                <h4>Stoichiometry Results</h4>
                <div class="calc-item">
                    <label>Moles Reactant 1:</label>
                    <span>${moles1.toFixed(4)} mol</span>
                </div>
                <div class="calc-item">
                    <label>Moles Reactant 2:</label>
                    <span>${moles2.toFixed(4)} mol</span>
                </div>
                <div class="calc-item">
                    <label>Limiting Reagent:</label>
                    <span style="color: var(--danger-color);">${limiting.id.toUpperCase()}</span>
                </div>
                <div class="calc-item">
                    <label>Excess Remaining:</label>
                    <span>${excessRemaining.toFixed(4)} mol (${(excessRemaining * excess.mw).toFixed(3)} g)</span>
                </div>
                <h4 style="margin-top: 1rem;">Theoretical Yields</h4>
                ${theoreticalYields.map(y => `
                    <div class="calc-item">
                        <label>${y.name}:</label>
                        <span>${y.moles.toFixed(4)} mol (${y.mass.toFixed(3)} g)</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Modal Management
    openNotebook() {
        const modal = document.getElementById('notebook-modal');
        modal.classList.add('active');
        this.renderNotebook();
    }

    renderNotebook() {
        const content = document.getElementById('notebook-content');
        const experiments = this.notebook.getAllExperiments();

        if (experiments.length === 0) {
            content.innerHTML = '<p class="placeholder-text">No experiments recorded yet. Run simulations to populate your notebook.</p>';
            return;
        }

        content.innerHTML = `
            <div class="experiments-list">
                ${experiments.slice().reverse().map(exp => `
                    <div class="experiment-entry" data-id="${exp.id}">
                        <div class="exp-header">
                            <strong>${exp.title}</strong>
                            <span class="exp-date">${new Date(exp.timestamp).toLocaleString()}</span>
                        </div>
                        <div class="exp-body">
                            <p><em>Objective:</em> ${exp.objective}</p>
                            <p><em>Results:</em> ${exp.results}</p>
                        </div>
                        <div class="exp-actions">
                            <button class="btn-icon" onclick="exporter.exportExperiment(${exp.id}, 'json')">📥 JSON</button>
                            <button class="btn-icon" onclick="exporter.exportExperiment(${exp.id}, 'csv')">📊 CSV</button>
                            <button class="btn-icon" onclick="exporter.exportExperiment(${exp.id}, 'pdf')">📄 Report</button>
                            <button class="btn-icon" onclick="notebook.deleteExperiment(${exp.id}); app.renderNotebook();">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    showExportOptions() {
        const experiments = this.notebook.getAllExperiments();
        if (experiments.length === 0) {
            alert('No experiments to export. Run some simulations first!');
            return;
        }

        const format = prompt(
            'Choose export format:\n' +
            '1 - All experiments as JSON\n' +
            '2 - All experiments as CSV\n' +
            '3 - Export current graph as PNG'
        );

        switch (format) {
            case '1':
                exporter.exportToJSON(experiments, 'all_experiments.json');
                break;
            case '2':
                exporter.exportToCSV(experiments, 'all_experiments.csv');
                break;
            case '3':
                const chartId = document.querySelector('[id$="-graph"]')?.id || 'plotly-chart';
                exporter.exportGraph(chartId, 'png', 'chemistry_graph.png');
                break;
        }
    }

    openPeriodicTable() {
        const modal = document.getElementById('periodic-table-modal');
        const container = document.getElementById('periodic-table-container');
        container.innerHTML = '';
        this.periodicTable.render(container);
        modal.classList.add('active');
    }

    openSolutionPrep() {
        const modal = document.getElementById('solution-prep-modal');
        const select = document.getElementById('prep-reagent');
        
        select.innerHTML = this.reagentDB.getAllReagents()
            .map(r => `<option value="${r.id}">${r.name} (${r.formula})</option>`)
            .join('');
        
        modal.classList.add('active');
    }

    calculateSolutionPrep() {
        const reagentId = document.getElementById('prep-reagent').value;
        const concentration = parseFloat(document.getElementById('prep-concentration').value);
        const volume = parseFloat(document.getElementById('prep-volume').value);

        if (!concentration || !volume) {
            alert('Please enter both concentration and volume');
            return;
        }

        const prep = this.reagentDB.prepareSolution(reagentId, concentration, volume);
        
        if (!prep) {
            alert('Could not calculate preparation');
            return;
        }

        document.getElementById('prep-results').innerHTML = `
            <div class="prep-output">
                <h4>Preparation Instructions</h4>
                <p><strong>Required:</strong> ${prep.massNeeded.toFixed(3)} g of ${prep.reagent}</p>
                <p><strong>Moles needed:</strong> ${prep.molesNeeded.toFixed(4)} mol</p>
                ${prep.volumeNeeded ? `<p><strong>Stock volume:</strong> ${prep.volumeNeeded.toFixed(2)} mL</p>` : ''}
                <h4>Procedure</h4>
                <ol>
                    ${prep.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
        `;
    }

    addReagentToWorkbench(reagent) {
        const workbench = document.getElementById('workbench-area');
        const item = document.createElement('div');
        item.className = 'workbench-reagent animate-color';
        item.innerHTML = `
            <div class="reagent-color" style="background-color: ${reagent.color}"></div>
            <div>${reagent.name}</div>
            <button class="btn-icon" onclick="this.parentElement.remove()">×</button>
        `;
        workbench.appendChild(item);
    }

    addGlasswareToWorkbench(glassware) {
        const workbench = document.getElementById('workbench-area');
        const item = document.createElement('div');
        item.className = 'workbench-glassware';
        item.innerHTML = `<div>${glassware.type}</div>`;
        workbench.appendChild(item);
    }

    // Utility methods
    updateCalculationsPanel(data) {
        if (data.concentration !== undefined) {
            document.getElementById('calc-concentration').textContent = `${data.concentration.toFixed(3)} M`;
        }
        if (data.pH !== undefined) {
            document.getElementById('calc-ph').textContent = data.pH.toFixed(2);
        }
        if (data.temperature !== undefined) {
            document.getElementById('calc-temp').textContent = `${data.temperature.toFixed(1)} °C`;
        }
    }

    updateSafetyPanel(reagent) {
        const panel = document.getElementById('safety-panel');
        if (!reagent || !reagent.safety || reagent.safety.pictograms.length === 0) {
            panel.innerHTML = '<p class="placeholder-text">No hazards</p>';
            return;
        }

        const pictogramMap = {
            'GHS01': { icon: '💥', label: 'Explosive' },
            'GHS02': { icon: '🔥', label: 'Flammable' },
            'GHS03': { icon: '⭕', label: 'Oxidizer' },
            'GHS04': { icon: '🔷', label: 'Compressed Gas' },
            'GHS05': { icon: '🧪', label: 'Corrosive' },
            'GHS06': { icon: '☠️', label: 'Toxic' },
            'GHS07': { icon: '⚠️', label: 'Irritant' },
            'GHS08': { icon: '🫁', label: 'Health Hazard' },
            'GHS09': { icon: '🌳', label: 'Environmental' }
        };

        panel.innerHTML = reagent.safety.pictograms.map(code => {
            const p = pictogramMap[code] || { icon: '⚠️', label: code };
            return `<div class="safety-item"><span class="pictogram">${p.icon}</span><span>${p.label}</span></div>`;
        }).join('');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChemistryWorkbench();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'e':
                    e.preventDefault();
                    app.showExportOptions();
                    break;
                case 'n':
                    e.preventDefault();
                    app.openNotebook();
                    break;
                case 'd':
                    e.preventDefault();
                    app.toggleTheme();
                    break;
            }
        }
    });

    // Periodic table button (if exists in header)
    const ptBtn = document.getElementById('periodic-table-btn');
    if (ptBtn) ptBtn.addEventListener('click', () => app.openPeriodicTable());

    // Solution prep button
    const spBtn = document.getElementById('solution-prep-btn');
    if (spBtn) spBtn.addEventListener('click', () => app.openSolutionPrep());

    console.log('🧪 Chemistry Workbench Pro initialized');
    console.log('Shortcuts: Ctrl+E (Export), Ctrl+N (Notebook), Ctrl+D (Dark Mode)');
});