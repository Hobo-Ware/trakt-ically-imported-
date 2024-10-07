import { Config } from '@dvcol/trakt-http-client/config';
import { PersistentStore } from '../store';
import type { TraktClientSettings } from '@dvcol/trakt-http-client/models';
import { TraktClient } from '@dvcol/trakt-http-client';
import { traktApi } from '@dvcol/trakt-http-client/api';
import { name } from '../../package.json';
import { TRAKT_CLIENT_ID } from '../env/TRAKT_CLIENT_ID';
import { TRAKT_CLIENT_SECRET } from '../env/TRAKT_CLIENT_SECRET';

const db = await PersistentStore.create(PersistentStore.namespacedPath(TRAKT_CLIENT_ID));

enum TraktValue {
    Token = 'trakt_token',
}

async function getToken() {
    if (await db.has(TraktValue.Token)) {
        console.log('Trakt client has already been authorized. Continuing...');
        return await db.get(TraktValue.Token);
    }

    return null;
}

async function requestToken(trakt: TraktClient) {
    console.log('Trakt client has not been authorized. Requesting token...');
    const authentication = await trakt
        .authentication
        .device
        .code({ client_id: settings.client_id });

    const authenticationInfo = await authentication.json();

    console.log(`--- Visit: ${authenticationInfo.verification_url}`);
    console.log(`--- Enter code: ${authenticationInfo.user_code}`);

    const token = await trakt.pollWithDeviceCode(authenticationInfo);
    await db.set(TraktValue.Token, token);
    console.log(token);
}

const settings: TraktClientSettings = {
    client_id: TRAKT_CLIENT_ID,
    client_secret: TRAKT_CLIENT_SECRET,
    redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    useragent: name,
    endpoint: Config.Endpoint.Production,
};

const token = await getToken();
const client = new TraktClient(settings, token ?? {}, traktApi);

if (token == null) {
    await requestToken(client);
}

const throttle = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const rateLimit = () => throttle(1000);

export { client, rateLimit, };