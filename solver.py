"""
Automated BFS Solver for Phase Lock Levels.
Verifies solvability, checks that phase shifts are strictly necessary,
and calculates optimal move count for 3-star ratings.
"""

from collections import deque

def solve_level(level_data, allow_phase_shift=True):
    alpha_walls = set(level_data['alpha_walls'])
    omega_walls = set(level_data['omega_walls'])
    plates = set(level_data['plates'])
    exit_pos = level_data['exit']
    
    start_p = level_data['player']
    b1, b2 = sorted(level_data['blocks'])
    start_realm = 0 if level_data.get('realm', 'alpha') == 'alpha' else 1
    
    start_state = (start_p[0], start_p[1], start_realm, b1[0], b1[1], b2[0], b2[1])
    
    queue = deque([start_state])
    parent = {start_state: None}
    action_taken = {start_state: None}
    visited = {start_state}
    
    moves = [
        ('UP', 0, -1),
        ('DOWN', 0, 1),
        ('LEFT', -1, 0),
        ('RIGHT', 1, 0)
    ]
    
    target_state = None
    
    while queue:
        state = queue.popleft()
        px, py, realm, b1x, b1y, b2x, b2y = state
        
        # Check win condition: both plates occupied AND player at exit
        blocks_set = {(b1x, b1y), (b2x, b2y)}
        plates_covered = (blocks_set == plates)
        if plates_covered and (px, py) == exit_pos:
            target_state = state
            break
            
        current_walls = alpha_walls if realm == 0 else omega_walls
        
        for move_name, dx, dy in moves:
            tx, ty = px + dx, py + dy
            if not (0 <= tx < 8 and 0 <= ty < 8):
                continue
            if (tx, ty) in current_walls:
                continue
                
            # Block push?
            if (tx, ty) == (b1x, b1y):
                bx, by = tx + dx, ty + dy
                if not (0 <= bx < 8 and 0 <= by < 8):
                    continue
                # Block cannot enter a wall in EITHER realm
                if (bx, by) in alpha_walls or (bx, by) in omega_walls:
                    continue
                if (bx, by) == (b2x, b2y):
                    continue
                nb1 = (bx, by)
                nb2 = (b2x, b2y)
                sb1, sb2 = sorted([nb1, nb2])
                next_state = (tx, ty, realm, sb1[0], sb1[1], sb2[0], sb2[1])
            elif (tx, ty) == (b2x, b2y):
                bx, by = tx + dx, ty + dy
                if not (0 <= bx < 8 and 0 <= by < 8):
                    continue
                if (bx, by) in alpha_walls or (bx, by) in omega_walls:
                    continue
                if (bx, by) == (b1x, b1y):
                    continue
                nb1 = (b1x, b1y)
                nb2 = (bx, by)
                sb1, sb2 = sorted([nb1, nb2])
                next_state = (tx, ty, realm, sb1[0], sb1[1], sb2[0], sb2[1])
            else:
                next_state = (tx, ty, realm, b1x, b1y, b2x, b2y)
                
            if next_state not in visited:
                visited.add(next_state)
                parent[next_state] = state
                action_taken[next_state] = move_name
                queue.append(next_state)
                
        # Phase shift
        if allow_phase_shift:
            other_realm = 1 - realm
            other_walls = alpha_walls if other_realm == 0 else omega_walls
            # Can only phase shift if current player position has NO wall in destination realm
            if (px, py) not in other_walls:
                shift_state = (px, py, other_realm, b1x, b1y, b2x, b2y)
                if shift_state not in visited:
                    visited.add(shift_state)
                    parent[shift_state] = state
                    action_taken[shift_state] = 'PHASE_SHIFT'
                    queue.append(shift_state)
                    
    if not target_state:
        return False, 0, []
        
    path = []
    curr = target_state
    while parent[curr] is not None:
        path.append(action_taken[curr])
        curr = parent[curr]
    path.reverse()
    return True, len(path), path

def get_borders():
    walls = []
    for i in range(8):
        walls.append((i, 0))
        walls.append((i, 7))
        walls.append((0, i))
        walls.append((7, i))
    return list(set(walls))

BORDERS = get_borders()

