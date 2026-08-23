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
};
