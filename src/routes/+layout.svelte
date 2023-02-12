<script lang="ts">
  import { goto } from '$app/navigation';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import {
    ButtonDropdown,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Icon,
    Navbar,
    NavbarBrand,
    Row,
    Styles
  } from 'sveltestrap';
  import { SHLClient, type SHLAdminParams } from '$lib/managementClient';

  const LOCAL_STORAGE_KEY = 'shlips_store_shls';
  let shlStore = writable<SHLAdminParams[]>(
    window.localStorage[LOCAL_STORAGE_KEY] ? JSON.parse(window.localStorage[LOCAL_STORAGE_KEY]) : []
  );

  $: {
    if ($shlStore) window.localStorage[LOCAL_STORAGE_KEY] = JSON.stringify($shlStore);
  }
  setContext('shlStore', shlStore);

  let shlClient = new SHLClient();
  setContext('shlClient', shlClient);

  let reset = writable(0);
  setContext('reset', reset);
</script>

<Container class="main" fluid>
  <Styles />
  <Row>
    <Col>
      <Navbar>
        <NavbarBrand href="/">SMART Health Links for IPS</NavbarBrand>
        <ButtonDropdown size="sm" direction="down">
          <DropdownToggle color="primary" caret>Actions...</DropdownToggle>
          <DropdownMenu>
            <DropdownItem href="/create">Add New SHLink</DropdownItem>
            <DropdownItem
              on:click={() => {
                delete window.localStorage[LOCAL_STORAGE_KEY];
                goto('/');
              }}>Reset Demo</DropdownItem
            >
            {#if $shlStore.length > 0}
              <DropdownItem divider />
              <DropdownItem header>Stored SHLinks</DropdownItem>
              {#each $shlStore as shl, i}
                <DropdownItem href={'/view/' + shl.id}
                  ><Icon name="eye" />
                  {shl.label || `SHLink ${i + 1}`}</DropdownItem
                >
              {/each}
            {/if}
          </DropdownMenu>
        </ButtonDropdown>
      </Navbar>
    </Col>
  </Row>
  <Row>
    <Col>
      <slot />
    </Col>
  </Row>
  <Row>
    <Col>
      <footer>
        This demonstration shows how to create a <a
          target="_blank"
          rel="noreferrer"
          href="https://docs.smarthealthit.org/smart-health-links/user-stories">SMART Health Link</a
        >
        for any FHIR
        <a href="https://build.fhir.org/ig/HL7/fhir-ips/" target="_blank" rel="noreferrer"
          >International Patient Summary</a
        >
        document. SHLinks can be shared by copy/paste, or by presenting a QR. Source at
        <a href="https://github.com/jmandel/shlips" target="_blank" rel="noreferrer"
          >github.com/jmandel/shlips</a
        >.
      </footer>
    </Col>
  </Row>
</Container>

<style>
  footer {
    margin-top: 1em;
    font-style: italic;
    position: absolute;
    bottom: 1em;
  }
  :global(div.container-fluid.main) {
    position: relative;
    min-height: 100%;
    margin-right: auto;
    margin-left: auto;
    max-width: 800px;
  }
  :global(html, body) {
    height: 100%;
  }
  :global(.navbar .container-fluid) {
    padding: 0px;
  }
</style>
