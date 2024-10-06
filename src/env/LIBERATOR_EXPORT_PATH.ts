import { assertDefined } from '../utils/assertDefined';

const LIBERATOR_EXPORT_PATH = assertDefined(process.env.LIBERATOR_EXPORT_PATH, 'Please provide LIBERATOR_EXPORT_PATH environment variable.');

export { LIBERATOR_EXPORT_PATH };