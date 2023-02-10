<script lang="ts">
  import { browser } from '$app/environment';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import AddFile from '../AddFile.svelte';
  import HealthLink from '../HealthLink.svelte';
  import type { SHLAdminParams, SHLClient } from '../managementClient';
  import type { SHCRetrieveEvent } from '../types';

  let shlClient: SHLClient = getContext('shlClient');

  let reset: Writable<number> = getContext('reset');

  const LOCAL_STORAGE_KEY = 'shlips_store';
  let shl: SHLAdminParams | undefined =
    browser && window.localStorage[LOCAL_STORAGE_KEY]
      ? JSON.parse(window.localStorage[LOCAL_STORAGE_KEY])
      : undefined;

  $: if ($reset) shl = undefined;
  $: {
    if (browser && shl) window.localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(shl);
  }

  async function newShlFromShc(details: SHCRetrieveEvent) {
    const shlCreated = await shlClient.createShl();
    shlClient.addFile(shlCreated, details.shc, 'application/smart-health-card');
    return shlCreated;
  }
</script>

{#if shl}
  <HealthLink {shl} />
{:else if browser}
  <AddFile
    on:shc-retrieved={async ({ detail }) => {
      shl = await newShlFromShc(detail);
    }}
  />
{:else}
  Loading
{/if}
