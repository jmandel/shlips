<script lang="ts" context="module">
</script>

<script lang="ts">
  import * as store from 'svelte/store';
  import type { ClientSHL } from '../managementClient';
  import { SHLClient } from '../managementClient';
  let shls: store.Writable<ClientSHL[]> = store.writable([]);
  let shlClient = new SHLClient();
  let summaryUrl = '';
  let activeShlink = '';

  async function newShl() {
    console.log('Creating at', summaryUrl);
    let shl = await shlClient.create({});
    shlClient.addFile(shl, new TextEncoder().encode('{}'), 'application/json');
    activeShlink = await shlClient.toLink(shl);
  }
</script>

<h1>SMART Health Links for IPS</h1>
<input bind:value={summaryUrl} />
<button on:click={newShl}>Create SHL</button>
<a href={activeShlink || '#'}>Share Link</a>