LEVELS = [
    # LEVEL 1: PHASE PRIMER
    # Teaches movement, block pushing, and phase shift.
    # Player starts in Alpha at (1, 1).
    # Room divided by wall at x=4 in Alpha: (4,1), (4,2), (4,3), (4,4), (4,5) are walls in Alpha!
    # In Omega, x=4 is completely OPEN, but Omega has walls at (2,3) and (2,4) and (5,4).
    # Block 1 is at (2, 2), Plate 1 is at (2, 5).
    # Block 2 is at (5, 2), Plate 2 is at (5, 5).
    # Exit is at (4, 6).
    # Player pushes Block 1 down onto Plate 1.
    # To get to the right side (where Block 2 and Plate 2 are), Alpha wall at x=4 blocks the player!
    # Player must phase shift into Omega at an open coordinate (e.g. (1,1) or (3,1)),
    # walk to the right chamber through x=4, phase shift back to Alpha or stay in Omega,
    # and push Block 2 down onto Plate 2.
    # Then walk to Exit at (4,6) to win!
    {
        'id': 1,
        'name': 'PHASE PRIMER',
        'subtitle': 'Learn to traverse dimensions and position containment crates.',
        'player': (1, 2),
        'realm': 'alpha',
        'blocks': [(2, 2), (5, 2)],
        'plates': [(2, 5), (5, 5)],
        'exit': (4, 6),
        'alpha_walls': BORDERS + [
            # Dividing wall in Alpha
            (4, 1), (4, 2), (4, 3), (4, 4), (4, 5)
        ],
        'omega_walls': BORDERS + [
            # In Omega, the dividing wall is absent, but side obstacles exist
            (1, 4), (6, 4)
        ]
    },
    
    # LEVEL 2: DIMENSION SPLIT
    # Pushing through Alpha to bypass walls present only in Omega.
    # Strategic walls:
    # Block 1 is at (2, 2), Plate 1 at (2, 5).
    # Block 2 is at (5, 3), Plate 2 at (4, 5).
    # In Omega: corridor down column 5 has an Omega-only wall at (5, 4)!
    # Remember: a block CANNOT enter a cell if that cell is a wall in EITHER realm!
    # So Block 2 CANNOT be pushed through (5, 4) because Omega has a wall there!
    # Player must push Block 2 through column 4 or column 3, navigating both realms.
    # Also, player must use phase shifts because Alpha has walls blocking player access.
    {
        'id': 2,
        'name': 'DIMENSION SPLIT',
        'subtitle': 'Route shared matter around alternate-dimension obstacles.',
        'player': (1, 1),
        'realm': 'alpha',
        'blocks': [(2, 2), (4, 2)],
        'plates': [(2, 5), (5, 5)],
        'exit': (3, 6),
        'alpha_walls': BORDERS + [
            (3, 1), (3, 2), (3, 3), # Alpha barrier
            (1, 4), (6, 3)
        ],
        'omega_walls': BORDERS + [
            # Omega wall at (4, 3) and (5, 4)
            (4, 3), (5, 4),
            (1, 3), (6, 4)
        ]
    },
    
    # LEVEL 3: QUANTUM ENIGMA
    # Tight bottlenecks, strategic block ordering, mutual wall avoidance.
    {
        'id': 3,
        'name': 'QUANTUM ENIGMA',
        'subtitle': 'Master precision phase locking through tight quantum corridors.',
        'player': (1, 1),
        'realm': 'alpha',
        'blocks': [(2, 3), (4, 2)],
        'plates': [(1, 5), (6, 5)],
        'exit': (4, 6),
        'alpha_walls': BORDERS + [
            (2, 1), (3, 3), (3, 4), (5, 2), (5, 3), (4, 4)
        ],
        'omega_walls': BORDERS + [
            (1, 2), (2, 4), (4, 3), (5, 4), (3, 2)
        ]
    }
]

if __name__ == '__main__':
    for lvl in LEVELS:
        print(f"\n=================== TESTING LEVEL {lvl['id']}: {lvl['name']} ===================")
        # Test without phase shift
        no_shift_solv, _, _ = solve_level(lvl, allow_phase_shift=False)
        print(f"Solvable WITHOUT phase shift? {no_shift_solv} (Should be False for proper design)")
        
        # Test with phase shift
        solv, length, path = solve_level(lvl, allow_phase_shift=True)
        print(f"Solvable WITH phase shift? {solv}, optimal move count: {length}")
        if solv:
            shifts = [i for i, a in enumerate(path) if a == 'PHASE_SHIFT']
            print(f"Phase shifts used: {len(shifts)} at step indices {shifts}")
            print(f"Sample path ({len(path)} steps): {' -> '.join(path[:12])} ... {' -> '.join(path[-6:])}")
