<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    interface Props extends HTMLInputAttributes{}

    let {
        value = $bindable(),
        // eslint-disable-next-line prefer-const
        placeholder,
        // eslint-disable-next-line prefer-const
        type = "text"
    }:Props = $props();
</script>

<input {type} bind:value={value} {placeholder}>

<style>
    input{
        width: 100%;
        padding: 12px;
        border-bottom: 2px solid var(--color-border-strong);

        &::placeholder{
            color: var(--color-text-muted);
        }

        &:focus{
            outline: none;
        }
    }
</style>
