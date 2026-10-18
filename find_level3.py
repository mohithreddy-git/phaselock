from test_levels import solve_level, BORDERS

# Level 3: We want tight bottlenecks and multiple phase shifts required!
# In Alpha, path to block 2 or plate 2 is blocked by walls,
# but in Omega, path to plate 1 or exit is blocked by walls.
# So player must navigate Alpha to move Block 1, phase shift to Omega to maneuver around walls,
# move Block 2, and phase shift again to access the exit!

def test_l3(alpha_extra, omega_extra, player=(1,1), blocks=[(2,2),(5,3)], plates=[(1,5),(6,5)], exit_pos=(3,6)):
    lvl = {
        'id': 3,
        'name': 'QUANTUM ENIGMA',
        'subtitle': 'Master precision phase locking through tight quantum corridors.',
        'player': player,
        'realm': 'alpha',
        'blocks': blocks,
        'plates': plates,
        'exit': exit_pos,
        'alpha_walls': BORDERS + alpha_extra,
        'omega_walls': BORDERS + omega_extra
    }
    no_shift, _, _ = solve_level(lvl, allow_phase_shift=False)
    solv, moves, path = solve_level(lvl, allow_phase_shift=True)
    if not no_shift and solv:
        shifts = sum(1 for a in path if a == 'PHASE_SHIFT')
        print(f"SUCCESS! Level 3: NoShift={no_shift}, Solvable={solv}, Moves={moves}, Shifts={shifts}")
        return True, lvl, moves, path
    return False, lvl, 0, []

# Let's try some configurations
candidates = [
    # Config 1
    (
        [(3, 1), (3, 2), (3, 3), (1, 4), (5, 4), (5, 5)], # alpha
        [(4, 3), (4, 4), (4, 5), (2, 3), (2, 4), (6, 2)], # omega
        (1, 2), [(2, 2), (5, 2)], [(1, 5), (6, 4)], (3, 6)
    ),
    # Config 2
    (
        [(3, 1), (3, 2), (3, 3), (3, 4), (6, 3)], # alpha has wall column 3
        [(4, 3), (4, 4), (4, 5), (4, 6), (1, 3)], # omega has wall column 4
        (1, 1), [(2, 3), (5, 2)], [(2, 5), (6, 5)], (1, 6)
    ),
    # Config 3
    (
        [(3, 1), (3, 2), (3, 3), (5, 4), (2, 4)], # alpha
        [(4, 2), (4, 3), (4, 4), (1, 3), (5, 2)], # omega
        (1, 1), [(2, 2), (4, 1)], [(1, 5), (5, 5)], (3, 6)
    ),
    # Config 4
    (
        [(3, 1), (3, 2), (3, 3), (4, 4), (5, 4)], # alpha
        [(4, 1), (4, 2), (4, 3), (2, 4), (3, 4)], # omega
        (1, 2), [(2, 3), (5, 3)], [(1, 5), (6, 5)], (4, 6)
    ),
    # Config 5
    (
        [(3, 1), (3, 2), (3, 3), (3, 4), (5, 5)], # alpha wall at col 3 (top)
        [(4, 3), (4, 4), (4, 5), (4, 6), (2, 2)], # omega wall at col 4 (bottom)
        (1, 1), [(2, 3), (5, 2)], [(1, 5), (5, 4)], (6, 1)
    )
]

for i, (a_walls, o_walls, p, bl, pl, ex) in enumerate(candidates):
    print(f"Testing Candidate {i+1}...")
    success, lvl, moves, path = test_l3(a_walls, o_walls, p, bl, pl, ex)
    if success:
        print(f"Candidate {i+1} passed! Path sample: {path}")
        break
