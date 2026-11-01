// src/lib/stores/todoStore.js (or using Svelte 5 runes in a .svelte.js file)
import { browser } from '$app/environment';

export function createFocusStore() {
    let todos = $state(
        browser ? JSON.parse(localStorage.getItem('focus_five_todos') || '[]') : []
    );

    $effect(() => {
        if (browser) {
            localStorage.setItem('focus_five_todos', JSON.stringify(todos));
        }
    });

    return {
        get list() { return todos; },
        add(title) {
            if (todos.length >= 5) return false; // Enforce strict 5-item cap
            todos.push({ id: crypto.randomUUID(), title, completed: false, sessions: 0 });
            return true;
        },
        remove(id) {
            todos = todos.filter(t => t.id !== id);
        },
        toggle(id) {
            todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        },
        incrementSession(id) {
            todos = todos.map(t => t.id === id ? { ...t, sessions: t.sessions + 1 } : t);
        }
    };
}
