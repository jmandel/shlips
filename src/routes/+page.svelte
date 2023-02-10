<script lang="ts">
  import { browser } from '$app/environment';
  import { setContext } from 'svelte';
  import AddFile from '../AddFile.svelte';
  import HealthLink from '../HealthLink.svelte';
  import type { SHLAdminParams } from '../managementClient';
  import { SHLClient } from '../managementClient';
  import type { SHCRetrieveEvent } from '../types';

  let shlClient = new SHLClient();
  setContext('shlClient', shlClient);

  let summaryUrl = '';

  const LOCAL_STORAGE_KEY = 'shlips_store';
  let loading = true;
  let shl: SHLAdminParams | undefined =
    browser && window.localStorage[LOCAL_STORAGE_KEY]
      ? JSON.parse(window.localStorage[LOCAL_STORAGE_KEY])
      : undefined;

  $: {
    if (browser) window.localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(shl);
  }

  async function newShlFromShc(details: SHCRetrieveEvent) {
    console.log('Creating at', summaryUrl);
    const shlCreated = await shlClient.createShl();
    shlClient.addFile(shlCreated, details.shc, 'application/smart-health-card');
    return shlCreated;
  }
</script>

<div>
  <h1>SMART Health Links for International Patient Summary</h1>

  {#if shl}
    <HealthLink {shl} />
    <button
      on:click={() => {
        shl = undefined;
      }}>Create new SHLink</button
    >
  {:else if browser}
    <AddFile
      on:shc-retrieved={async ({ detail }) => {
        shl = await newShlFromShc(detail);
      }}
    />
  {:else}
      Loading
  {/if}
  <footer>
    This demonstration shows how to create a <a
      target="_blank"
      rel="noreferrer"
      href="https://docs.smarthealthit.org/smart-health-links/user-stories">SMART Health Link</a
    >
    for any FHIR
    <a href="https://build.fhir.org/ig/HL7/fhir-ips/" target="_blank" rel="noreferrer"
      >International Patient Summary</a
    >
    document. SHLinks can be shared by copy/paste, or by presenting a QR. Source at
    <a href="https://github.com/jmandel/shlips" target="_blank" rel="noreferrer"
      >github.com/jmandel/shlips</a
    >.
  </footer>
</div>

<style>
  h1 {
    font-size: 1rem;
  }
  div {
    max-width: 800px;
  }
  footer {
    margin-top: 3em;
    font-style: italic;
  }
</style>
