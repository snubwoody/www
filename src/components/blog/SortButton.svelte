<script lang="ts">
    import Dropdown from "@components/Dropdown.svelte";
    import { DropdownMenu } from "bits-ui";
    import type { SortOption } from "../../lib";
    // TODO: close on click

    interface Props {
        sortOption: SortOption;
    }

    const { sortOption }: Props = $props();
    // TODO: focus color
</script>

<Dropdown>
    {#snippet trigger()}
        Sort by:
        {#if sortOption === "title"}
            Title
        {:else if sortOption === "date_created"}
            Date created
        {/if}
    {/snippet}
        <ul class="space-y-8">
            <DropdownMenu.Item class="menu-item" data-selected={sortOption === "date_created"}>
                <a href="/blog?sort_by=date_created">Date created</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item class="menu-item" data-selected={sortOption === "title"}>
                <a href="/blog?sort_by=title">Title</a>
            </DropdownMenu.Item>
        </ul>
</Dropdown>

<style>
    :global(.menu-item){
        padding: 8px;
        transition: all 250ms ease-in-out;
        border-radius: var(--radius-sm);

        &[data-selected="false"]:hover {
            background: var(--color-purple-50);
        }

        &[data-selected="true"] {
            background: var(--color-purple-100);
            color: var(--color-purple-700);
        }
    }
</style>
