<script>
	import { onMount } from 'svelte';

	// 1. Task State (max 5 items, backed by localStorage)
	let todos = $state([]);
	let newTodoText = $state('');

	onMount(() => {
		const stored = localStorage.getItem('focus_five_todos');
		if (stored) {
			try { todos = JSON.parse(stored); } catch (e) { todos = []; }
		}
	});

	$effect(() => {
		localStorage.setItem('focus_five_todos', JSON.stringify(todos));
	});

	function addTodo() {
		const trimmed = newTodoText.trim();
		if (!trimmed || todos.length >= 5) return;
		todos.push({
			id: crypto.randomUUID(),
			title: trimmed,
			completed: false,
			sessions: 0
		});
		newTodoText = '';
	}

	function removeTodo(id) {
		todos = todos.filter((t) => t.id !== id);
		if (boundTaskId === id) boundTaskId = null;
	}

	function toggleTodo(id) {
		todos = todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
	}

	// 2. Timer State (25m work / 5m break)
	let mode = $state('work'); // 'work' | 'break'
	let timeLeft = $state(25 * 60);
	let isRunning = $state(false);
	let boundTaskId = $state(null);
	let timerInterval = null;

	const boundTask = $derived(todos.find((t) => t.id === boundTaskId));

	function toggleTimer() {
		if (isRunning) {
			clearInterval(timerInterval);
			isRunning = false;
		} else {
			isRunning = true;
			timerInterval = setInterval(() => {
				if (timeLeft > 0) {
					timeLeft -= 1;
				} else {
					handleTimerComplete();
				}
			}, 1000);
		}
	}

	function resetTimer() {
		clearInterval(timerInterval);
		isRunning = false;
		timeLeft = mode === 'work' ? 25 * 60 : 5 * 60;
	}

	function handleTimerComplete() {
		clearInterval(timerInterval);
		isRunning = false;

		if (mode === 'work') {
			if (boundTaskId) {
				todos = todos.map((t) =>
					t.id === boundTaskId ? { ...t, sessions: t.sessions + 1 } : t
				);
			}
			mode = 'break';
			timeLeft = 5 * 60;
		} else {
			mode = 'work';
			timeLeft = 25 * 60;
		}
	}

	function bindTask(id) {
		boundTaskId = boundTaskId === id ? null : id;
	}

	function formatTime(seconds) {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<main class="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
	<div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
		<!-- Left Column: 5-Item Goal Board -->
		<section class="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold tracking-tight">Focus Five</h1>
				<span class="text-xs font-semibold px-3 py-1 rounded-full bg-slate-700 text-slate-300">
					{todos.length} / 5 Slots
				</span>
			</div>

			<!-- Task Input Form -->
			<form onsubmit={(e) => { e.preventDefault(); addTodo(); }} class="flex gap-2 mb-6">
				<input
					type="text"
					bind:value={newTodoText}
					disabled={todos.length >= 5}
					placeholder={todos.length >= 5 ? '5/5 Limit Reached' : 'Add a core focus goal...'}
					class="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={todos.length >= 5 || !newTodoText.trim()}
					class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
				>
					Add
				</button>
			</form>

			<!-- Todo Items List -->
			<ul class="space-y-3">
				{#each todos as todo (todo.id)}
					<li
						class="flex items-center justify-between p-3 rounded-lg border transition {boundTaskId === todo.id ? 'bg-indigo-950/40 border-indigo-500/60' : 'bg-slate-900/40 border-slate-800'}"
					>
						<div class="flex items-center gap-3 overflow-hidden">
							<input
								type="checkbox"
								checked={todo.completed}
								onchange={() => toggleTodo(todo.id)}
								class="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-0"
							/>
							<span class="text-sm truncate {todo.completed ? 'line-through text-slate-500' : 'text-slate-200'}">
								{todo.title}
							</span>
							{#if todo.sessions > 0}
								<span class="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full">
									🍅 {todo.sessions}
								</span>
							{/if}
						</div>

						<div class="flex items-center gap-2">
							<button
								onclick={() => bindTask(todo.id)}
								title="Bind to timer"
								class="text-xs px-2 py-1 rounded border transition {boundTaskId === todo.id ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'}"
							>
								{boundTaskId === todo.id ? 'Linked' : 'Link'}
							</button>
							<button
								onclick={() => removeTodo(todo.id)}
								class="text-slate-500 hover:text-rose-400 text-sm px-1"
							>
								✕
							</button>
						</div>
					</li>
				{/each}

				{#if todos.length === 0}
					<li class="text-center py-8 text-sm text-slate-500 italic">
						No active focus items. Add up to 5 goals to begin.
					</li>
				{/if}
			</ul>
		</section>

		<!-- Right Column: Pomodoro Timer -->
		<section class="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/50 shadow-xl flex flex-col items-center justify-center text-center">
			<div class="mb-4">
				<span class="text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full {mode === 'work' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-emerald-900/50 text-emerald-300'}">
					{mode === 'work' ? 'Deep Work (25m)' : 'Relax Period (5m)'}
				</span>
			</div>

			<!-- Timer Display -->
			<div class="text-6xl font-extrabold tracking-tighter my-4 font-mono text-slate-100">
				{formatTime(timeLeft)}
			</div>

			<!-- Bound Task Indicator -->
			<div class="h-8 mb-6 text-sm text-slate-400">
				{#if boundTask}
					<span>Target: <strong class="text-indigo-400">{boundTask.title}</strong></span>
				{:else}
					<span class="italic text-slate-600">No task linked (General focus session)</span>
				{/if}
			</div>

			<!-- Timer Controls -->
			<div class="flex gap-4">
				<button
					onclick={toggleTimer}
					class="w-28 py-3 rounded-xl font-bold text-sm transition shadow-lg {isRunning ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}"
				>
					{isRunning ? 'Pause' : 'Start'}
				</button>
				<button
					onclick={resetTimer}
					class="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-medium text-sm transition"
				>
					Reset
				</button>
			</div>
		</section>
	</div>
</main>
