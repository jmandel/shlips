<script lang="ts">
  import AddFile from '../AddFile.svelte';
  import { setContext } from 'svelte';
  import * as jose from 'jose';
  import type { ClientSHL } from '../managementClient';
  import { SHLClient } from '../managementClient';
  import type { SHCRetrieveEvent } from '../types';
  import HealthLink from '../HealthLink.svelte';

  let shlClient = new SHLClient();
  let summaryUrl = '';
  let shl: ClientSHL | undefined;

  setContext('shlClient', shlClient);

  async function newShl(details: SHCRetrieveEvent) {
    console.log('Creating at', summaryUrl);
    let shlCreated = await shlClient.create();
    let encrypted = await new jose.CompactEncrypt(
      new TextEncoder().encode(JSON.stringify(details.shc))
    )
      .setProtectedHeader({
        alg: 'dir',
        enc: 'A256GCM'
      })
      .encrypt(jose.base64url.decode(shlCreated.encryptionKey));

    shlClient.addFile(
      shlCreated,
      new TextEncoder().encode(encrypted),
      'application/smart-health-card'
    );
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
  {:else}
    <AddFile
      on:shc-retrieved={async ({ detail }) => {
        shl = await newShl(detail);
      }}
    />
  {/if}
  <footer>
    This demonstration shows how to create a <a
      href="https://docs.smarthealthit.org/smart-health-links/user-stories">SMART Health Link</a
    >
    for any FHIR
    <a href="https://build.fhir.org/ig/HL7/fhir-ips/">International Patient Summary</a> document.
    SHLinks can be shared by copy/paste, or by presenting a QR. Source at
    <a href="https://github.com/jmandel/shlips">github.com/jmandel/shlips</a>.
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
