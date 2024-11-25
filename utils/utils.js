export function validateCoordinates(lat, long) {
  if (!lat || !long) {
    return false;
  }

  if (isNaN(parseFloat(lat)) || isNaN(parseFloat(long))) {
    return false;
  }

  // Check lat and long ranges is correct
  if (lat < -90 || lat > 90 || long < -180 || long > 180) {
    return false;
  }

  return true;
}
