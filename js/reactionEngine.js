// js/reactionEngine.js
class ReactionEngine {
    constructor() {
        this.reactions = this.initializeReactions();
    }

    initializeReactions() {
        return [
            {
                id: 'acid-base-neutralization',
                type: 'acid-base',
                reactants: ['HCl', 'NaOH'],
                products: ['NaCl', 'H2O'],
                balanced: 'HCl + NaOH → NaCl + H₂O',
                enthalpy: -57.1, // kJ/mol
                description: 'Strong acid-strong base neutralization'
            },
            {
                id: 'precipitation-agcl',
                type: 'precipitation',
                reactants: ['AgNO3', 'NaCl'],
                products: ['AgCl', 'NaNO3'],
                balanced: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃',
                enthalpy: -65.5,
                description: 'Silver chloride precipitation',
                precipitate: 'AgCl',
                precipitateColor: 'white'
            },
            {
                id: 'redox-kmno4-h2o2',
                type: 'redox',
                reactants: ['KMnO4', 'H2O2'],
                products: ['MnO2', 'O2', 'KOH', 'H2O'],
                balanced: '2KMnO₄ + 3H₂O₂ → 2MnO₂ + 3O₂ + 2KOH + 2H₂O',
                enthalpy: -196.0,
                description: 'Permanganate oxidation of hydrogen peroxide',
                gas: 'O2'
            },
            {
                id: 'combustion-ethanol',
                type: 'combustion',
                reactants: ['C2H5OH', 'O2'],
                products: ['CO2', 'H2O'],
                balanced: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
                enthalpy: -1367,
                description: 'Ethanol combustion'
            },
            {
                id: 'decomposition-h2o2',
                type: 'decomposition',
                reactants: ['H2O2'],
                products: ['H2O', 'O2'],
                balanced: '2H₂O₂ → 2H₂O + O₂',
                enthalpy: -98.2,
                description: 'Hydrogen peroxide decomposition',
                gas: 'O2'
            }
        ];
    }

    predictReaction(reactants) {
        // Simple reaction prediction based on known reactions
        const reactantNames = reactants.map(r => r.id || r);
        
        for (const reaction of this.reactions) {
            const match = reaction.reactants.every(r => 
                reactantNames.some(reactant => 
                    reactant.toLowerCase().includes(r.toLowerCase())
                )
            );
            
            if (match) {
                return reaction;
            }
        }
        
        return null;
    }

    calculateStoichiometry(reaction, reactantAmounts) {
        // Simplified stoichiometry calculation
        const stoich = {
            reaction: reaction,
            limitingReagent: null,
            excessReagents: [],
            theoreticalYield: {},
            percentYield: 100
        };

        // For demonstration, assume first reactant is limiting
        stoich.limitingReagent = reaction.reactants[0];
        stoich.excessReagents = reaction.reactants.slice(1);

        return stoich;
    }

    simulateReaction(reaction, conditions = {}) {
        const simulation = {
            reaction: reaction,
            time: 0,
            temperature: conditions.temperature || 25,
            concentration: conditions.concentration || 1.0,
            progress: 0,
            products: [],
            observations: []
        };

        // Simulate reaction progress
        const interval = setInterval(() => {
            simulation.time += 0.1;
            simulation.progress = Math.min(1, simulation.time / 10);
            
            if (reaction.precipitate) {
                simulation.observations.push(`Precipitate forming: ${reaction.precipitateColor} ${reaction.precipitate}`);
            }
            
            if (reaction.gas) {
                simulation.observations.push(`Gas evolution: ${reaction.gas}`);
            }

            if (simulation.progress >= 1) {
                clearInterval(interval);
            }
        }, 100);

        return simulation;
    }
}

const reactionEngine = new ReactionEngine();