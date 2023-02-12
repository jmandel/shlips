<script lang="ts">
  import { goto } from '$app/navigation';
  import type { SHLAdminParams, SHLClient } from '$lib/managementClient';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  let shlClient: SHLClient = getContext('shlClient');
  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');
  if ($shlStore.length) {
    goto("/view/"+$shlStore[0].id)
  } else {
    goto("/create")
  }
</script>
