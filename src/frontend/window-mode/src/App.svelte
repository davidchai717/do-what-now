<script lang="ts">
	const {ipcRenderer} = require('electron');
	let taskName: string = '';
	ipcRenderer.on('new-pinned-task', (e, newTaskName) => {
		taskName = newTaskName;
	})
</script>

<main>
	<div class="prefix">Do this now:</div>
	<p><strong>{taskName || "Loading the next task..."}</strong></p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		color: white;
	}

	.prefix {
		text-transform: uppercase;
	}

	p {
		margin: 0 0 0 0;
		font-size: 2em;
	}
</style>