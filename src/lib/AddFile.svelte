<script lang="ts">
  import * as jose from 'jose';
  import * as pako from 'pako';
  import { createEventDispatcher, onMount } from 'svelte';
  import { Button, FormGroup, Input, Label } from 'sveltestrap';

  import { EXAMPLE_IPS } from './config';
  import issuerKeys from './issuer.private.jwks.json';
  import type { SHCRetrieveEvent } from './types';

  const dispatch = createEventDispatcher<{ 'shc-retrieved': SHCRetrieveEvent }>();
  let submitting = false;
  let summaryUrl = EXAMPLE_IPS;
  let inputUrl: HTMLFormElement;
  let label = 'SHL from ' + new Date().toISOString().slice(0, 10);

  let summaryUrlValidated: URL | undefined = undefined;
  $: {
    try {
      summaryUrlValidated = new URL(summaryUrl);
    } catch {
      summaryUrlValidated = undefined;
    }
  }

  async function fetchIps(url?: URL) {
    submitting = true;
    try {
      const contentResponse = await fetch(url!, { headers: { accept: 'application/fhir+json' } });
      const content: any = await contentResponse.json();
      if (content.verifiableCredential) {
        return dispatch('shc-retrieved', {
          shc: content,
          content
        });
      }

      const shc = await signJws(content);

      dispatch('shc-retrieved', {
        shc: {
          verifiableCredential: [shc]
        },
        content,
        label
      });
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

<form bind:this={inputUrl} on:submit|preventDefault={() => fetchIps(summaryUrlValidated)}>
  <FormGroup>
    <Label>Bundle <code>.json</code>, or signed <code>.smart-health-card</code></Label>
    <Input width="100%" type="text" bind:value={summaryUrl} />
  </FormGroup>
  <FormGroup>
    <Label>Label</Label>
    <Input width="100%" type="text" bind:value={label} />
  </FormGroup>
  <Button color="primary" disabled={!summaryUrlValidated || submitting} type="submit">
    {#if !submitting}
      Fetch IPS
    {:else}
      Fetching...
    {/if}
  </Button>
</form>

<style>
</style>
