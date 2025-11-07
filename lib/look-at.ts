/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type Location = {
  lat: number;
  lng: number;
  alt?: number;
};

async function fetchElevation(
  lat: number,
  lng: number,
  elevator: google.maps.ElevationService
): Promise<number> {
  const locationRequest: google.maps.LocationElevationRequest = {
    locations: [{ lat, lng }],
  };

  try {
    const { results } = await elevator.getElevationForLocations(locationRequest);
    if (results && results[0]) {
      return results[0].elevation;
    }
  } catch (e) {
    console.error('Elevation service failed due to: ' + e);
  }
  return 0;
}

export async function lookAt(
  locations: Array<Location>,
  elevator: google.maps.ElevationService,
  heading = 0
) {
  // get the general altitude of the area
  const ALTITUDE = await fetchElevation(
    locations[0].lat,
    locations[0].lng,
    elevator
  );
  console.log(`lookAt altitude for ${locations[0].lat}, ${locations[0].lng}: ${ALTITUDE}`);

  const degToRad = Math.PI / 180;

  // Compute bounding box of the locations
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  locations.forEach(loc => {
    if (loc.lat < minLat) minLat = loc.lat;
    if (loc.lat > maxLat) maxLat = loc.lat;
    if (loc.lng < minLng) minLng = loc.lng;
    if (loc.lng > maxLng) maxLng = loc.lng;
  });

  // Center of the bounding box
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // If locations include an altitude property, average them; otherwise assume 0
  let sumAlt = 0;
  let countAlt = 0;

  locations.forEach(loc => {
    sumAlt += ALTITUDE + (loc.alt ?? 0); // las vegas altitude as default
    countAlt++;
  });
  const lookAtAltitude = countAlt > 0 ? sumAlt / countAlt : 0;

  // Haversine function: returns angular distance in radians
  function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const dLat = (lat2 - lat1) * degToRad;
    const dLng = (lng2 - lng1) * degToRad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * degToRad) *
        Math.cos(lat2 * degToRad) *
        Math.sin(dLng / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Find the maximum angular distance (in radians) from the center to any location
  let maxAngularDistance = 0;
  locations.forEach(loc => {

    const d = haversine(centerLat, centerLng, loc.lat, loc.lng);
    if (d > maxAngularDistance) maxAngularDistance = d;
  });

  // Convert the angular distance to a linear ground distance (in meters)
  const earthRadius = 6371000; // meters
  const maxDistance = maxAngularDistance * earthRadius;

  // Define the needed horizontal distance as a margin (twice the max ground distance)
  const horizontalDistance = maxDistance * 2;

  const targetTiltDeg = 60;
  const verticalDistance =
    horizontalDistance / Math.tan(targetTiltDeg * degToRad);

  // Compute the slant range (straight-line distance from camera to look-at point)
  const slantRange = Math.sqrt(horizontalDistance ** 2 + verticalDistance ** 2);

  // Return the computed camera view, including the orbit/heading angle
  return {
    lat: centerLat,
    lng: centerLng,
    altitude: lookAtAltitude,
    range: slantRange,
    tilt: targetTiltDeg,
    heading
  };
}

/**
 * Calculates the optimal camera position to view a set of geographic locations,
 * taking into account padding for UI elements.
 *
 * @param locations An array of locations to be framed.
 * @param elevator The Google Maps ElevationService instance.
 * @param heading The camera heading in degrees.
 * @param padding An array of four numbers representing the padding from the
 *   edges of the viewport as fractions of the viewport dimensions
 *   in the format [top, right, bottom, left]. Defaults to no padding.
 * @returns An object with camera parameters (lat, lng, altitude, range, tilt, heading).
 */
