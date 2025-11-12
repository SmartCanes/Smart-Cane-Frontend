// Ilagay ang API key na nakuha ninyo mula sa Step 1
const API_KEY = '50227b9e-fd7e-4a19-a6f5-d2165db7e6d3';

/**
 * Kinukuha ang ruta mula sa GraphHopper API.
 * @param {Array<number>} startCoords - [latitude, longitude] ng simula
 * @param {Array<number>} endCoords - [latitude, longitude] ng dulo
 * @returns {Promise<Array<Array<number>>>} - Isang array ng [lat, lng] coordinates para sa ruta
 */
export const fetchRoute = async (startCoords, endCoords) => {
  
  // Format ng coordinates na kailangan ng GraphHopper: "lat,lng"
  const startPoint = `${startCoords[0]},${startCoords[1]}`;
  const endPoint = `${endCoords[0]},${endCoords[1]}`;

  // Ito ang URL ng GraphHopper API
  const url = new URL('https://graphhopper.com/api/1/route');
  
  // Mga parameters para sa API call
  url.searchParams.append('point', startPoint);
  url.searchParams.append('point', endPoint);
  url.searchParams.append('vehicle', 'foot'); // Mahalaga: 'foot' para sa pedestrian/naglalakad
  url.searchParams.append('profile', 'foot'); // Profile para sa walking
  url.searchParams.append('points_encoded', 'false'); // Para ibalik niya ay readable coordinates
  url.searchParams.append('key', API_KEY); // Ang inyong API key

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Kung may error sa API (e.g., maling API key, o walang ruta)
      const errorData = await response.json();
      throw new Error(`GraphHopper Error: ${errorData.message}`);
    }

    const data = await response.json();
    
    // Hanapin ang pinakamagandang ruta (usually ang una sa listahan)
    const route = data.paths[0];
    if (!route) {
      throw new Error('Walang rutang nahanap.');
    }

    // Ang coordinates na ibinabalik ng GraphHopper ay [longitude, latitude]
    // Kailangan natin itong ibalik sa [latitude, longitude] para sa Leaflet
    const leafletCoords = route.points.coordinates.map(coord => {
      // Binaliktad: mula [lng, lat] ay ginawang [lat, lng]
      return [coord[1], coord[0]]; 
    });

    return leafletCoords;

  } catch (error) {
    console.error('Error sa pagkuha ng ruta:', error);
    return null; // Ibalik ay null kung nagka-error
  }
};