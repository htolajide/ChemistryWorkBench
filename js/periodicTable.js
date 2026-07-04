// js/periodicTable.js
class PeriodicTable {
    constructor() {
        this.elements = this.initializeElements();
    }

    initializeElements() {
        return [
            { symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, group: 1, period: 1, category: 'nonmetal' },
            { symbol: 'He', name: 'Helium', number: 2, mass: 4.003, group: 18, period: 1, category: 'noble-gas' },
            { symbol: 'Li', name: 'Lithium', number: 3, mass: 6.941, group: 1, period: 2, category: 'alkali-metal' },
            { symbol: 'Be', name: 'Beryllium', number: 4, mass: 9.012, group: 2, period: 2, category: 'alkaline-earth' },
            { symbol: 'B', name: 'Boron', number: 5, mass: 10.81, group: 13, period: 2, category: 'metalloid' },
            { symbol: 'C', name: 'Carbon', number: 6, mass: 12.01, group: 14, period: 2, category: 'nonmetal' },
            { symbol: 'N', name: 'Nitrogen', number: 7, mass: 14.01, group: 15, period: 2, category: 'nonmetal' },
            { symbol: 'O', name: 'Oxygen', number: 8, mass: 16.00, group: 16, period: 2, category: 'nonmetal' },
            { symbol: 'F', name: 'Fluorine', number: 9, mass: 19.00, group: 17, period: 2, category: 'halogen' },
            { symbol: 'Ne', name: 'Neon', number: 10, mass: 20.18, group: 18, period: 2, category: 'noble-gas' },
            { symbol: 'Na', name: 'Sodium', number: 11, mass: 22.99, group: 1, period: 3, category: 'alkali-metal' },
            { symbol: 'Mg', name: 'Magnesium', number: 12, mass: 24.31, group: 2, period: 3, category: 'alkaline-earth' },
            { symbol: 'Al', name: 'Aluminum', number: 13, mass: 26.98, group: 13, period: 3, category: 'post-transition' },
            { symbol: 'Si', name: 'Silicon', number: 14, mass: 28.09, group: 14, period: 3, category: 'metalloid' },
            { symbol: 'P', name: 'Phosphorus', number: 15, mass: 30.97, group: 15, period: 3, category: 'nonmetal' },
            { symbol: 'S', name: 'Sulfur', number: 16, mass: 32.07, group: 16, period: 3, category: 'nonmetal' },
            { symbol: 'Cl', name: 'Chlorine', number: 17, mass: 35.45, group: 17, period: 3, category: 'halogen' },
            { symbol: 'Ar', name: 'Argon', number: 18, mass: 39.95, group: 18, period: 3, category: 'noble-gas' },
            { symbol: 'K', name: 'Potassium', number: 19, mass: 39.10, group: 1, period: 4, category: 'alkali-metal' },
            { symbol: 'Ca', name: 'Calcium', number: 20, mass: 40.08, group: 2, period: 4, category: 'alkaline-earth' },
            { symbol: 'Fe', name: 'Iron', number: 26, mass: 55.85, group: 8, period: 4, category: 'transition-metal' },
            { symbol: 'Cu', name: 'Copper', number: 29, mass: 63.55, group: 11, period: 4, category: 'transition-metal' },
            { symbol: 'Zn', name: 'Zinc', number: 30, mass: 65.38, group: 12, period: 4, category: 'transition-metal' },
            { symbol: 'Ag', name: 'Silver', number: 47, mass: 107.87, group: 11, period: 5, category: 'transition-metal' },
            { symbol: 'Au', name: 'Gold', number: 79, mass: 196.97, group: 11, period: 6, category: 'transition-metal' }
        ];
    }

    render(container) {
        const table = document.createElement('div');
        table.className = 'periodic-table';
        table.style.display = 'grid';
        table.style.gridTemplateColumns = 'repeat(18, 1fr)';
        table.style.gap = '2px';
        table.style.padding = '1rem';

        this.elements.forEach(element => {
            const cell = document.createElement('div');
            cell.className = `element-cell category-${element.category}`;
            cell.style.gridColumn = element.group;
            cell.style.gridRow = element.period;
            cell.style.padding = '0.5rem';
            cell.style.border = '1px solid var(--border-color)';
            cell.style.borderRadius = '4px';
            cell.style.cursor = 'pointer';
            cell.style.textAlign = 'center';
            cell.style.transition = 'all 0.2s';
            
            cell.innerHTML = `
                <div style="font-size: 0.7rem; opacity: 0.7;">${element.number}</div>
                <div style="font-size: 1.2rem; font-weight: bold;">${element.symbol}</div>
                <div style="font-size: 0.6rem;">${element.mass}</div>
            `;

            cell.addEventListener('click', () => this.showElementInfo(element));
            cell.addEventListener('mouseenter', () => {
                cell.style.transform = 'scale(1.1)';
                cell.style.zIndex = '10';
            });
            cell.addEventListener('mouseleave', () => {
                cell.style.transform = 'scale(1)';
                cell.style.zIndex = '1';
            });

            table.appendChild(cell);
        });

        container.appendChild(table);
    }

    showElementInfo(element) {
        alert(`${element.name} (${element.symbol})\nAtomic Number: ${element.number}\nAtomic Mass: ${element.mass}\nCategory: ${element.category}`);
    }

    getElement(symbol) {
        return this.elements.find(e => e.symbol === symbol);
    }
}

const periodicTable = new PeriodicTable();