export async function lookAtWithPadding(
  locations: Array<Location>,
  elevator: google.maps.ElevationService,
  heading = 0,
  padding: [number, number, number, number] = [0, 0, 0, 0]
) {
  // get the general altitude of the area
  const ALTITUDE = await fetchElevation(
    locations[0].lat,
    locations[0].lng,
    elevator
  );

  const degToRad = Math.PI / 180;
  const earthRadius = 6371000; // meters

  // Compute bounding box of the locations
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  locations.forEach(loc => {
    if (loc.lat < minLat) minLat = loc.lat;
    if (loc.lat > maxLat) maxLat = loc.lat;
    if (loc.lng < minLng) minLng = loc.lng;
    if (loc.lng > maxLng) maxLng = loc.lng;
  });

  // Center of the content's bounding box
  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  // If locations include an altitude property, average them
  let sumAlt = 0;
  let countAlt = 0;
  locations.forEach(loc => {
    sumAlt += ALTITUDE + (loc.alt ?? 0);
    countAlt++;
  });
  const lookAtAltitude = countAlt > 0 ? sumAlt / countAlt : 0;

  // Haversine function: returns angular distance in radians
  function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
    const dLat = (lat2 - lat1) * degToRad;
    const dLng = (lng2 - lng1) * degToRad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * degToRad) *
        Math.cos(lat2 * degToRad) *
        Math.sin(dLng / 2) ** 2;
    return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Find the maximum angular distance from the center to any location
  let maxAngularDistance = 0;
  locations.forEach(loc => {
    const d = haversine(centerLat, centerLng, loc.lat, loc.lng);
    if (d > maxAngularDistance) maxAngularDistance = d;
  });

  // --- Padding calculations start here ---

  const [padTop, padRight, padBottom, padLeft] = padding;

  // Calculate the fraction of the viewport that is visible
  const visibleWidthFraction = 1 - padLeft - padRight;
  const visibleHeightFraction = 1 - padTop - padBottom;

  // Determine the zoom-out scale factor
  const scale = Math.max(
    1 / visibleWidthFraction,
    1 / visibleHeightFraction
  );

  // Convert angular distance to a ground distance (meters) for the content
  const maxDistance = maxAngularDistance * earthRadius;
  const contentHorizontalDistance = maxDistance * 2;

  // Scale this distance to get the required ground distance for the full viewport
  const fullHorizontalDistance = contentHorizontalDistance * scale;

  // Calculate the normalized screen offset for the center point
  // A positive x is right, a positive y is down.
  const offsetX = (padLeft - padRight) / 2;
  const offsetY = (padTop - padBottom) / 2;

  // Convert screen offset to a ground offset in meters
  const offsetGeoScreenX = offsetX * fullHorizontalDistance;
  const offsetGeoScreenY = offsetY * fullHorizontalDistance;

  // To move content right (positive offsetX), camera moves left (negative east)
  // To move content down (positive offsetY), camera moves up (positive north)
  const shiftVectorScreenMeters = {
    x: -offsetGeoScreenX,
    y: offsetGeoScreenY
  };

  // Rotate the shift vector to align with map coordinates (North-East)
  const headingRad = heading * degToRad;
  const cosH = Math.cos(headingRad);
  const sinH = Math.sin(headingRad);

  const shiftEastMeters =
    shiftVectorScreenMeters.x * cosH - shiftVectorScreenMeters.y * sinH;
  const shiftNorthMeters =
    shiftVectorScreenMeters.x * sinH + shiftVectorScreenMeters.y * cosH;

  // Convert meter shifts to latitude/longitude degrees
  const shiftLatDeg = shiftNorthMeters / 111000;
  const shiftLngDeg =
    shiftEastMeters / (111000 * Math.cos(centerLat * degToRad));

  // Calculate the new padded center for the camera
  const newCenterLat = centerLat + shiftLatDeg;
  const newCenterLng = centerLng + shiftLngDeg;

  // --- Final camera parameter calculation ---

  const targetTiltDeg = 60;
  const verticalDistance =
    fullHorizontalDistance / Math.tan(targetTiltDeg * degToRad);

  // Compute the slant range for the scaled and padded view
  const slantRange = Math.sqrt(
    fullHorizontalDistance ** 2 + verticalDistance ** 2
  );

  return {
    lat: newCenterLat,
    lng: newCenterLng,
    altitude: lookAtAltitude,
    range: slantRange,
    tilt: targetTiltDeg,
    heading
  };
}