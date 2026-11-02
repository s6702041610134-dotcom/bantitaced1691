export const THEME = {
  colors: {
    // Surface Tokens (design.md)
    ivory: '#D8D4C7',        // Main warm device surface
    paper: '#F0EDE3',        // Lighter surface variation / tactile button face
    tealDark: '#183D3D',     // CRT display & dark recessed panels
    teal: '#285B58',         // Secondary dark surfaces / CRT bezel
    mint: '#91B9A7',         // Display text & restrained highlights
    olive: '#B4C96A',        // Active indicators & status accents
    charcoal: '#242525',     // Primary text & dark outlines
    warmGray: '#A9A69C',     // Secondary text, inactive controls, borders
    offWhite: '#FAF9F4',     // Contrast detail & highlights

    // Mapped Functional Aliases
    bgDark: '#D8D4C7',       // Main outer casing color
    bgCrt: '#183D3D',        // CRT Screen surface
    bgCard: '#F0EDE3',       // Tactile paper card
    bgCardBorder: '#242525', // Crisp charcoal outline
    
    primary: '#285B58',      // Retro Deep Teal
    primaryLight: '#91B9A7', // Mint Accent
    primaryDark: '#183D3D',
    
    accent: '#B4C96A',       // Olive Green Accent
    accentGold: '#D99B26',   // Retro Amber/Gold for stars
    
    success: '#B4C96A',      // Olive Status
    danger: '#C84B31',       // Retro Rust Red for hazards
    
    keyPink: '#D96088',      // Retro Magenta
    keyBlue: '#4AA3A1',      // Retro Cyan
    
    textPrimary: '#242525',   // Crisp Charcoal
    textSecondary: '#5A5D5C',
    textMuted: '#A9A69C',
    textCrtMint: '#91B9A7',   // CRT Mint Green display text
    textCrtAmber: '#B4C96A',  // CRT Olive/Amber text
    
    // Board textures & 3D styling for CRT display
    boardWoodDark: '#122E2E',
    boardWoodBevel: '#183D3D',
    boardGridLine: '#285B58',
    
    wallTop: '#91B9A7',
    wallFront: '#285B58',
    wallSide: '#183D3D',
    wallHighlight: '#E0EBE5',
    
    ballBase: '#B4C96A',     // Olive Chrome Ball
    ballShine: '#FAF9F4',
    ballShadow: '#183D3D',
    
    holeGlow: '#C84B31',
    holeVoid: '#0E1717',
    
    portalRing: '#B4C96A',
    portalCore: '#91B9A7',
  },
  
  levelThemes: {
    1: {
      name: 'Training CRT',
      subtitle: 'SYS.TEST // SENSOR BALANCING',
      wallTop: '#91B9A7',
      wallFront: '#285B58',
      wallSide: '#183D3D',
      wallHighlight: '#D8D4C7',
      boardBg: '#183D3D',
      boardGrid: '#285B58',
      accent: '#B4C96A',
    },
    2: {
      name: 'Hazard Sector',
      subtitle: 'SYS.WARN // ABYSS TRAP GRID',
      wallTop: '#B4C96A',
      wallFront: '#4E6C32',
      wallSide: '#243B14',
      wallHighlight: '#F0EDE3',
      boardBg: '#132824',
      boardGrid: '#25443D',
      accent: '#B4C96A',
    },
    3: {
      name: 'Mechanized Core',
      subtitle: 'SYS.MECH // MOVING LABYRINTH',
      wallTop: '#D99B26',
      wallFront: '#8C6013',
      wallSide: '#4A3208',
      wallHighlight: '#FAF9F4',
      boardBg: '#212A1F',
      boardGrid: '#394736',
      accent: '#D99B26',
    },
    4: {
      name: 'Master Console',
      subtitle: 'SYS.FINAL // OVERLORD MAZE',
      wallTop: '#C84B31',
      wallFront: '#822B18',
      wallSide: '#42140A',
      wallHighlight: '#F0EDE3',
      boardBg: '#251717',
      boardGrid: '#4A2A2A',
      accent: '#C84B31',
    },
  },
  
  shadows: {
    tactile: {
      shadowColor: '#242525',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    crtGlow: {
      shadowColor: '#91B9A7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
    }
  }
};

