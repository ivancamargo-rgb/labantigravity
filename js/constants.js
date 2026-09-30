/**
 * Antigravity 3D Soccer - Game Constants & Data
 */

const PITCH_CONFIG = {
    length: 110,
    width: 70,
    goalWidth: 14,
    goalHeight: 5,
    goalDepth: 4,
    penaltyWidth: 34,
    penaltyDepth: 18,
    smallBoxWidth: 18,
    smallBoxDepth: 6,
    centerCircleRadius: 9.15,
    penaltySpotDist: 11
};

const TEAMS_DATA = {
    real_madrid: {
        id: "real_madrid",
        name: "Real Madrid",
        shortName: "RMA",
        color: "#ffffff",
        secondaryColor: "#e0ae00",
        numColor: "#111b36",
        shortsColor: "#ffffff",
        socksColor: "#ffffff",
        gkColor: "#00d26a",
        rating: 93,
        players: [
            { num: 1, name: "Courtois", role: "GK", pos: [0, -50], speed: 1.0, power: 1.1 },
            { num: 2, name: "Carvajal", role: "RB", pos: [22, -35], speed: 1.1, power: 1.0 },
            { num: 3, name: "Militao", role: "CB", pos: [8, -38], speed: 1.1, power: 1.1 },
            { num: 22, name: "Rüdiger", role: "CB", pos: [-8, -38], speed: 1.15, power: 1.2 },
            { num: 23, name: "Mendy", role: "LB", pos: [-22, -35], speed: 1.15, power: 1.0 },
            { num: 8, name: "Valverde", role: "CM", pos: [12, -18], speed: 1.25, power: 1.25 },
            { num: 14, name: "Tchouaméni", role: "CDM", pos: [0, -24], speed: 1.1, power: 1.1 },
            { num: 5, name: "Bellingham", role: "CAM", pos: [0, -8], speed: 1.18, power: 1.2 },
            { num: 11, name: "Rodrygo", role: "RW", pos: [24, -2], speed: 1.25, power: 1.15 },
            { num: 9, name: "Mbappé", role: "ST", pos: [0, 5], speed: 1.35, power: 1.3 },
            { num: 7, name: "Vinícius Jr.", role: "LW", pos: [-24, -2], speed: 1.35, power: 1.2 }
        ]
    },
    barcelona: {
        id: "barcelona",
        name: "FC Barcelona",
        shortName: "FCB",
        color: "#a50044",
        secondaryColor: "#004d98",
        numColor: "#edbb00",
        shortsColor: "#004d98",
        socksColor: "#004d98",
        gkColor: "#00b4d8",
        rating: 91,
        players: [
            { num: 1, name: "Ter Stegen", role: "GK", pos: [0, 50], speed: 1.0, power: 1.1 },
            { num: 23, name: "Koundé", role: "RB", pos: [-22, 35], speed: 1.15, power: 1.05 },
            { num: 2, name: "Cubarsí", role: "CB", pos: [-8, 38], speed: 1.05, power: 1.05 },
            { num: 4, name: "Araújo", role: "CB", pos: [8, 38], speed: 1.2, power: 1.2 },
            { num: 3, name: "Balde", role: "LB", pos: [22, 35], speed: 1.3, power: 1.0 },
            { num: 21, name: "De Jong", role: "CM", pos: [-10, 20], speed: 1.15, power: 1.1 },
            { num: 8, name: "Pedri", role: "CM", pos: [10, 18], speed: 1.15, power: 1.1 },
            { num: 20, name: "Dani Olmo", role: "CAM", pos: [0, 10], speed: 1.15, power: 1.15 },
            { num: 19, name: "Lamine Yamal", role: "RW", pos: [-24, 2], speed: 1.32, power: 1.18 },
            { num: 9, name: "Lewandowski", role: "ST", pos: [0, -5], speed: 1.08, power: 1.32 },
            { num: 11, name: "Raphinha", role: "LW", pos: [24, 2], speed: 1.26, power: 1.2 }
        ]
    },
    man_city: {
        id: "man_city",
        name: "Manchester City",
        shortName: "MCI",
        color: "#6cabdd",
        secondaryColor: "#1c2c5b",
        numColor: "#ffffff",
        shortsColor: "#ffffff",
        socksColor: "#6cabdd",
        gkColor: "#ff7700",
        rating: 93,
        players: [
            { num: 31, name: "Ederson", role: "GK", pos: [0, 50], speed: 1.05, power: 1.2 },
            { num: 2, name: "Walker", role: "RB", pos: [-22, 35], speed: 1.3, power: 1.1 },
            { num: 3, name: "Dias", role: "CB", pos: [-8, 38], speed: 1.1, power: 1.2 },
            { num: 25, name: "Akanji", role: "CB", pos: [8, 38], speed: 1.12, power: 1.15 },
            { num: 24, name: "Gvardiol", role: "LB", pos: [22, 35], speed: 1.18, power: 1.15 },
            { num: 16, name: "Rodri", role: "CDM", pos: [0, 24], speed: 1.1, power: 1.2 },
            { num: 17, name: "De Bruyne", role: "CM", pos: [-12, 12], speed: 1.12, power: 1.3 },
            { num: 20, name: "Bernardo", role: "CM", pos: [12, 14], speed: 1.15, power: 1.1 },
            { num: 47, name: "Foden", role: "RW", pos: [-24, 2], speed: 1.25, power: 1.2 },
            { num: 9, name: "Haaland", role: "ST", pos: [0, -5], speed: 1.32, power: 1.38 },
            { num: 11, name: "Doku", role: "LW", pos: [24, 2], speed: 1.36, power: 1.1 }
        ]
    },
    inter_miami: {
        id: "inter_miami",
        name: "Inter Miami",
        shortName: "MIA",
        color: "#f7b5cd",
        secondaryColor: "#231f20",
        numColor: "#231f20",
        shortsColor: "#231f20",
        socksColor: "#f7b5cd",
        gkColor: "#ffee00",
        rating: 87,
        players: [
            { num: 1, name: "Callender", role: "GK", pos: [0, 50], speed: 1.0, power: 1.0 },
            { num: 57, name: "Weigandt", role: "RB", pos: [-22, 35], speed: 1.1, power: 1.0 },
            { num: 6, name: "Avilés", role: "CB", pos: [-8, 38], speed: 1.05, power: 1.1 },
            { num: 14, name: "Martínez", role: "CB", pos: [8, 38], speed: 1.05, power: 1.05 },
            { num: 18, name: "Jordi Alba", role: "LB", pos: [22, 35], speed: 1.2, power: 1.1 },
            { num: 5, name: "Busquets", role: "CDM", pos: [0, 24], speed: 0.95, power: 1.1 },
            { num: 55, name: "Redondo", role: "CM", pos: [-10, 16], speed: 1.12, power: 1.05 },
            { num: 7, name: "Rojas", role: "CAM", pos: [10, 14], speed: 1.15, power: 1.15 },
            { num: 10, name: "Messi", role: "RW", pos: [-20, 2], speed: 1.28, power: 1.35 },
            { num: 9, name: "Suárez", role: "ST", pos: [0, -5], speed: 1.05, power: 1.3 },
            { num: 16, name: "Taylor", role: "LW", pos: [22, 2], speed: 1.15, power: 1.05 }
        ]
    },
    boca_juniors: {
        id: "boca_juniors",
        name: "Boca Juniors",
        shortName: "BOC",
        color: "#002b49",
        secondaryColor: "#ffc72c",
        numColor: "#ffc72c",
        shortsColor: "#002b49",
        socksColor: "#002b49",
        gkColor: "#32cd32",
        rating: 86,
        players: [
            { num: 1, name: "Romero", role: "GK", pos: [0, 50], speed: 1.0, power: 1.1 },
            { num: 17, name: "Advíncula", role: "RB", pos: [-22, 35], speed: 1.3, power: 1.15 },
            { num: 2, name: "Lema", role: "CB", pos: [-8, 38], speed: 1.0, power: 1.2 },
            { num: 6, name: "Rojo", role: "CB", pos: [8, 38], speed: 1.05, power: 1.2 },
            { num: 23, name: "Blanco", role: "LB", pos: [22, 35], speed: 1.18, power: 1.05 },
            { num: 36, name: "Medina", role: "RM", pos: [-20, 18], speed: 1.18, power: 1.1 },
            { num: 8, name: "Fernández", role: "CM", pos: [-6, 20], speed: 1.1, power: 1.1 },
            { num: 22, name: "Zenón", role: "LM", pos: [20, 18], speed: 1.22, power: 1.2 },
            { num: 19, name: "Martegani", role: "CAM", pos: [6, 12], speed: 1.12, power: 1.1 },
            { num: 16, name: "Merentiel", role: "ST", pos: [-8, 0], speed: 1.22, power: 1.2 },
            { num: 10, name: "Cavani", role: "ST", pos: [8, -2], speed: 1.12, power: 1.3 }
        ]
    },
    river_plate: {
        id: "river_plate",
        name: "River Plate",
        shortName: "RIV",
        color: "#ffffff",
        secondaryColor: "#eb1923",
        numColor: "#eb1923",
        shortsColor: "#000000",
        socksColor: "#ffffff",
        gkColor: "#00e5ff",
        rating: 86,
        players: [
            { num: 1, name: "Armani", role: "GK", pos: [0, 50], speed: 1.0, power: 1.1 },
            { num: 16, name: "Bustos", role: "RB", pos: [-22, 35], speed: 1.22, power: 1.05 },
            { num: 6, name: "Pezzella", role: "CB", pos: [-8, 38], speed: 1.05, power: 1.15 },
            { num: 17, name: "Díaz", role: "CB", pos: [8, 38], speed: 1.12, power: 1.15 },
            { num: 24, name: "Acuña", role: "LB", pos: [22, 35], speed: 1.2, power: 1.15 },
            { num: 5, name: "Kranevitter", role: "CDM", pos: [0, 24], speed: 1.08, power: 1.1 },
            { num: 26, name: "Fernández", role: "CM", pos: [-12, 16], speed: 1.08, power: 1.12 },
            { num: 10, name: "Lanzini", role: "CAM", pos: [0, 10], speed: 1.15, power: 1.15 },
            { num: 30, name: "Mastantuono", role: "RW", pos: [-22, 2], speed: 1.24, power: 1.2 },
            { num: 9, name: "Borja", role: "ST", pos: [0, -5], speed: 1.12, power: 1.32 },
            { num: 11, name: "Colidio", role: "LW", pos: [22, 2], speed: 1.22, power: 1.15 }
        ]
    }
};

