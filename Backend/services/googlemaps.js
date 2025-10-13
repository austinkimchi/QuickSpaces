const maps = require('@google/maps');

if (require.main === module) {
    require('dotenv').config();
}

const googleMapsClient = maps.createClient({
    key: process.env.GOOGLE_MAP_API_KEY,
    Promise: Promise
});

// get place_id function based on zipcode
async function getPlaceId(zipcode) {
    try {
        const response = await googleMapsClient.geocode({ address: zipcode }).asPromise();
        if (response.json.results.length > 0) {
            return response.json.results[0].place_id;
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching place_id:', error);
        throw error;
    }
}

// fetch an array of landmarks based on zipcode
async function getLandmarks(zipcode, max = 10) {
    try {
        const response = await googleMapsClient.places({
            query: 'shopping in ' + zipcode,
            type: 'retail'
        }).asPromise();

        if (max && response.json.results.length > max) {
            return response.json.results.slice(0, max);
        }

        return response.json.results;
    } catch (error) {
        console.error('Error fetching landmarks:', error);
        throw error;
    }
}

// https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452&key=
async function getNearestPostalCodes(lat, lng, max = 4) {
    try {
        const response = await googleMapsClient.reverseGeocode({ latlng: [lat, lng] }).asPromise();
        if (response.json.results.length > 0) {
            // filter results to only postal_code types
            const postalCodes = response.json.results.filter(result => result.types.includes('postal_code'));
            let temp = postalCodes.map(pc => pc.address_components.find(ac => ac.types.includes('postal_code')).long_name);
            // remove duplicates
            temp = [...new Set(temp)];
            if (max && temp.length > max) {
                return temp.slice(0, max);
            }
            return temp;
        } else {
            throw new Error('No results found');
        }
    } catch (error) {
        console.error('Error fetching nearest postal codes:', error);
        throw error;
    }
}

module.exports = { getPlaceId, getLandmarks, getNearestPostalCodes };

// test the functions
if (require.main === module) {
    require('dotenv').config();

    getPlaceId('95050').then(place_id => {
        console.log('Place ID for 95050:', place_id);
    }).catch(console.error);

    getLandmarks('95050').then(landmarks => {
        //parse only names
        const landmark_place_ids = landmarks.map(landmark => landmark.place_id);
        console.log('Landmarks in 95050:', landmark_place_ids);

        const landmark_coords = landmarks.map(landmark => landmark.geometry.location);
        console.log('Landmark Coordinates in 95050:', landmark_coords);
    }).catch(console.error);
}
