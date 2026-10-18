"""
Authoritative Level Definitions and Verification Suite for PHASE LOCK.
Tests all 3 levels using exact game engine rules.
"""

from collections import deque
import json

def get_borders():
    walls = []
    for i in range(8):
        walls.append((i, 0))
        walls.append((i, 7))
        walls.append((0, i))
        walls.append((7, i))
    return sorted(list(set(walls)))

BORDERS = get_borders()

LEVELS_CONFIG = [
    {
        "id": 1,
        "name": "PHASE PRIMER",
        "subtitle": "Learn to traverse dimensions and position containment crates.",
        "difficulty": "Cadet",
        "parMoves": 21,
        "starThresholds": {"three": 24, "two": 32, "one": 50},
        "player": {"x": 1, "y": 2},
        "realm": "alpha",
        "blocks": [{"x": 2, "y": 2}, {"x": 5, "y": 2}],
        "plates": [{"x": 2, "y": 5}, {"x": 5, "y": 5}],
        "exit": {"x": 6, "y": 1},
        "alphaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6)
            ])
        ],
        "omegaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (4, 1), (4, 5), (4, 6),
                (1, 4), (2, 6), (6, 4)
            ])
        ]
    },
    {
        "id": 2,
        "name": "DIMENSION SPLIT",
        "subtitle": "Route shared matter around alternate-dimension obstacles.",
        "difficulty": "Operator",
        "parMoves": 19,
        "starThresholds": {"three": 22, "two": 30, "one": 48},
        "player": {"x": 1, "y": 2},
        "realm": "alpha",
        "blocks": [{"x": 2, "y": 3}, {"x": 4, "y": 2}],
        "plates": [{"x": 2, "y": 6}, {"x": 5, "y": 5}],
        "exit": {"x": 1, "y": 6},
        "alphaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (3, 1), (3, 2), (3, 3),
                (3, 5), (3, 6)
            ])
        ],
        "omegaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (4, 4), (4, 5), (4, 6),
                (6, 2), (6, 3)
            ])
        ]
    },
    {
        "id": 3,
        "name": "QUANTUM ENIGMA",
        "subtitle": "Master precision phase locking through tight quantum corridors.",
        "difficulty": "Architect",
        "parMoves": 32,
        "starThresholds": {"three": 36, "two": 48, "one": 70},
        "player": {"x": 1, "y": 2},
        "realm": "alpha",
        "blocks": [{"x": 2, "y": 3}, {"x": 5, "y": 3}],
        "plates": [{"x": 1, "y": 5}, {"x": 6, "y": 5}],
        "exit": {"x": 4, "y": 6},
        "alphaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (3, 1), (3, 2), (3, 3), (4, 4), (5, 4)
            ])
        ],
        "omegaWalls": [
            {"x": x, "y": y} for x, y in sorted(BORDERS + [
                (4, 1), (4, 2), (4, 3), (2, 4), (3, 4)
            ])
        ]
    }
]

