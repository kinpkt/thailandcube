export const EventCodeToFullMap = {
    'E333': '3x3x3 Cube',
    'E222': '2x2x2 Cube',
    'E444': '4x4x4 Cube',
    'E555': '5x5x5 Cube',
    'E666': '6x6x6 Cube',
    'E777': '7x7x7 Cube',
    'E333BF': '3x3x3 Blindfolded',
    'E333FM': '3x3x3 Fewest Moves',
    'E333OH': '3x3x3 One-Handed',
    'CLOCK': 'Clock',
    'MINX': 'Megaminx',
    'PYRAM': 'Pyraminx',
    'SKEWB': 'Skewb',
    'SQ1': 'Square-1',
    'E444BF': '4x4x4 Blindfolded',
    'E555BF': '5x5x5 Blindfolded',
    'E333MBF': '3x3x3 Multi-Blind',
    // 'mb': 'Mirror Blocks'
} as const;

export const FormatCodeToFullMap = {
    'BO1': 'Best of 1',
    'BO2': 'Best of 2',
    'BO3': 'Best of 3',
    'MO3': 'Mean of 3',
    'AO5': 'Average of 5',
    'BO5': 'Best of 5',
    'H2H': 'Head to Head',
} as const;

export const EventFullToCodeMap = {
    '3x3x3': '333',
    '3x3x3 Blindfolded': '333bf',
    '3x3x3 One-Handed': '333oh',
    // 'Mirror Blocks': 'mb'
} as const;