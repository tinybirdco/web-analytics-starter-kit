import fetch from 'node-fetch';

export const config = {
    runtime: 'experimental-edge',
};

const DATASOURCE = 'analytics_events';

/**
 * Post event to Tinybird HFI
 *
 * @param  { string } event Event object
 * @return { Promise<string> } Tinybird HFI response
 */
const _postEvent = async event => {
    const options = {
        method: 'post',
        body: event,
        headers: {
            'Authorization': `Bearer ${process.env.TINYBIRD_TOKEN}`,
            'Content-Type': 'application/json'
        }
    };
    const response = await fetch(`https://api.tinybird.co/v0/events?name=${DATASOURCE}`, options);
    if (!response.ok) {
        throw response.statusText;
    }

    return response.json();
};

export default async (req) => {
    await _postEvent(req.body);
    return new Response('ok', {
        headers: {
            'access-control-allow-credentials': true,
            'access-control-allow-origin': process.env.CORS_ALLOW_ORIGIN || '*',
            'access-control-allow-methods': 'OPTIONS,POST',
            'access-control-allow-headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
            'content-type': 'text/html'
        },
    });
};
