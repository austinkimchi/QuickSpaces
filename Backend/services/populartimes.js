const { spawn } = require('child_process');
const script_target = process.cwd() + '/python/main.py';

if (require.main === module) {
    require('dotenv').config();
}


async function getPopularTimes(place_id, retry_count = 0) {
    const pythonProcess = spawn('python3', [script_target, process.env.GOOGLE_MAP_API_KEY, place_id]);
    let toReturn = {};

    pythonProcess.stdout.on('data', (data) => {
        let data_str = data.toString().replaceAll("'", '"');
        const parsed = JSON.parse(data_str);

        // strip away unnecessary data
        // remove address, name, international_phone_number
        const { address, name, international_phone_number, ...cleaned } = parsed;

        toReturn = cleaned;
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
        if (retry_count < 3) {
            console.debug(`Retrying... (${retry_count + 1})`);
            getPopularTimes(place_id, retry_count + 1);
        } else {
            console.error('Max retries reached. Exiting.');
        }
    });

    pythonProcess.on('close', (code) => {
        console.debug(`Python script exited with code ${code}`);
    });

    return new Promise((resolve) => {
        pythonProcess.on('exit', () => {
            resolve(toReturn);
        });
    });
}

module.exports = { getPopularTimes };


// test the functions
if (require.main === module) {
    const test_place_ids = [
        'ChIJVVVVUB7Lj4ARXyb4HFVDV8s',
        'ChIJGZd-yUXKj4AR0p8wW6L5-kk',
        'ChIJHaiwRV7Jj4ARc7HM4VT7rMM',
        'ChIJ6R9a43XJj4ARkONslhsnIfI',
        'ChIJe1p2smbKj4ARijhCsNwsOmo',
        'ChIJMxLL0FLKj4AR49YtqM31C4I',
        'ChIJ32xJ3urLj4ARdpzVWI34tNg',
        'ChIJmWJ3oPLJj4ARoEkoEkc4JO0',
        'ChIJKbQHeyDLj4ARDY5fLdwueaM',
        'ChIJwaEuNve1j4ARQ0Ky3qnu8Ys',
        'ChIJU-hFF-HKj4AR8g00kR5cEXA',
        'ChIJPe92phvJj4ARTWIWyW8yrGQ',
        'ChIJASO65Z21j4ARKODIVSbFa-8',
        'ChIJzZsDNGvKj4AR5DwuHL-zANI',
        'ChIJZfltZkbKj4ARSm1_Gthmv-U',
        'ChIJy4yvxoq1j4ARYdUyfPNgaKI',
        'ChIJCXR_2EDKj4ARNlwHAf1uerE',
        'ChIJ2To-7qfNj4ARA0p104YBcgM',
        'ChIJM8RhCoi1j4AR_qlUJKMSUlU',
        'ChIJeS20TYi1j4ARXid1xkUDOcE'
    ]

    getPopularTimes(test_place_ids[0])
        .then(data => console.log(data))
        
    // for (const place_id of test_query) 
    //     getPopularTimes(place_id);

}