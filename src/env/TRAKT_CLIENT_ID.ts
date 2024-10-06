import { assertDefined } from '../utils/assertDefined';

const TRAKT_CLIENT_ID = assertDefined(process.env.TRAKT_CLIENT_ID, 'Please provide TRAKT_CLIENT_ID environment variable.');

export { TRAKT_CLIENT_ID };