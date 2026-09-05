/**
 * Static mapping from event location strings to lat/lng coordinates.
 * Used for the Map View on the top page.
 */
export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Map from event id to approximate geographic coordinates.
 * Coordinates represent the center of the primary location for each event.
 */
export const eventCoords: Record<string, LatLng> = {
  'comfort-women': { lat: 37.5, lng: 127.0 },           // Korean Peninsula
  'covid-origin': { lat: 30.6, lng: 114.3 },             // Wuhan, China
  'cultural-revolution': { lat: 35.86, lng: 104.19 },    // China
  'forced-labor': { lat: 36.0, lng: 128.0 },             // Japan/Korea
  'fukushima-treated-water': { lat: 37.42, lng: 141.03 }, // Fukushima, Japan
  'goguryeo-controversy': { lat: 40.0, lng: 127.0 },     // Northern Korean Peninsula / NE China
  'high-speed-rail-controversy': { lat: 23.7, lng: 121.0 }, // Taiwan/China
  'hundred-flowers-anti-rightist': { lat: 39.91, lng: 116.39 }, // Beijing
  'israel-territory': { lat: 31.5, lng: 34.8 },          // Middle East / Palestine
  'kanto-massacre': { lat: 35.68, lng: 139.69 },         // Tokyo (Kanto region)
  'kimchi-origin-controversy': { lat: 36.5, lng: 127.5 }, // Korea
  'korea-colonization': { lat: 37.56, lng: 126.97 },     // Korean Peninsula
  'manchurian-incident': { lat: 41.8, lng: 123.4 },      // Shenyang (Mukden), NE China
  'marco-polo-bridge': { lat: 39.86, lng: 116.22 },      // Marco Polo Bridge, Beijing
  'nanjing-death-toll': { lat: 32.06, lng: 118.77 },     // Nanjing, China
  'nanjing-massacre': { lat: 32.06, lng: 118.77 },       // Nanjing, China
  'nanjing-tribunal': { lat: 32.06, lng: 118.77 },       // Nanjing, China
  'northern-territories': { lat: 44.5, lng: 146.0 },     // Kuril Islands / Northern Territories
  'pacific-war-end': { lat: 35.68, lng: 139.69 },        // Japan (mainland)
  'russia-china-territory': { lat: 50.0, lng: 130.0 },   // Amur River Basin
  'sea-of-japan-naming': { lat: 40.0, lng: 135.0 },      // Sea of Japan
  'senkaku': { lat: 25.75, lng: 123.47 },                // Senkaku/Diaoyu Islands
  'siberian-internment': { lat: 60.0, lng: 105.0 },      // Siberia
  'sino-japanese-war': { lat: 32.0, lng: 118.0 },        // China (general)
  'spratly-islands': { lat: 9.5, lng: 113.5 },           // Spratly Islands, South China Sea
  'takeshima': { lat: 37.24, lng: 131.86 },              // Takeshima/Dokdo
  'textbook-controversy': { lat: 35.68, lng: 139.69 },   // Japan
  'tiananmen-1989': { lat: 39.91, lng: 116.39 },         // Beijing Tiananmen
  'ukraine-invasion': { lat: 49.0, lng: 32.0 },          // Ukraine
  'unit731': { lat: 45.75, lng: 126.6 },                 // Harbin, NE China
  'volhynia-massacre': { lat: 50.74, lng: 25.32 },       // Volhynia, Western Ukraine
  'ww2-asia': { lat: 35.0, lng: 115.0 },                 // Mainland China (general)
  'iberian-enclaves': { lat: 35.95, lng: -5.35 },        // Strait of Gibraltar area
  'taiwan-un-resolution': { lat: 23.5, lng: 121.0 },     // Taiwan
  'western-sahara': { lat: 24.0, lng: -13.0 },           // Western Sahara
  'afghanistan-conflict': { lat: 34.53, lng: 69.17 },    // Afghanistan (Kabul)
  'bolivia-chile-pacific': { lat: -23.65, lng: -70.4 },  // Antofagasta / Atacama Corridor
  'cyprus-dispute': { lat: 35.17, lng: 33.36 },          // Cyprus (Nicosia)
  'drc-eastern-conflict': { lat: -1.68, lng: 29.22 },    // Eastern DRC (Goma / North Kivu)
  'falklands-war': { lat: -51.7, lng: -57.85 },          // Falkland / Malvinas Islands
  'georgia-russia-conflict': { lat: 42.23, lng: 43.97 }, // South Ossetia / Tskhinvali
  'gerd-nile-dispute': { lat: 11.21, lng: 35.09 },       // Blue Nile GERD, Ethiopia
  'guayana-esequiba': { lat: 6.5, lng: -59.5 },          // Guayana Esequiba
  'gulf-war-iraq-war': { lat: 33.31, lng: 44.36 },       // Baghdad, Iraq / Kuwait
  'iran-iraq-war': { lat: 30.5, lng: 47.82 },            // Iran-Iraq border / Shatt al-Arab
  'kashmir-conflict': { lat: 34.08, lng: 74.8 },         // Kashmir (Srinagar)
  'korean-war-division': { lat: 37.96, lng: 126.67 },    // Panmunjom / Korean DMZ
  'kosovo-dispute': { lat: 42.66, lng: 21.17 },          // Kosovo (Pristina)
  'kurdish-question': { lat: 36.19, lng: 44.01 },        // Kurdistan region (Erbil)
  'kyrgyzstan-tajikistan-border': { lat: 40.06, lng: 70.82 }, // Fergana Valley (Batken)
  'lebanon-israel-conflict': { lat: 33.15, lng: 35.3 },  // Southern Lebanon
  'libya-civil-war': { lat: 32.89, lng: 13.19 },         // Tripoli, Libya
  'middle-east-us-iran-israel': { lat: 35.69, lng: 51.39 }, // Tehran / Middle East
  'myanmar-civil-war': { lat: 19.76, lng: 96.08 },       // Myanmar (Naypyidaw)
  'nagorno-karabakh': { lat: 39.82, lng: 46.75 },        // Nagorno-Karabakh (Stepanakert)
  'papua-conflict': { lat: -2.53, lng: 140.72 },         // West Papua (Jayapura)
  'preah-vihear-dispute': { lat: 14.39, lng: 104.68 },   // Preah Vihear Temple
  'sahel-conflict': { lat: 14.9, lng: 0.15 },            // Sahel tri-border area
  'sino-indian-border': { lat: 34.5, lng: 78.5 },        // Ladakh / Aksai Chin
  'somaliland-dispute': { lat: 9.56, lng: 44.06 },       // Somaliland (Hargeisa)
  'sudan-civil-war': { lat: 15.5, lng: 32.53 },          // Khartoum, Sudan
  'syria-civil-war': { lat: 33.51, lng: 36.28 },         // Damascus, Syria
  'tigray-war': { lat: 13.5, lng: 39.47 },               // Tigray, Ethiopia (Mekelle)
  'transnistria-conflict': { lat: 46.85, lng: 29.63 },   // Transnistria (Tiraspol)
  'yemen-conflict': { lat: 15.37, lng: 44.19 },          // Sana'a, Yemen
};