const STADIUMS_DATA = {
    bernabeu: {
        id: "bernabeu",
        name: "Estadio Santiago Bernabéu",
        city: "Madrid, España",
        standColor: "#1d2a44",
        chairColor: "#0055b8",
        roofColor: "#c0c6ce",
        ambient: 0x8899aa,
        skyColor: 0x050c18,
        turfPattern: "stripes",
        lighting: "night",
        capacity: "84,000"
    },
    camp_nou: {
        id: "camp_nou",
        name: "Spotify Camp Nou",
        city: "Barcelona, España",
        standColor: "#331122",
        chairColor: "#990033",
        roofColor: "#222233",
        ambient: 0xaa9988,
        skyColor: 0x1a0f2b,
        turfPattern: "checkerboard",
        lighting: "sunset",
        capacity: "105,000"
    },
    wembley: {
        id: "wembley",
        name: "Wembley Stadium",
        city: "Londres, Reino Unido",
        standColor: "#2a2a2a",
        chairColor: "#cc1122",
        roofColor: "#e6e6e6",
        ambient: 0x99aabb,
        skyColor: 0x0b1326,
        turfPattern: "circular",
        lighting: "night",
        capacity: "90,000"
    },
    bombonera: {
        id: "bombonera",
        name: "Estadio Alberto J. Armando (La Bombonera)",
        city: "Buenos Aires, Argentina",
        standColor: "#0d2b45",
        chairColor: "#e6b800",
        roofColor: "#1a2536",
        ambient: 0x998877,
        skyColor: 0x081020,
        turfPattern: "stripes",
        lighting: "night",
        capacity: "57,000"
    }
};
