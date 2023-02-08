<script lang="ts">
  import { createEventDispatcher, onMount} from 'svelte';
  import * as jose from 'jose';
  import * as pako from 'pako';
  import issuerKeys from './issuer.private.jwks.json';
  import type { SHCRetrieveEvent } from './types';
    import { EXAMPLE_IPS } from './config';

  const dispatch = createEventDispatcher<{ 'shc-retrieved': SHCRetrieveEvent }>();
  let submitting = false;
  let summaryUrl = EXAMPLE_IPS;
  let inputUrl: HTMLInputElement;

  onMount(() => {
    inputUrl.select()
  })

  let summaryUrlValidated: URL | undefined = undefined;
  $: {
    try {
      summaryUrlValidated = new URL(summaryUrl);
    } catch {}
  }

  async function fetchIps(url?: URL) {
    submitting = true;
    try {
      const contentResponse = await fetch(url!, { headers: { accept: 'application/fhir+json' } });
      const content: any = await contentResponse.json();
      let shc = await signJws(content);
      let patient = JSON.stringify(
        content?.entry
          ?.map((e: any) => e.resource)
          ?.filter((r: any) => r.resourceType == 'Patient')?.[0]?.name?.[0] || 'unknown'
      );

      const ret = {
        shc: {
          verifiableCredential: [shc]
        },
        patient,
        content
      };

      dispatch('shc-retrieved', ret);
    } catch (e) {
      console.log('Failed', e);
      submitting = false;
    }
  }

  const exampleSigningKey = jose.importJWK(issuerKeys.keys[0]);
  async function signJws(payload: unknown) {
    const fields = { zip: 'DEF', alg: 'ES256', kid: issuerKeys.keys[0].kid };
    const body = pako.deflateRaw(
      JSON.stringify({
        iss: 'https://spec.smarthealth.cards/examples/issuer',
        nbf: new Date().getTime() / 1000,
        vc: {
          type: ['https://smarthealth.cards#health-card'],
          credentialSubject: {
            fhirVersion: '4.0.1',
            fhirBundle: payload
          }
        }
      })
    );
    const signed = new jose.CompactSign(body)
      .setProtectedHeader(fields)
      .sign(await exampleSigningKey);
    return signed;
  }
</script>

<form on:submit|preventDefault={() => fetchIps(summaryUrlValidated)}>
  <input type="text" bind:value={summaryUrl} bind:this={inputUrl} />
  <button disabled={!summaryUrlValidated || submitting} type="submit">
    {#if !submitting}
      Fetch IPS
    {:else}
      Fetching...
    {/if}
  </button>
</form>

<style>
  input {
    width: 100%;
  }
</style>