def run_simulation(level, allow_shift=True):
    alpha_walls = {(w['x'], w['y']) for w in level['alphaWalls']}
    omega_walls = {(w['x'], w['y']) for w in level['omegaWalls']}
    plates = {(p['x'], p['y']) for p in level['plates']}
    exit_pos = (level['exit']['x'], level['exit']['y'])
    
    px, py = level['player']['x'], level['player']['y']
    b1 = (level['blocks'][0]['x'], level['blocks'][0]['y'])
    b2 = (level['blocks'][1]['x'], level['blocks'][1]['y'])
    sb1, sb2 = sorted([b1, b2])
    
    start_realm = 0 if level['realm'] == 'alpha' else 1
    start_state = (px, py, start_realm, sb1[0], sb1[1], sb2[0], sb2[1])
    
    queue = deque([start_state])
    visited = {start_state}
    parent = {start_state: None}
    action_map = {start_state: None}
    
    moves = [('UP', 0, -1), ('DOWN', 0, 1), ('LEFT', -1, 0), ('RIGHT', 1, 0)]
    target = None
    
    while queue:
        st = queue.popleft()
        c_px, c_py, c_realm, b1x, b1y, b2x, b2y = st
        
        # Check victory
        if {(b1x, b1y), (b2x, b2y)} == plates and (c_px, c_py) == exit_pos:
            target = st
            break
            
        cur_walls = alpha_walls if c_realm == 0 else omega_walls
        
        for name, dx, dy in moves:
            nx, ny = c_px + dx, c_py + dy
            if not (0 <= nx < 8 and 0 <= ny < 8):
                continue
            if (nx, ny) in cur_walls:
                continue
                
            if (nx, ny) == (b1x, b1y):
                bx, by = nx + dx, ny + dy
                if not (0 <= bx < 8 and 0 <= by < 8):
                    continue
                if (bx, by) in alpha_walls or (bx, by) in omega_walls:
                    continue
                if (bx, by) == (b2x, b2y):
                    continue
                nb1, nb2 = sorted([(bx, by), (b2x, b2y)])
                nxt = (nx, ny, c_realm, nb1[0], nb1[1], nb2[0], nb2[1])
            elif (nx, ny) == (b2x, b2y):
                bx, by = nx + dx, ny + dy
                if not (0 <= bx < 8 and 0 <= by < 8):
                    continue
                if (bx, by) in alpha_walls or (bx, by) in omega_walls:
                    continue
                if (bx, by) == (b1x, b1y):
                    continue
                nb1, nb2 = sorted([(b1x, b1y), (bx, by)])
                nxt = (nx, ny, c_realm, nb1[0], nb1[1], nb2[0], nb2[1])
            else:
                nxt = (nx, ny, c_realm, b1x, b1y, b2x, b2y)
                
            if nxt not in visited:
                visited.add(nxt)
                parent[nxt] = st
                action_map[nxt] = name
                queue.append(nxt)
                
        if allow_shift:
            dest_realm = 1 - c_realm
            dest_walls = alpha_walls if dest_realm == 0 else omega_walls
            if (c_px, c_py) not in dest_walls:
                nxt = (c_px, c_py, dest_realm, b1x, b1y, b2x, b2y)
                if nxt not in visited:
                    visited.add(nxt)
                    parent[nxt] = st
                    action_map[nxt] = 'PHASE_SHIFT'
                    queue.append(nxt)
                    
    if not target:
        return False, 0, []
        
    path = []
    curr = target
    while parent[curr] is not None:
        path.append(action_map[curr])
        curr = parent[curr]
    path.reverse()
    return True, len(path), path

def main():
    print("=" * 60)
    print("PHASE LOCK: COMPREHENSIVE PUZZLE VERIFICATION SUITE")
    print("=" * 60)
    
    all_passed = True
    results = []
    
    for lvl in LEVELS_CONFIG:
        print(f"\n[Verifying Level {lvl['id']}: {lvl['name']}]")
        
        # 1. Must NOT be solvable without Phase Shift
        solv_no_shift, _, _ = run_simulation(lvl, allow_shift=False)
        print(f"  * Solvable without Phase Shift? {solv_no_shift} -> {'PASS' if not solv_no_shift else 'FAIL'}")
        if solv_no_shift:
            print("    ERROR: Level can be solved without using the core phase-shift mechanic!")
            all_passed = False
            
        # 2. MUST be solvable with Phase Shift
        solv, count, path = run_simulation(lvl, allow_shift=True)
        print(f"  * Solvable with Phase Shift? {solv} -> {'PASS' if solv else 'FAIL'}")
        if not solv:
            print("    ERROR: Level has no valid solution path!")
            all_passed = False
        else:
            shifts = sum(1 for a in path if a == 'PHASE_SHIFT')
            print(f"  * Minimal moves to solve: {count} (Phase shifts used: {shifts})")
            print(f"  * Par set to: {lvl['parMoves']} moves")
            print(f"  * First 8 steps: {' -> '.join(path[:8])}")
            print(f"  * Final 4 steps: {' -> '.join(path[-4:])}")
            results.append({
                "id": lvl["id"],
                "name": lvl["name"],
                "optimalMoves": count,
                "phaseShifts": shifts,
                "solution": path
            })
            
    print("\n" + "=" * 60)
    if all_passed:
        print(">>> ALL 3 LEVELS ARE PROVABLY SOLVABLE AND MECHANIC-LOCKED! <<<")
    else:
        print(">>> VERIFICATION FAILED! <<<")
    print("=" * 60)
    
    # Save results as JSON for reference and automated integration
    with open('verified_solutions.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    main()
