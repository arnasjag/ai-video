export interface ChipOption {
  id: string;
  label: string;
  icon?: string;
}

export const defaultChips: ChipOption[] = [
  { id: 'search', icon: '🔍', label: '' },
  { id: 'saved', icon: '🔖', label: '' },
  { id: 'all', icon: '◉', label: 'All' },
  { id: 'new', icon: '⚡', label: 'New' },
  { id: 'winter', icon: '❄️', label: 'Winter' },
];

export function renderChipFilters(chips: ChipOption[], activeId: string): string {
  return `
    <div class="chip-filters">
      ${chips.map(chip => `
        <button class="chip ${chip.id === activeId ? 'active' : ''} ${!chip.label ? 'chip-icon-only' : ''}" data-chip="${chip.id}">
          ${chip.icon ? `<span class="chip-icon">${chip.icon}</span>` : ''}
          ${chip.label ? `<span class="chip-label">${chip.label}</span>` : ''}
        </button>
      `).join('')}
    </div>
  `;
}

export function initChipFilters(onSelect: (chipId: string) => void): void {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const chipId = chip.getAttribute('data-chip');
      if (chipId) onSelect(chipId);
    });
  });
}
