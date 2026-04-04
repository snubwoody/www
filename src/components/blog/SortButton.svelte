<script lang="ts">
    import DropdownMenu from "@components/DropdownMenu.svelte";
    // TODO: close on click
</script>

<DropdownMenu>
    {#snippet trigger()}
        Sort by: Date created
    {/snippet}
    {#snippet children()}
        <ul class="space-y-8">
            <li class="menu-item" data-selected="true">Date created</li>
            <li class="menu-item" data-selected="false">Title</li>
        </ul>
    {/snippet}
</DropdownMenu>

<style>
    .menu-item{
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
