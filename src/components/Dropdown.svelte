<script lang="ts">
    import {DropdownMenu} from "bits-ui";
    import {ChevronDown} from "@lucide/svelte";
    import type {Snippet} from "svelte";

    interface Props{
        trigger: Snippet,
        children: Snippet,

    }

    const {trigger,children}:Props = $props();
    // TODO: animate content
    let open = $state(false);
</script>

<DropdownMenu.Root bind:open>
    <DropdownMenu.Trigger class="dropdown-trigger">
        {@render trigger()}
        <ChevronDown size="16"/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
        <DropdownMenu.Content class="dropdown-content">
            {@render children()}
        </DropdownMenu.Content>
    </DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
    :global(.dropdown-trigger){
        gap: 12px;
        padding: 8px;
        display: flex;
        align-items: center;
        border-radius: var(--radius-md);
        transition: all 200ms ease-in-out;

        :global(&[data-state="open"]), &:focus{
            color: var(--color-purple-500);
        }

        &:hover{
            background: var(--color-neutral-25);
        }

        :global([data-theme="dark"] &:hover){
            background: var(--color-neutral-900);
        }
    }

    :global(.dropdown-content){
        background-color: var(--color-white);
        box-shadow: var(--shadow-md);
        padding: 8px;
        border-radius: var(--radius-md);
        min-width: var(--bits-dropdown-menu-anchor-width);
        width: fit-content;
        border: 1px solid var(--color-neutral-50);
    }
</style>
