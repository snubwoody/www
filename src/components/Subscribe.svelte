<script lang="ts">
    import Input from "./Input.svelte";
    import {ArrowRight} from "@lucide/svelte/icons";

    let loading = $state(false);
    let failed = $state(false);
    let email: null | string = $state(null);
    let errorMessage = $state("Something went wrong");

    const subscribe = async () => {
        // TODO: mock this
        try{
            loading = true;
            const url = "/api/subscribe";
            const response = await fetch(url,{
                method:"POST",
                headers: {
                    "content-type":"application/json"
                },
                body: JSON.stringify({email})
            });

            if (response.ok){
                // success = true;
                setTimeout(() => {
                    // success = false;
                    email = "";
                },2500);         
                return;
            }
            // const body = await response.json();
            // errorMessage = body.details ?? "Something went wrong";
            // TODO: match based on error code
            errorMessage = "Something went wrong";
            failed = true;
            setTimeout(() => {
                failed = false;
            },2500);
        }catch{
            failed = true;
            setTimeout(() => {
                failed = false;
            },2500);
        } finally{
            loading = false;
        }
        
    };
    // TODO: make this a form
</script>

<div class="flex flex-col max-sm:items-center flex-1 max-w-[400px]">
    <h5 class="mb-4">Join my newsletter</h5>
    <div class="flex max-sm:flex-col max-sm:w-full items-center gap-24">
        <div class="w-full">
            <!--TODO: add error message to input component--->
            <!--FIXME: layout shift--->
            <Input bind:value={email} type="email" placeholder="Email"/>
            {#if failed}
                <p class="mt-8">{errorMessage}</p>
            {/if}
        </div>
        {#if loading}
            <div class="spinner"></div>
        {:else}
            <button onclick={subscribe}>
                <ArrowRight size='24'/>
            </button>
        {/if}
    </div>
</div>


<style>
    .spinner {
		border: 2px solid var(--color-neutral-900);
        border-bottom-color: transparent;
		border-radius: 50%;
		width: 24px;
		height: 24px;
        flex-shrink: 0;
		animation: spin 0.5s linear infinite;

        :global([data-theme="dark"] &) {
            border-color: var(--color-neutral-100);
            border-bottom-color: transparent;
        }

	}

	@keyframes spin {
		to { transform: rotate(360deg); }
    }
</style>
