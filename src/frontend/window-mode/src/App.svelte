<script lang="ts">
	const {ipcRenderer} = require('electron');
	let taskName: string = '';
	ipcRenderer.on('new-pinned-task', (e, newTaskName) => {
		taskName = newTaskName;
	})
</script>

<main>
	<p>{taskName || "Loading the next task..."}</p>
</main>

<style>
	main {
		-webkit-user-select: none;
  		-webkit-app-region: drag;
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	p {
		color: white;
		font-size: 2em;
		font-weight: 100;
	}
</style>