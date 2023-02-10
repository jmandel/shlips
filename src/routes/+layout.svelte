<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import { Col, Container, Row } from 'sveltestrap';
  import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'sveltestrap';
  import { setContext } from 'svelte';
  import { SHLClient } from '../managementClient';
  import { writable } from 'svelte/store';
  let shlClient = new SHLClient();
  setContext('shlClient', shlClient);

  let reset = writable(0);
  setContext('reset', reset);
</script>

<Container class="main" fluid>
  <Row>
    <Col>
      <Navbar>
        <NavbarBrand href="/">SMART Health Links for IPS</NavbarBrand>
        <Nav class="ms-auto" navbar>
          <NavItem>
            <NavLink
              on:click={() => {
                $reset++;
              }}>Reset SHL</NavLink
            >
          </NavItem>
        </Nav>
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
