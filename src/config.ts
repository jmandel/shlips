import { browser, dev} from '$app/environment';

export const API_BASE = 'https://api.vaxx.link/api';
export const VIEWER_BASE = (browser && !dev) ? new URL("ips#", window.location.href).toString(): 'http://localhost:5173/ips/index.html#' ;
export const EXAMPLE_IPS = 'https://ips.health/fhir/Patient/98549f1a-e0d5-4454-849c-f5b97d3ed299/$summary'