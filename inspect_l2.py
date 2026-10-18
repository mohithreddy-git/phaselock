from test_levels import solve_level, BORDERS

level2 = {
    'id': 2,
    'name': 'DIMENSION SPLIT',
    'subtitle': 'Route shared matter around alternate-dimension obstacles.',
    'player': (1, 2),
    'realm': 'alpha',
    'blocks': [(2, 3), (4, 2)],
    'plates': [(2, 6), (5, 5)],
    'exit': (1, 6),
    'alpha_walls': BORDERS + [
        (3, 1), (3, 2), (3, 3),
        (3, 5), (3, 6)
    ],
    'omega_walls': BORDERS + [
        (4, 4), # Omega-only wall
        (4, 5), (4, 6),
        (6, 2), (6, 3)
    ]
}

solv, moves, path = solve_level(level2)
print("Level 2 path:", path)
