<script lang="ts">
  import AddFile from '../AddFile.svelte';
  import { setContext } from 'svelte';
  import * as jose from 'jose';
  import type { ClientSHL } from '../managementClient';
  import { SHLClient } from '../managementClient';
  import type { SHCRetrieveEvent } from '../types';
  import HealthLink from '../HealthLink.svelte';
  import { redirect } from '@sveltejs/kit';

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
  <h1>SMART Health Links for IPS</h1>

  {#if shl}
    <HealthLink {shl} />
    <button
      on:click={() => {
        shl = undefined;
      }}>Create new SHL</button
    >
  {:else}
    <AddFile
      on:shc-retrieved={async ({ detail }) => {
        shl = await newShl(detail);
      }}
    />
  {/if}
</div>

<style>
  div {
    max-width: 800px;
  }
</style>
