<script lang="ts">
    type Tab = "Folio" | "Cascada";
    let activeTab: Tab = $state("Folio");

    const selectTab = (tab: Tab) => activeTab = tab;
</script>

<section>
    <h2 data-observe>Software</h2>
    <div class="max-w-[600px] w-full flex flex-col gap-44">
        <div class="tab-bar">
            <button data-selected={activeTab === "Folio"} class="tab-button text-h4" onclick={() => selectTab("Folio")}>
                Folio
            </button>
            <button data-selected={activeTab === "Cascada"} class="tab-button text-h4" onclick={() => selectTab("Cascada")}>
                Cascada
            </button>
        </div>
        <div class="w-full flex flex-col gap-12 items-center md:px-32">
            <ul class="flex items-center gap-20 text-text-brand-rest">
                {#if activeTab === "Folio"}
                    <li><a href="https://github.com/snubwoody/folio">Github repository</a></li>
                    <li><a href="https://folio.wakunguma.com">Website</a></li>
                {:else}
                    <li><a href="https://github.com/snubwoody/cascada">Github repository</a></li>
                    <li><a href="https://docs.rs/cascada/latest/cascada">Documentation</a></li>
                {/if}
            </ul>
                <p data-observe class="w-full text-center">
                    {#if activeTab === "Folio"}
                        Folio is a privacy-focused offline desktop application built for people who want
                        full control over their data. It stores everything locally on your machine, with
                        no accounts, analytics, or cloud services behind the scenes.
                    {:else}
                        Cascada is a lightweight, high-performance UI layout engine with a predictable
                        layout algorithm. It offers a simple declarative syntax,
                        and consistent results, making it ideal for building fast, reliable
                        interfaces in Rust without unnecessary complexity.
                    {/if}
                </p>
        </div>
    </div>
</section>

<style>
    h2{
        opacity: 0;
        translate: -10% 0;
        transition: all 1s;

        :global(&[data-visible="true"]){
            opacity: 1;
            translate: 0;
        }
    }

    p{
        opacity: 0;
        translate: 0% 10%;
        transition: all 1s;

        :global(&[data-visible="true"]){
            opacity: 1;
            translate: 0;
        }
    }

    section{
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding: 56px;
        align-items: center;

        @media (width < 768px) {
            padding: 24px;
        }
    }

    .main{
        display: flex;
        max-width: 600px;
    }

    .tab-bar{
        display: flex;
        align-items: center;
        width: 100%;
    }

    .tab-button{
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px 0px;
        width: 100%;
        border-bottom: 3px solid var(--color-neutral-50);
        transition: all 450ms;

        :global([data-theme="dark"] &){
            border-color: var(--color-neutral-900);
        }

        &[data-selected="true"] {
            border-color: var(--color-neutral-950);
        }

        :global([data-theme="dark"] &[data-selected="true"]){
            border-color: var(--color-purple-100);
        }
    }

    img{
        width: 100%;
    }
</style>


