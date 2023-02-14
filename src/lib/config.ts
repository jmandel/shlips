// import {PUBLIC_BASE_URL} from '$env/static/public';
import { dev } from '$app/environment';

export const API_BASE = 'https://api.vaxx.link/api';
export const VIEWER_BASE = new URL(
  `/ips${dev ? '/index.html' : ''}#`,
  window.location.href
).toString();
export const EXAMPLE_IPS =
  'https://ips.health/fhir/Patient/98549f1a-e0d5-4454-849c-f5b97d3ed299/$summary';
