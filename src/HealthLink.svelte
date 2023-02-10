<script lang="ts">
  import { getContext } from 'svelte';
  import QRCode from 'qrcode';

  import type { SHLAdminParams, SHLClient } from './managementClient';
  export let shl: SHLAdminParams;
  let shlClient: SHLClient = getContext('shlClient');
  let copyNotice = '';

  let href: Promise<string>;
  let qrCode: Promise<string>;

  $: {
    href = shlClient.toLink(shl);
  }

  $: {
    qrCode = href.then((r) => QRCode.toDataURL(r));
  }

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
      <button on:click={copyShl} disabled={!!copyNotice}>
        {#if copyNotice}
          {copyNotice}
        {:else}
          Copy SHLink
        {/if}
      </button>
    </li>
    {#await href then href}
      <li>
        <a {href} target="_blank" rel="noreferrer">Open SHLink</a>
      </li>
    {/await}
    {#await qrCode then dataUrl}
      <li class="logo">
        <img class="qr" alt="QR Code for SHL" src={dataUrl} />
        <img class="logo" alt="SMART Logo" src={"./smart-logo.svg"} />
      </li>
    {/await}
  </ul>
</div>

<style>
  img.qr {
    vertical-align: top;
    height: 100%;
  }
  li.logo {
    position:relative;
    height: 200px;
  }
  img.logo {
    position: absolute;
    background: white;
    width: 100px;
    left: 50px;
    top: 85px;
    border: 2px solid white;
    box-sizing: border-box;
  }
</style>
