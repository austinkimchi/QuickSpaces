const axios = require('axios');

if (require.main === module) {
    require('dotenv').config();
}

async function getLoopnetData(latitude, longitude, radius = 5, page = 1) {
    if (require.main === module) {
        console.log('RAPID_API_KEY:', process.env.RAPID_API_KEY ? 'Exists' : 'Missing');
        console.log('Latitude:', latitude, 'Longitude:', longitude);
    }

    const options = {
        method: 'POST',
        url: 'https://loopnet-api.p.rapidapi.com/loopnet/lease/searchByCoordination',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'loopnet-api.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        },
        data: {
            coordination: [longitude, latitude],
            radius: radius,
            page: page
        }
    };

    try {
        const response = await axios.request(options);
        if (response.status !== 200) {
            return [];
        }
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching LoopNet data:', error);
        throw error;
    }
}

async function getDetailedListings(listingIds) {
    const options = {
        method: 'POST',
        url: 'https://loopnet-api.p.rapidapi.com/loopnet/property/bulkDetails',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': 'loopnet-api.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        },
        data: {
            listingIds: listingIds
        }
    };

    try {
        const response = await axios.request(options);
        if (response.status !== 200) {
            return [];
        }
        return response.data?.data || [];
    } catch (error) {
        console.error('Error fetching detailed LoopNet listings:', error);
        throw error;
    }
}




module.exports = { getLoopnetData, getDetailedListings };

// test the function
if (require.main === module) {
    let coords = [
        { lat: 37.3247587, lng: -121.9463098 },
        { lat: 37.35047540000001, lng: -121.9611597 },
        { lat: 37.3820522, lng: -121.9763044 },
        { lat: 37.3386372, lng: -121.9750045 },
        { lat: 37.39484040000001, lng: -121.9467281 },
        { lat: 37.3485898, lng: -121.9479177 },
        { lat: 37.32459110000001, lng: -121.9445173 },
        { lat: 37.3821365, lng: -121.9749523 },
        { lat: 37.3204835, lng: -121.947858 },
        { lat: 37.3532944, lng: -121.9981382 },
        { lat: 37.323784, lng: -121.951288 },
        { lat: 37.3518052, lng: -121.9746374 },
        { lat: 37.3527889, lng: -121.9654763 },
        { lat: 37.2899274, lng: -121.9928945 },
        { lat: 37.3371855, lng: -121.9940914 },
        { lat: 37.3386237, lng: -121.9950731 },
        { lat: 37.2923806, lng: -121.9887833 },
        { lat: 37.32406, lng: -122.010508 },
        { lat: 37.3883696, lng: -121.960071 },
        { lat: 37.3396859, lng: -121.9071247 }
    ]


    // getLoopnetData(coords[0].lat, coords[0].lng)
    //     .then(data => {
    //         console.log(data);
    //     }).catch(console.error);

    let listingIds = ["26031368", "32696094", "4435860"];
    getDetailedListings(listingIds)
        .then(data => {
            console.log(data);
        }).catch(console.error);
}