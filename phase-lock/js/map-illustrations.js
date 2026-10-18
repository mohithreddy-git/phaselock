/**
 * MapIllustrations - Offline Scalable Vector Graphics Artwork for PHASE LOCK
 * Handcrafted vector artwork for NEON CITY, CRYSTAL CAVES, and SKY ISLANDS.
 * 100% offline, zero external dependencies, retina-crisp at any resolution.
 */

const MapIllustrations = {
  /**
   * Returns a complete, self-contained SVG illustration for the map selection screen
   * @param {string} mapId - 'neon' | 'quantum' | 'void'
   * @returns {string} SVG markup
   */
  getMapIllustration(mapId) {
    if (mapId === 'neon') {
      return `
      <svg class="map-art-svg" viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="neonSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#070914"/>
            <stop offset="60%" stop-color="#0c172d"/>
            <stop offset="100%" stop-color="#190e2e"/>
          </linearGradient>
          <linearGradient id="neonSun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
          <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#00b4d8" stop-opacity="0.2"/>
          </linearGradient>
          <linearGradient id="roadGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#ff007f" stop-opacity="0.9"/>
          </linearGradient>
          <filter id="cityBlur">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
        </defs>

        <!-- Sky Background -->
        <rect width="460" height="260" fill="url(#neonSky)"/>

        <!-- Cyber Sun / Moon with Scanlines -->
        <circle cx="230" cy="115" r="48" fill="url(#neonSun)" opacity="0.85"/>
        <g opacity="0.35">
          <line x1="180" y1="95" x2="280" y2="95" stroke="#070914" stroke-width="2"/>
          <line x1="180" y1="105" x2="280" y2="105" stroke="#070914" stroke-width="2.5"/>
          <line x1="180" y1="117" x2="280" y2="117" stroke="#070914" stroke-width="3"/>
          <line x1="180" y1="130" x2="280" y2="130" stroke="#070914" stroke-width="3.5"/>
          <line x1="180" y1="145" x2="280" y2="145" stroke="#070914" stroke-width="4"/>
        </g>

        <!-- Distant City Silhouette -->
        <polygon points="10,180 35,120 60,120 70,180" fill="#0d1424"/>
        <polygon points="65,180 85,90 120,90 135,180" fill="#0f192e"/>
        <polygon points="130,180 150,130 185,130 195,180" fill="#0d1424"/>
        <polygon points="265,180 275,100 310,100 325,180" fill="#0f192e"/>
        <polygon points="320,180 340,75 375,75 390,180" fill="#0d1424"/>
        <polygon points="385,180 405,115 440,115 455,180" fill="#0f192e"/>

        <!-- Midground High-Rise Towers with Glowing Windows -->
        <!-- Tower 1 -->
        <rect x="30" y="100" width="45" height="110" fill="#141c30" stroke="#00f3ff" stroke-width="0.8" stroke-opacity="0.4"/>
        <g fill="#00f3ff" opacity="0.75">
          <rect x="35" y="110" width="4" height="6"/><rect x="43" y="110" width="4" height="6"/><rect x="51" y="110" width="4" height="6"/><rect x="59" y="110" width="4" height="6"/>
          <rect x="35" y="125" width="4" height="6"/><rect x="51" y="125" width="4" height="6"/><rect x="59" y="125" width="4" height="6"/>
          <rect x="43" y="140" width="4" height="6"/><rect x="51" y="140" width="4" height="6"/>
          <rect x="35" y="155" width="4" height="6"/><rect x="43" y="155" width="4" height="6"/><rect x="59" y="155" width="4" height="6"/>
          <rect x="35" y="170" width="4" height="6"/><rect x="51" y="170" width="4" height="6"/>
        </g>
        <line x1="52" y1="100" x2="52" y2="70" stroke="#ff007f" stroke-width="1.5"/>
        <circle cx="52" cy="69" r="2" fill="#ff007f"/>

        <!-- Tower 2 (Big Skyscraper Left) -->
        <rect x="85" y="70" width="60" height="140" fill="#101726" stroke="#ff007f" stroke-width="1" stroke-opacity="0.5"/>
        <g fill="#ff007f" opacity="0.7">
          <rect x="93" y="80" width="6" height="4"/><rect x="105" y="80" width="6" height="4"/><rect x="125" y="80" width="6" height="4"/>
          <rect x="93" y="95" width="6" height="4"/><rect x="115" y="95" width="6" height="4"/><rect x="125" y="95" width="6" height="4"/>
          <rect x="105" y="110" width="6" height="4"/><rect x="115" y="110" width="6" height="4"/>
          <rect x="93" y="125" width="6" height="4"/><rect x="125" y="125" width="6" height="4"/>
          <rect x="93" y="140" width="6" height="4"/><rect x="105" y="140" width="6" height="4"/><rect x="115" y="140" width="6" height="4"/>
        </g>
        <!-- Rooftop Antenna -->
        <line x1="115" y1="70" x2="115" y2="40" stroke="#00f3ff" stroke-width="2"/>
        <circle cx="115" cy="38" r="2.5" fill="#00f3ff"/>

        <!-- Tower 3 (Center Right Pinnacle) -->
        <rect x="310" y="55" width="65" height="155" fill="#121a2c" stroke="#f59e0b" stroke-width="1" stroke-opacity="0.4"/>
        <g fill="#f59e0b" opacity="0.8">
          <rect x="320" y="70" width="5" height="5"/><rect x="332" y="70" width="5" height="5"/><rect x="345" y="70" width="5" height="5"/><rect x="357" y="70" width="5" height="5"/>
          <rect x="320" y="85" width="5" height="5"/><rect x="345" y="85" width="5" height="5"/><rect x="357" y="85" width="5" height="5"/>
          <rect x="332" y="100" width="5" height="5"/><rect x="345" y="100" width="5" height="5"/>
          <rect x="320" y="115" width="5" height="5"/><rect x="332" y="115" width="5" height="5"/><rect x="357" y="115" width="5" height="5"/>
          <rect x="320" y="130" width="5" height="5"/><rect x="345" y="130" width="5" height="5"/>
        </g>
        <line x1="342" y1="55" x2="342" y2="25" stroke="#ff007f" stroke-width="2"/>
        <circle cx="342" cy="24" r="2.5" fill="#ff007f"/>

        <!-- Tower 4 (Far Right) -->
        <rect x="385" y="90" width="50" height="120" fill="#141c30" stroke="#00f3ff" stroke-width="0.8" stroke-opacity="0.4"/>
        <g fill="#00f3ff" opacity="0.75">
          <rect x="393" y="102" width="4" height="6"/><rect x="403" y="102" width="4" height="6"/><rect x="415" y="102" width="4" height="6"/>
          <rect x="393" y="118" width="4" height="6"/><rect x="415" y="118" width="4" height="6"/>
          <rect x="403" y="134" width="4" height="6"/><rect x="415" y="134" width="4" height="6"/>
          <rect x="393" y="150" width="4" height="6"/><rect x="403" y="150" width="4" height="6"/>
        </g>

        <!-- Foreground Cyber Highway / Neon Street -->
        <polygon points="0,260 160,185 300,185 460,260" fill="#080c16"/>
        <!-- Highway Borders with Neon Strips -->
        <line x1="0" y1="260" x2="160" y2="185" stroke="#00f3ff" stroke-width="3" stroke-linecap="round"/>
        <line x1="460" y1="260" x2="300" y2="185" stroke="#ff007f" stroke-width="3" stroke-linecap="round"/>
        <!-- Center Neon Dashed Road Divider -->
        <line x1="230" y1="186" x2="230" y2="260" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8 6"/>

        <!-- Streetlight Posts & Glows -->
        <g stroke="#00f3ff" stroke-width="1.5" opacity="0.85">
          <line x1="120" y1="210" x2="120" y2="190"/>
          <line x1="120" y1="190" x2="128" y2="190"/>
          <circle cx="128" cy="190" r="3" fill="#00f3ff"/>

          <line x1="340" y1="210" x2="340" y2="190"/>
          <line x1="340" y1="190" x2="332" y2="190"/>
          <circle cx="332" cy="190" r="3" fill="#ff007f"/>
        </g>

        <!-- Neon Perspective Grid Floor Overlay -->
        <g stroke="#00f3ff" stroke-width="0.7" opacity="0.25">
          <line x1="185" y1="185" x2="80" y2="260"/>
          <line x1="210" y1="185" x2="160" y2="260"/>
          <line x1="250" y1="185" x2="300" y2="260"/>
          <line x1="275" y1="185" x2="380" y2="260"/>
          <line x1="100" y1="220" x2="360" y2="220"/>
          <line x1="60" y1="240" x2="400" y2="240"/>
        </g>
      </svg>`;
    }

    if (mapId === 'quantum') {
      return `
      <svg class="map-art-svg" viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="caveBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050811"/>
            <stop offset="50%" stop-color="#0a1224"/>
            <stop offset="100%" stop-color="#140a24"/>
          </linearGradient>
          <linearGradient id="crystalTurq" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#00ffcc"/>
            <stop offset="50%" stop-color="#00b4d8"/>
            <stop offset="100%" stop-color="#03045e"/>
          </linearGradient>
          <linearGradient id="crystalViolet" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#c084fc"/>
            <stop offset="50%" stop-color="#7c3aed"/>
            <stop offset="100%" stop-color="#3b0764"/>
          </linearGradient>
          <radialGradient id="cavernGlow" cx="0.5" cy="0.6" r="0.5">
            <stop offset="0%" stop-color="#00ffcc" stop-opacity="0.35"/>
            <stop offset="50%" stop-color="#7c3aed" stop-opacity="0.15"/>
            <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Cavern Background -->
        <rect width="460" height="260" fill="url(#caveBg)"/>
        <rect width="460" height="260" fill="url(#cavernGlow)"/>

        <!-- Ceiling Stalactites & Rock Roof -->
        <polygon points="0,0 460,0 460,40 430,20 400,65 370,15 340,75 300,30 270,55 240,15 200,85 160,25 120,60 80,20 40,70 10,25 0,50" fill="#0d131f"/>
        <polygon points="30,0 70,0 50,45" fill="#131b2c" stroke="#00ffcc" stroke-width="0.7" stroke-opacity="0.3"/>
        <polygon points="180,0 220,0 200,60" fill="#16152e" stroke="#c084fc" stroke-width="0.7" stroke-opacity="0.4"/>
        <polygon points="325,0 360,0 342,50" fill="#131b2c" stroke="#00ffcc" stroke-width="0.7" stroke-opacity="0.3"/>

        <!-- Rocky Cavern Wall Arches -->
        <path d="M 0,260 L 0,60 Q 60,110 90,160 Q 110,190 120,260 Z" fill="#090d16"/>
        <path d="M 460,260 L 460,50 Q 400,100 370,150 Q 350,190 340,260 Z" fill="#090d16"/>

        <!-- Background Glowing Mineral Veins -->
        <path d="M 100,170 Q 150,140 230,160 Q 300,180 360,150" stroke="#00ffcc" stroke-width="1" stroke-opacity="0.4" fill="none"/>
        <path d="M 120,190 Q 200,170 260,195 Q 320,180 340,210" stroke="#c084fc" stroke-width="1" stroke-opacity="0.4" fill="none"/>

        <!-- Main Central Crystal Formation (Clustered Geodes) -->
        <!-- Big Violet Crystal Core -->
        <polygon points="210,180 230,105 245,115 235,185" fill="url(#crystalViolet)" stroke="#e9d5ff" stroke-width="1"/>
        <polygon points="230,105 245,115 260,180 235,185" fill="#581c87" opacity="0.9"/>
        <line x1="230" y1="105" x2="238" y2="182" stroke="#f3e8ff" stroke-width="0.8"/>

        <!-- Large Turquoise Crystal (Left leaning) -->
        <polygon points="175,190 190,120 208,135 198,195" fill="url(#crystalTurq)" stroke="#a7f3d0" stroke-width="1"/>
        <polygon points="190,120 208,135 215,190 198,195" fill="#065f46" opacity="0.85"/>
        <line x1="190" y1="120" x2="202" y2="192" stroke="#ccfbf1" stroke-width="0.8"/>

        <!-- Sharp Cyan Crystal Spire (Right leaning) -->
        <polygon points="250,195 270,125 285,140 270,200" fill="url(#crystalTurq)" stroke="#a7f3d0" stroke-width="1"/>
        <polygon points="270,125 285,140 290,195 270,200" fill="#0077b6" opacity="0.9"/>
        <line x1="270" y1="125" x2="278" y2="198" stroke="#e0f2fe" stroke-width="0.8"/>

        <!-- Smaller Crystal Shards Around Base -->
        <polygon points="150,205 160,165 172,175 165,210" fill="url(#crystalViolet)" stroke="#d8b4fe" stroke-width="0.8"/>
        <polygon points="285,210 298,160 310,172 300,215" fill="url(#crystalTurq)" stroke="#5eead4" stroke-width="0.8"/>
        <polygon points="225,210 235,170 245,178 240,215" fill="url(#crystalViolet)" stroke="#e9d5ff" stroke-width="0.8"/>

        <!-- Subterranean Glowing Cavern Pool / Pathway -->
        <ellipse cx="230" cy="225" rx="140" ry="24" fill="#0a1d2e" stroke="#00ffcc" stroke-width="1.2" stroke-opacity="0.5"/>
        <ellipse cx="230" cy="225" rx="105" ry="15" fill="#072238" stroke="#7c3aed" stroke-width="1" stroke-opacity="0.4"/>
        <!-- Water Reflections -->
        <line x1="180" y1="223" x2="220" y2="223" stroke="#00ffcc" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="235" y1="227" x2="280" y2="227" stroke="#c084fc" stroke-width="1.5" stroke-opacity="0.7"/>
        <line x1="210" y1="232" x2="250" y2="232" stroke="#00ffcc" stroke-width="1" stroke-opacity="0.6"/>

        <!-- Glowing Cavern Dust / Spores -->
        <g fill="#00ffcc" opacity="0.75">
          <circle cx="160" cy="110" r="1.5"/><circle cx="200" cy="85" r="2"/><circle cx="270" cy="95" r="1.5"/><circle cx="310" cy="120" r="2"/><circle cx="240" cy="65" r="1.5"/>
        </g>
        <g fill="#c084fc" opacity="0.75">
          <circle cx="140" cy="140" r="2"/><circle cx="220" cy="95" r="1.5"/><circle cx="290" cy="80" r="2"/><circle cx="180" cy="75" r="1.5"/>
        </g>
      </svg>`;
    }

    if (mapId === 'void') {
      return `
      <svg class="map-art-svg" viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0b071a"/>
            <stop offset="50%" stop-color="#1f103d"/>
            <stop offset="100%" stop-color="#3b1d60"/>
          </linearGradient>
          <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6d28d9" stop-opacity="0.6"/>
            <stop offset="60%" stop-color="#311042" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#12071f" stop-opacity="0.95"/>
          </linearGradient>
          <linearGradient id="goldBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9"/>
            <stop offset="50%" stop-color="#f59e0b" stop-opacity="0.7"/>
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0.9"/>
          </linearGradient>
          <linearGradient id="islandRock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2d1b4e"/>
            <stop offset="40%" stop-color="#1b122e"/>
            <stop offset="100%" stop-color="#0c0717"/>
          </linearGradient>
        </defs>

        <!-- Sky & Deep Atmosphere -->
        <rect width="460" height="260" fill="url(#skyGrad)"/>

        <!-- Distant Stars & Celestial Dust -->
        <g fill="#ffffff" opacity="0.65">
          <circle cx="45" cy="35" r="1"/><circle cx="85" cy="55" r="1.5"/><circle cx="140" cy="25" r="1"/><circle cx="195" cy="45" r="1.2"/>
          <circle cx="280" cy="30" r="1.5"/><circle cx="350" cy="50" r="1"/><circle cx="410" cy="25" r="1.5"/><circle cx="430" cy="65" r="1"/>
          <circle cx="110" cy="80" r="1.8"/><circle cx="230" cy="20" r="2"/><circle cx="320" cy="70" r="1.2"/><circle cx="390" cy="85" r="1.8"/>
        </g>

        <!-- Distant Mountain Peaks Piercing Cloudline -->
        <polygon points="60,170 110,95 160,170" fill="#1b1030" opacity="0.6"/>
        <polygon points="140,170 190,110 240,170" fill="#160c28" opacity="0.7"/>
        <polygon points="310,170 365,85 420,170" fill="#1a0f30" opacity="0.6"/>

        <!-- Sea of Rolling Clouds -->
        <path d="M 0,175 Q 40,155 80,170 Q 130,145 180,165 Q 240,140 300,165 Q 360,150 410,170 Q 440,160 460,175 L 460,260 L 0,260 Z" fill="url(#cloudGrad)"/>

        <!-- Floating Island 1 (Left Islet) -->
        <path d="M 40,140 Q 80,135 110,140 L 95,175 Q 75,190 60,165 Z" fill="url(#islandRock)" stroke="#c084fc" stroke-width="0.8"/>
        <!-- Plateau surface -->
        <ellipse cx="75" cy="140" rx="35" ry="6" fill="#38225e" stroke="#fbbf24" stroke-width="0.7"/>
        <!-- Runic Beacon on Islet 1 -->
        <polygon points="72,138 75,120 78,138" fill="#fbbf24"/>
        <circle cx="75" cy="116" r="2.5" fill="#fbbf24"/>

        <!-- Floating Island 2 (Right Platform) -->
        <path d="M 330,135 Q 380,130 420,135 L 400,180 Q 375,195 345,160 Z" fill="url(#islandRock)" stroke="#c084fc" stroke-width="0.8"/>
        <ellipse cx="375" cy="135" rx="45" ry="7" fill="#38225e" stroke="#fbbf24" stroke-width="0.7"/>
        <!-- Monolith on Platform 2 -->
        <rect x="385" y="115" width="6" height="20" fill="#1b122e" stroke="#c084fc" stroke-width="0.8"/>
        <circle cx="388" cy="110" r="2.5" fill="#c084fc"/>

        <!-- Luminous Energy Bridge (Connecting Left and Center Islands) -->
        <path d="M 105,140 Q 160,150 200,135" stroke="url(#goldBeam)" stroke-width="2.5" fill="none" stroke-dasharray="6 3"/>
        <!-- Energy Bridge (Connecting Center and Right Platforms) -->
        <path d="M 270,135 Q 305,150 335,137" stroke="url(#goldBeam)" stroke-width="2.5" fill="none" stroke-dasharray="6 3"/>

        <!-- Main Center Island (The Grand Sanctuary Platform) -->
        <path d="M 170,135 Q 235,128 300,135 L 285,190 Q 255,220 235,225 Q 215,220 185,185 Z" fill="url(#islandRock)" stroke="#fbbf24" stroke-width="1.2"/>
        <ellipse cx="235" cy="135" rx="65" ry="10" fill="#442a70" stroke="#fbbf24" stroke-width="1"/>

        <!-- Ancient Temple / Celestial Arch on Center Island -->
        <!-- Arch Pillars -->
        <rect x="210" y="95" width="7" height="40" fill="#201538" stroke="#c084fc" stroke-width="0.8"/>
        <rect x="253" y="95" width="7" height="40" fill="#201538" stroke="#c084fc" stroke-width="0.8"/>
        <!-- Arch Lintel -->
        <polygon points="204,95 270,95 265,88 209,88" fill="#301d52" stroke="#fbbf24" stroke-width="1"/>
        <!-- Hovering Glowing Portal Diamond -->
        <polygon points="235,96 243,108 235,120 227,108" fill="#fbbf24" stroke="#ffffff" stroke-width="0.8"/>
        <circle cx="235" cy="108" r="3" fill="#ffffff"/>

        <!-- Lower Cloud Mist & Island Under-glow -->
        <ellipse cx="235" cy="210" rx="90" ry="18" fill="#6d28d9" opacity="0.35"/>
        <ellipse cx="235" cy="225" rx="130" ry="22" fill="#311042" opacity="0.5"/>

        <!-- Floating Energy Orbs / Wisps -->
        <g fill="#fbbf24" opacity="0.85">
          <circle cx="150" cy="130" r="2"/><circle cx="180" cy="115" r="1.5"/><circle cx="290" cy="120" r="1.8"/><circle cx="320" cy="130" r="2"/>
        </g>
        <g fill="#c084fc" opacity="0.85">
          <circle cx="125" cy="142" r="1.5"/><circle cx="215" cy="75" r="2"/><circle cx="255" cy="75" r="2"/><circle cx="350" cy="140" r="1.5"/>
        </g>
      </svg>`;
    }

    return '';
  },

  /**
   * Returns progression path decorative backdrop SVG and coordinates for the 5 circular nodes
   * @param {string} mapId - 'neon' | 'quantum' | 'void'
   * @returns {{ pathSvg: string, nodeCoords: Array<{x: number, y: number}> }}
   */
  getProgressionMapConfig(mapId) {
    // 5 Node normalized coordinates [0..100] for desktop responsive curved route
    const nodeCoords = [
      { x: 15, y: 68 },
      { x: 30, y: 32 },
      { x: 50, y: 70 },
      { x: 70, y: 30 },
      { x: 85, y: 52 }
    ];

    if (mapId === 'neon') {
      const pathSvg = `
        <defs>
          <linearGradient id="neonPathGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00f3ff"/>
            <stop offset="50%" stop-color="#ff007f"/>
            <stop offset="100%" stop-color="#00f3ff"/>
          </linearGradient>
          <filter id="neonPathGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Subtle City Skyline Silhouette in background of level map -->
        <g opacity="0.18" fill="#00f3ff">
          <rect x="50" y="80" width="60" height="200"/>
          <rect x="140" y="40" width="70" height="240"/>
          <rect x="230" y="100" width="55" height="180"/>
          <rect x="320" y="50" width="80" height="230"/>
          <rect x="430" y="70" width="60" height="210"/>
          <rect x="520" y="30" width="75" height="250"/>
          <rect x="620" y="85" width="65" height="195"/>
          <rect x="710" y="45" width="80" height="235"/>
          <rect x="810" y="90" width="60" height="190"/>
        </g>

        <!-- Cyber Grid Floor -->
        <g stroke="rgba(0, 243, 255, 0.08)" stroke-width="1">
          <line x1="0" y1="280" x2="900" y2="280"/>
          <line x1="0" y1="320" x2="900" y2="320"/>
          <line x1="100" y1="260" x2="100" y2="360"/>
          <line x1="250" y1="260" x2="250" y2="360"/>
          <line x1="450" y1="260" x2="450" y2="360"/>
          <line x1="650" y1="260" x2="650" y2="360"/>
          <line x1="800" y1="260" x2="800" y2="360"/>
        </g>

        <!-- Winding City Highway Road Ribbon -->
        <path d="M 108,245 C 170,245 200,115 270,115 C 350,115 380,252 450,252 C 530,252 560,108 630,108 C 710,108 730,187 792,187"
              stroke="#0d1829" stroke-width="32" fill="none" stroke-linecap="round"/>
        <path d="M 108,245 C 170,245 200,115 270,115 C 350,115 380,252 450,252 C 530,252 560,108 630,108 C 710,108 730,187 792,187"
              stroke="#00f3ff" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#neonPathGlow)" opacity="0.9"/>
        <path d="M 108,245 C 170,245 200,115 270,115 C 350,115 380,252 450,252 C 530,252 560,108 630,108 C 710,108 730,187 792,187"
              stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-dasharray="10 8"/>
      `;
      return { pathSvg, nodeCoords };
    }

    if (mapId === 'quantum') {
      const pathSvg = `
        <defs>
          <linearGradient id="cavesPathGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#00ffcc"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#00ffcc"/>
          </linearGradient>
          <filter id="crystalGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Organic Cavern Wall Contours & Crystal Formations -->
        <g fill="#0e1726" opacity="0.6">
          <polygon points="0,0 200,0 120,70 40,40"/>
          <polygon points="350,0 550,0 480,60 380,30"/>
          <polygon points="700,0 900,0 850,75 730,40"/>
          <polygon points="0,360 220,360 160,300 30,330"/>
          <polygon points="400,360 620,360 540,310 430,340"/>
          <polygon points="750,360 900,360 860,305 780,330"/>
        </g>

        <!-- Ambient Crystal Formations along edges -->
        <g stroke="#00ffcc" stroke-width="1" fill="#00ffcc" fill-opacity="0.15">
          <polygon points="70,180 85,130 95,145 80,185"/>
          <polygon points="210,60 225,20 235,35 220,70"/>
          <polygon points="390,260 405,210 415,225 400,270"/>
          <polygon points="560,50 575,10 585,25 570,60"/>
          <polygon points="740,240 755,190 765,205 750,250"/>
        </g>

        <!-- Winding Subterranean Tunnel Path -->
        <path d="M 108,245 C 160,260 190,115 270,115 C 360,115 370,252 450,252 C 540,252 550,108 630,108 C 720,108 740,187 792,187"
              stroke="#08101a" stroke-width="36" fill="none" stroke-linecap="round"/>
        <path d="M 108,245 C 160,260 190,115 270,115 C 360,115 370,252 450,252 C 540,252 550,108 630,108 C 720,108 740,187 792,187"
              stroke="#00ffcc" stroke-width="4.5" fill="none" stroke-linecap="round" filter="url(#crystalGlow)" opacity="0.9"/>
        <path d="M 108,245 C 160,260 190,115 270,115 C 360,115 370,252 450,252 C 540,252 550,108 630,108 C 720,108 740,187 792,187"
              stroke="#a855f7" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="12 10"/>
      `;
      return { pathSvg, nodeCoords };
    }

    if (mapId === 'void') {
      const pathSvg = `
        <defs>
          <linearGradient id="skyBridgeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#c084fc"/>
            <stop offset="50%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
          <filter id="bridgeGlow">
            <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <!-- Floating Cloud Banks in background -->
        <g fill="#4c1d95" opacity="0.25">
          <ellipse cx="150" cy="280" rx="140" ry="40"/>
          <ellipse cx="380" cy="90" rx="160" ry="45"/>
          <ellipse cx="550" cy="290" rx="180" ry="50"/>
          <ellipse cx="780" cy="120" rx="150" ry="40"/>
        </g>

        <!-- Floating Island Platforms behind nodes -->
        <g fill="#1f1438" stroke="#c084fc" stroke-width="1.2">
          <!-- Island 1 -->
          <ellipse cx="108" cy="255" rx="55" ry="18" fill="#281a48"/>
          <path d="M 60,255 L 108,290 L 156,255 Z" fill="#150e26"/>
          <!-- Island 2 -->
          <ellipse cx="270" cy="122" rx="58" ry="18" fill="#281a48"/>
          <path d="M 220,122 L 270,160 L 320,122 Z" fill="#150e26"/>
          <!-- Island 3 -->
          <ellipse cx="450" cy="260" rx="62" ry="19" fill="#281a48"/>
          <path d="M 395,260 L 450,298 L 505,260 Z" fill="#150e26"/>
          <!-- Island 4 -->
          <ellipse cx="630" cy="115" rx="58" ry="18" fill="#281a48"/>
          <path d="M 580,115 L 630,152 L 680,115 Z" fill="#150e26"/>
          <!-- Island 5 -->
          <ellipse cx="792" cy="195" rx="60" ry="19" fill="#281a48"/>
          <path d="M 740,195 L 792,235 L 844,195 Z" fill="#150e26"/>
        </g>

        <!-- Curved Celestial Energy Bridge -->
        <path d="M 108,245 C 170,245 200,115 270,115 C 350,115 380,252 450,252 C 530,252 560,108 630,108 C 710,108 730,187 792,187"
              stroke="#fbbf24" stroke-width="4.5" fill="none" stroke-linecap="round" filter="url(#bridgeGlow)" opacity="0.95"/>
        <path d="M 108,245 C 170,245 200,115 270,115 C 350,115 380,252 450,252 C 530,252 560,108 630,108 C 710,108 730,187 792,187"
              stroke="#ffffff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-dasharray="8 6"/>
      `;
      return { pathSvg, nodeCoords };
    }

    return { pathSvg: '', nodeCoords };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapIllustrations;
}
