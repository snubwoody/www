<script lang='ts'>
    import {Sun,Moon} from "@lucide/svelte/icons";
    
    const toggleTheme = () => {
        const element = document.querySelector("html");
        const currentTheme = element?.getAttribute("data-theme");
        const theme = currentTheme === "light" ? "dark" : "light";
        element?.setAttribute("data-theme",theme);
    };
</script>

<button onclick={toggleTheme} aria-label="Toggle theme">
    <div class="background"></div>
    <div class="sun">
        <Sun size='20' fill="currentColor"  class='relative z-50' aria-hidden="true"/>
    </div>
    <div class="moon">
        <Moon size='20' fill="currentColor" strokeWidth='2.25' class='relative z-50' aria-hidden="true"/>
    </div>
</button>


<style>
	button{
        display: flex;
        align-items: center;
        position: relative;
        gap: 8px;
		padding: 8px;
		border-radius: calc(infinity * 1px);
        background: var(--color-neutral-25);
        border: 1px solid var(--color-neutral-50);
        
        :global([data-theme="dark"]) &{
            background: var(--color-neutral-900);
            border-color: var(--color-neutral-800);
        }
	}

    .background{
        position: absolute;
        top: 4px;
        left: 4px;
        width: calc(20px + 8px);
        aspect-ratio: 1/1;
        border-radius: calc(infinity * 1px);
        background-color: var(--color-neutral-50);
        transition: all 200ms;
        transition: transform 250ms,
                background-color 200ms;

        
        :global([data-theme="dark"]) &{
            transform: translateX(calc(20px + 8px));
            background-color: var(--color-neutral-800);
        } 
    }
</style>
