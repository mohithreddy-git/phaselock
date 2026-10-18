"""
Interactive Level Designer & Verifier for Phase Lock.
Iterates and verifies provably solvable puzzle designs.
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
                
            if (tx, ty) == (b1x, b1y):
                bx, by = tx + dx, ty + dy
                if not (0 <= bx < 8 and 0 <= by < 8):
                    continue
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
                
        if allow_phase_shift:
            other_realm = 1 - realm
            other_walls = alpha_walls if other_realm == 0 else omega_walls
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

# Let's craft Level 1:
# We want:
# In Alpha, a wall completely seals the right room from the left room:
# e.g., (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6) are all Alpha walls!
# Player starts at (1, 2) in Alpha.
# Block 1 at (2, 2), Plate 1 at (2, 5).
# Block 2 at (5, 2), Plate 2 at (5, 5).
# Exit at (6, 1).
# In Alpha: player CANNOT cross column 4 at all! It is 100% blocked from row 1 to row 6!
# In Omega: column 4 has an opening at (4, 2) and (4, 3)! But Omega has walls at (1, 4) and (2, 6).
# In Omega, player can cross through (4, 2) or (4, 3)!
# Therefore, player CANNOT reach the right side in Alpha without Phase Shifting into Omega!
level1 = {
    'id': 1,
    'name': 'PHASE PRIMER',
    'subtitle': 'Learn to traverse dimensions and position containment crates.',
    'player': (1, 2),
    'realm': 'alpha',
    'blocks': [(2, 2), (5, 2)],
    'plates': [(2, 5), (5, 5)],
    'exit': (6, 1),
    'alpha_walls': BORDERS + [
        (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6) # Complete divider in Alpha
    ],
    'omega_walls': BORDERS + [
        # In Omega, divider only has walls at (4, 1), (4, 5), (4, 6). (4, 2), (4, 3), (4, 4) are open!
        (4, 1), (4, 5), (4, 6),
        # Obstacles in Omega to guide player
        (1, 4), (2, 6), (6, 4)
    ]
}

# Let's craft Level 2 (DIMENSION SPLIT):
# Key mechanic: "Requires complex spatial reasoning where blocks must be pushed in Realm Alpha to bypass walls present only in Realm Omega."
# Remember: blocks cannot be pushed into a wall in EITHER realm!
# Player starts at (1, 2) in Alpha.
# Block 1 at (2, 3), Plate 1 at (2, 6).
# Block 2 at (4, 2), Plate 2 at (5, 5).
# Exit at (1, 6).
# Let's design walls:
# In Omega: there's an Omega-only wall at (4, 4).
# If player tries to push Block 2 down column 4 in Omega (or even if in Omega), Block 2 cannot enter (4, 4)!
# Player must route Block 2 through (5, 2) -> (5, 3) -> (5, 4) or around.
# In Alpha: corridor around (5, 3) is clear for blocks, but Alpha has a wall at (3, 2) or (3, 3) that restricts player movement, requiring player to shift realms to get around and push the block!
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
        # Player cannot walk through (3, 1), (3, 2), (3, 3) in Alpha
        (3, 1), (3, 2), (3, 3),
        # Barrier at bottom
        (3, 5), (3, 6)
    ],
    'omega_walls': BORDERS + [
        # Omega wall at (4, 4) - blocks cannot pass through here!
        (4, 4),
        # Omega has walls blocking bottom corridor
        (4, 5), (4, 6),
        # Omega allows walking through (3, 1), (3, 2), (3, 3)
        (6, 2), (6, 3)
    ]
}

# Let's craft Level 3 (QUANTUM ENIGMA):
# Master challenge with tight corridors, phase locking, and dual-realm navigation.
level3 = {
    'id': 3,
    'name': 'QUANTUM ENIGMA',
    'subtitle': 'Master precision phase locking through tight quantum corridors.',
    'player': (2, 1),
    'realm': 'alpha',
    'blocks': [(2, 3), (5, 3)],
    'plates': [(1, 5), (6, 5)],
    'exit': (3, 6),
    'alpha_walls': BORDERS + [
        (1, 2), (3, 1), (3, 2), (3, 4), (4, 4), (6, 2)
    ],
    'omega_walls': BORDERS + [
        (2, 2), (4, 1), (4, 2), (3, 3), (5, 2), (1, 4)
    ]
}

levels = [level1, level2, level3]
for lvl in levels:
    print(f"\n--- Testing Level {lvl['id']}: {lvl['name']} ---")
    no_shift, _, _ = solve_level(lvl, allow_phase_shift=False)
    print(f"Solvable WITHOUT shift: {no_shift} (Expect False)")
    solv, moves, path = solve_level(lvl, allow_phase_shift=True)
    print(f"Solvable WITH shift: {solv}, Move count: {moves}")
    if solv:
        shift_count = sum(1 for a in path if a == 'PHASE_SHIFT')
        print(f"Phase shifts required: {shift_count}")
        print("Path:", " -> ".join(path[:10]), "...", " -> ".join(path[-5:]))
