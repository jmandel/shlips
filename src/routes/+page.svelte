<script lang="ts">
  import { browser } from '$app/environment';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import AddFile from '../AddFile.svelte';
  import HealthLink from '../HealthLink.svelte';
  import type { SHLAdminParams, SHLClient } from '../managementClient';
  import type { SHCRetrieveEvent } from '../types';

  let shlClient: SHLClient = getContext('shlClient');
  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');
  let selectedShl: Writable<number | undefined> = getContext('selectedShl');
  let reset: Writable<number> = getContext('reset');

  $: if ($reset) $shlStore = [];

  async function newShlFromShc(details: SHCRetrieveEvent) {
    const shlCreated = await shlClient.createShl();
    shlClient.addFile(shlCreated, details.shc, 'application/smart-health-card');
    shlCreated.label = details.label;
    return shlCreated;
  }
</script>

{#if $selectedShl !== undefined}
  <HealthLink shl={$shlStore[$selectedShl]} />
{:else if browser}
  <AddFile
    on:shc-retrieved={async ({ detail }) => {
      $shlStore = [...$shlStore, await newShlFromShc(detail)];
      $selectedShl = $shlStore.length - 1;
    }}
  />
{:else}
  Loading
{/if}
