<script lang='ts'>
    import {Sun,Moon} from "@lucide/svelte/icons";
    import {type Theme} from "../lib/theme";

    const switchTheme = async (theme:Theme) => {
        localStorage.setItem("theme",JSON.stringify(theme));
        const element = document.querySelector("html");
        element?.setAttribute("data-theme",theme);
    };
</script>

<div class="flex items-center gap-16">
    <button
        onclick={() => switchTheme("light")}
        aria-label="Toggle light mode"
        class='light:hidden'
    >
        <Sun size='20' class='relative z-50'/>
    </button>
    <button
        onclick={() => switchTheme("dark")}
        aria-label="Toggle dark mode"
        class='dark:hidden'
    >
        <Moon size='20' strokeWidth='2.25' class='relative z-50 text-black'/>
    </button>
    <a href="https://github.com/snubwoody" aria-label="Github profile" class="github-link"></a>
</div>

<style>
	.github-link{
		width: 24px;
		aspect-ratio: 1.02 / 1;
		background-size: cover;
        background-image: url('/external/icons/github-mark.svg');


        :global([data-theme="dark"]) & {
            background-image: url('/external/icons/github-mark-white.svg');
        }
	}

	button{
		padding: 8px;
		border-radius: inherit;
	}
</style>
