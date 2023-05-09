<script lang="ts">
  import { goto } from '$app/navigation';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { SHLAdminParams, SHLClient } from '$lib/managementClient';
  import type { SHCRetrieveEvent } from '$lib/types';
  import AddFile from '$lib/AddFile.svelte';

  let shlClient: SHLClient = getContext('shlClient');
  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');

  async function newShlFromShc(details: SHCRetrieveEvent): Promise<SHLAdminParams> {
    const shlCreated = await shlClient.createShl({exp: details.exp});
    shlClient.addFile(shlCreated, details.shc, 'application/smart-health-card');
    shlCreated.label = details.label;
    return shlCreated;
  }
</script>

<AddFile
  on:shc-retrieved={async ({ detail }) => {
    const newShl = await newShlFromShc(detail);
    $shlStore = [...$shlStore, newShl];
    goto(`/view/${newShl.id}`);
  }}
/>
