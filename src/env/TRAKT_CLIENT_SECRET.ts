import { assertDefined } from '../utils/assertDefined';

const TRAKT_CLIENT_SECRET = assertDefined(process.env.TRAKT_CLIENT_SECRET, 'Please provide TRAKT_CLIENT_SECRET environment variable.');

export { TRAKT_CLIENT_SECRET };