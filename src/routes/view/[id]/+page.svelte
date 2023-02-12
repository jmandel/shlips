<script lang="ts">
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import HealthLink from '$lib/HealthLink.svelte';
  import type { SHLAdminParams } from '$lib/managementClient';
  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');
  let shl: SHLAdminParams | undefined;
  $: {
    shl = $shlStore.filter((s) => s.id === $page.params.id)?.[0];
  }
</script>

{#if shl}
  <HealthLink {shl} />
{:else}
  SHLink {$page.params.id} Not Found
{/if}
