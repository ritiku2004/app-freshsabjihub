function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculates straight-line distance using Haversine formula
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

/**
 * Calculates delivery ETA considering road layout using OSRM, 
 * with a fallback to straight-line estimation.
 * 
 * @param {number|string} userLat 
 * @param {number|string} userLon 
 * @param {number|string} shopLat 
 * @param {number|string} shopLon 
 * @returns {Promise<number>} ETA in minutes
 */
export async function calculateDeliveryETA(userLat, userLon, shopLat, shopLon) {
  const uLat = parseFloat(userLat);
  const uLon = parseFloat(userLon);
  const sLat = parseFloat(shopLat);
  const sLon = parseFloat(shopLon);

  if (isNaN(uLat) || isNaN(uLon) || isNaN(sLat) || isNaN(sLon)) {
    throw new Error('Invalid coordinates provided');
  }

  let travelTimeMins = 0;

  try {
    // OSRM expects coordinates in Longitude,Latitude order
    const url = `http://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${uLon},${uLat}?overview=false`;
    
    // Use timeout to quickly fallback if OSRM is slow
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    const data = await response.json();

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Duration is in seconds
      const durationSeconds = data.routes[0].duration;
      travelTimeMins = durationSeconds / 60;
      
      // Apply a factor for traffic / delays (e.g., +30%)
      travelTimeMins = travelTimeMins * 1.3;
    } else {
      throw new Error('OSRM returned invalid route');
    }
  } catch (error) {
    console.log('Falling back to Haversine distance estimation:', error.message);
    // Fallback to straight-line distance if OSRM fails
    const distanceKm = getDistanceFromLatLonInKm(sLat, sLon, uLat, uLon);
    
    // Add 40% for circular paths/road structure
    const roadDistanceKm = distanceKm * 1.4;
    
    // Assume average city speed is 20 km/h (which is 1 km every 3 mins)
    travelTimeMins = roadDistanceKm * 3;
  }

  // Add base preparation/dispatch time (increased by 5 mins to account for dispatch delays)
  const totalEtaMins = Math.round(travelTimeMins + 10);
  
  // Cap it reasonably (Minimum 15 mins)
  return Math.max(15, totalEtaMins);
}
