<script lang="ts">
  import { onMount } from 'svelte';
  interface A11yOptionsOption {
    label:string;
    value:string;
  }
  export let defaultValue:string = '';
  export let name:string = '';
  export let label:string = '';
  export let options:Array<A11yOptionsOption> = [];
  let optionValue = defaultValue || '';

  const handleCheck = (event:Event) => {
    if (event.currentTarget instanceof HTMLInputElement) {
      optionValue = event.currentTarget.value;
    }
    setValue();
  }

  const dispatch = (name:string, detail:any) => {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  const setValue = () => {
    dispatch('a11y-options-change', { name, optionValue });
  }

  onMount(() => {
    setValue();
  });
</script>

<div data-a11y-options-name={name}>
  <fieldset>
    <legend>{label}</legend>
    <div class="a11y-options-group">
      {#each options as option}
        <label data-has-checked={String(optionValue === option.value)}>
          <input
            type="radio"
            group={optionValue}
            name={name}
            value={option.value}
            checked={optionValue === option.value}
            on:change={handleCheck}
          /> {option.label}
        </label>
      {/each}
    </div>
  </fieldset>
</div>

<style lang="scss">
  fieldset {
    border: 0;
  }

  legend {
    font-weight: var(--FONT-WEIGHT--B);
    line-height: var(--LINE-HEIGHT--SM);
    margin: 0 0 .5em;
  }

  .a11y-options-group {
    display: grid;
    gap: .5em;
    grid-template-columns: repeat(auto-fit, minmax(1em, 1fr));
  }

  label {
    background-color: var(--a11y-options-label-bg-color, #222);
    border: var(--PX-TO-REM--1) solid currentColor;
    border-radius: var(--RADIUS--RG);
    font-weight: var(--a11y-options-label-font-weight, var(--FONT-WEIGHT--M));
    line-height: var(--LINE-HEIGHT--SM);
    padding: .5em;
    &[data-has-checked=true] {
      --a11y-options-label-bg-color: var(--global-primary-color);
      --a11y-options-label-font-weight: var(--FONT-WEIGHT--B);
    }
  }
</style>
