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
  let uploadFiles: FileList | undefined;

  let inputUrl: HTMLFormElement;
  let label = 'SHL from ' + new Date().toISOString().slice(0, 10);

  let expiration: number | null;

  let summaryUrlValidated: URL | undefined = undefined;
  $: {
    try {
      summaryUrlValidated = new URL(summaryUrl);
    } catch {
      summaryUrlValidated = undefined;
    }
  }

  async function fetchIps() {
    submitting = true;
    try {
      let content;

      if (uploadFiles?.[0] instanceof File) {
        content = JSON.parse(new TextDecoder().decode(await uploadFiles[0].arrayBuffer()));
      } else {
        const contentResponse = await fetch(summaryUrlValidated!, {
          headers: { accept: 'application/fhir+json' }
        });
        content = await contentResponse.json();
      }

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
        label,
        exp: expiration ? new Date().getTime() / 1000 + expiration : undefined
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

<form bind:this={inputUrl} on:submit|preventDefault={() => fetchIps()}>
  <FormGroup>
    <Label>Upload Bundle <code>.json</code>, or signed <code>.smart-health-card</code></Label>
    <Input width="100%" type="file" name="file" bind:files={uploadFiles} />
  </FormGroup>
  <FormGroup>
    <Label>Or fetch from URL</Label>
    <Input width="100%" type="text" bind:value={summaryUrl} />
  </FormGroup>
  <FormGroup>
    <Label>Label</Label>
    <Input width="100%" type="text" bind:value={label} />
  </FormGroup>
  <FormGroup>
    <Label>Expires</Label>
    <Input type="radio" bind:group={expiration} value={60 * 5} label="5 minutes" />
    <Input type="radio" bind:group={expiration} value={60 * 60} label="1 hour" />
    <Input type="radio" bind:group={expiration} value={60 * 60 * 24 * 7} label="1 year" />
    <Input type="radio" bind:group={expiration} value={null} label="Never" />
  </FormGroup>

  <Button color="primary" disabled={!summaryUrlValidated || submitting} type="submit">
    {#if !submitting}
      Create SHLink
    {:else}
      Fetching...
    {/if}
  </Button>
</form>

<style>
</style>
