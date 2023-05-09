<script lang="ts">
  import QRCode from 'qrcode';
  import { getContext } from 'svelte';
  import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardSubtitle,
    CardText,
    CardTitle,
    FormGroup,
    Icon,
    Input,
    Label
  } from 'sveltestrap';

  import { goto } from '$app/navigation';
  import type { Writable } from 'svelte/store';
  import type { SHLAdminParams, SHLClient } from './managementClient';

  export let shl: SHLAdminParams;
  let shlControlled: SHLAdminParams;

  function syncProps(shl: SHLAdminParams) {
    shlControlled = JSON.parse(JSON.stringify(shl));
  }
  $: syncProps(shl);

  let shlStore: Writable<SHLAdminParams[]> = getContext('shlStore');
  let shlClient: SHLClient = getContext('shlClient');

  let copyNotice = '';

  let href: Promise<string>;
  let qrCode: Promise<string>;

  $: {
    href = shlClient.toLink(shl);
  }

  $: {
    qrCode = href.then((r) => QRCode.toDataURL(r, { errorCorrectionLevel: 'M' }));
  }

  let canShare = navigator?.canShare?.({ url: 'https://example.com', title: 'Title' });

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
    shlClient.deleteShl(shl);
    $shlStore = $shlStore.filter((l) => l.id !== shl.id);
    goto('/');
  }
</script>

<Card class="mb-3" color="light">
  <CardHeader>
    <CardTitle>
      <Icon name={shl.passcode ? 'lock' : 'unlock'} />
      {shl.label}</CardTitle
    >
  </CardHeader>
  <CardBody>
    {#if shl.exp}
      <CardSubtitle color="success"
        >Expires: {new Date(shl.exp * 1000).toISOString().slice(0, 10)}
      </CardSubtitle>
    {/if}

    <CardText>
      {#await qrCode then dataUrl}
        <p class="logo">
          <img class="qr" alt="QR Code for SHL" src={dataUrl} />
          <img class="logo" alt="SMART Logo" src={'/smart-logo.svg'} />
        </p>
      {/await}
    </CardText>
  </CardBody>
  <CardFooter>
    {#if canShare}
      <Button
        size="sm"
        color="success"
        on:click={async () => {
          navigator.share({ url: await href, title: shl.label });
        }}><Icon name="share" /> Share</Button
      >
    {/if}
    <Button size="sm" color="success" on:click={copyShl} disabled={!!copyNotice}>
      <Icon name="clipboard" />
      {#if copyNotice}
        {copyNotice}
      {:else}
        Copy
      {/if}
    </Button>
    {#await href then href}
      <Button size="sm" color="success" {href} target="_blank">
        <Icon name="window" /> Open
      </Button>
    {/await}
  </CardFooter>
</Card>
<h5>Configuration</h5>
<FormGroup class="label shlbutton">
  <Label for="label">Label for SMART Health Link</Label>
  <Input
    name="label"
    maxlength={40}
    type="text"
    bind:value={shlControlled.label}
    placeholder="label"
  />
  <Button
    size="sm"
    color="secondary"
    disabled={(shl.label || '') === (shlControlled.label || '')}
    on:click={async () => {
      $shlStore = $shlStore.map((e) =>
        e.id === shl.id ? { ...shl, label: shlControlled.label } : e
      );
    }}><Icon name="sticky" /> Update Label</Button
  >
</FormGroup>
<FormGroup class="passcode shlbutton">
  <Label for="passcode">Protect with Passcode (optional)</Label>
  <Input
    maxlength={40}
    name="passcode"
    type="text"
    bind:value={shlControlled.passcode}
    placeholder="Assign Passcode"
  />
  <Button
    size="sm"
    color="secondary"
    disabled={(shl.passcode || '') === (shlControlled.passcode || '')}
    on:click={async () => {
      await shlClient.resetShl({ ...shl, passcode: shlControlled.passcode });
      $shlStore = $shlStore.map((e) =>
        e.id === shl.id ? { ...shl, passcode: shlControlled.passcode } : e
      );
    }}><Icon name="lock" /> Update Passcode</Button
  >
</FormGroup>
<FormGroup class="shlbutton">
  <Button size="sm" on:click={deleteShl} color="danger">Delete SMART Health Link</Button>
</FormGroup>

<style>
  img.qr {
    height: 100%;
  }
  p.logo {
    position: relative;
    width: 250px;
    height: 250px;
  }
  img.logo {
    position: absolute;
    background: white;
    width: 100px;
    left: calc(50% - 50px);
    top: calc(50% - 1em);
    border: 2px solid white;
    box-sizing: border-box;
  }
  :global(.shlbutton) {
    width: 300px !important;
  }
  :global(.shlbutton input, .shlbutton button) {
    width: 100%;
    display: inline-block;
  }
  :global(div.card) {
    max-width: 300px;
  }
  :global(.card-title) {
    font-size: 1em;
    font-weight: bold;
  }
</style>
