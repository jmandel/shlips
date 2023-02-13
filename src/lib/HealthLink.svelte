<script lang="ts">
  import QRCode from 'qrcode';
  import { getContext } from 'svelte';
  import { Button, Icon } from 'sveltestrap';

  import { goto } from '$app/navigation';
  import { assets } from '$internal/paths';
  import type { Writable } from 'svelte/store';
  import type { SHLAdminParams, SHLClient } from './managementClient';

  export let shl: SHLAdminParams;
  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');
  let shlClient: SHLClient = getContext('shlClient');

  let copyNotice = '';

  let href: Promise<string>;
  let qrCode: Promise<string>;

  $: {
    href = shlClient.toLink(shl);
  }

  $: {
    qrCode = href.then((r) => QRCode.toDataURL(r, {errorCorrectionLevel: "M"}));
  }

  let canShare = navigator.canShare({ url: 'https://example.com', title: 'Title' });

  async function copyShl() {
    let copyNoticePrev = copyNotice;
    copyNotice = '...';
    let text = await shlClient.toLink(shl);
    navigator.clipboard.writeText(text);
    copyNotice = 'Copied!';
    setTimeout(() => {
      copyNotice = copyNoticePrev;
    }, 1000);
  }

  async function deleteShl() {
    $shlStore = $shlStore.filter((l) => l.id !== shl.id);
    goto('/');
  }
</script>

<div>
  <ul>
    <li>
      Label: {shl.label || '(None)'}
    </li>

    <li>
      Expires:
      {#if shl.exp}
        {new Date(shl.exp * 1000).toISOString().slice(10)}
      {:else}
        (Never)
      {/if}
    </li>

    <li>
      Passcode: {shl.passcode || '(None)'}
    </li>
    <li>
      <Button size="sm" color="success" on:click={copyShl} disabled={!!copyNotice}>
        <Icon name="clipboard" />
        {#if copyNotice}
          {copyNotice}
        {:else}
          Copy
        {/if}
      </Button>
    </li>
    {#if canShare}
      <li>
        <Button
          size="sm"
          color="success"
          on:click={async () => {
            navigator.share({ url: await href, title: shl.label });
          }}><Icon name="share" /> Share</Button
        >
      </li>
    {/if}
    {#await href then href}
      <li>
        <Button size="sm" color="success" {href} target="_blank">
          <Icon name="window" /> Open in new tab
        </Button>
      </li>
    {/await}
    {#await qrCode then dataUrl}
      <li class="logo">
        <span class="show">Present QR</span>
        <img class="qr" alt="QR Code for SHL" src={dataUrl} />
        <img class="logo" alt="SMART Logo" src={assets + '/smart-logo.svg'} />
      </li>
    {/await}
    <li>
      <Button size="sm" on:click={deleteShl} color="danger">Delete SMART Health Link</Button>
    </li>
  </ul>
</div>

<style>
  img.qr {
    position: absolute;
    vertical-align: top;
    height: 100%;
    left: -1em;
    top: 1.5em;
  }
  li.logo {
    position: relative;
    width: 250px;
    height: 250px;
    margin-bottom: 2em;
  }
  img.logo {
    position: absolute;
    background: white;
    width: 100px;
    left: calc(50% - 1em - 50px);
    top: calc(50% + 0.7em);
    border: 2px solid white;
    box-sizing: border-box;
  }
  span.show {
    white-space: nowrap;
  }
  li {
    margin-bottom: 0.1em;
  }
</style>
