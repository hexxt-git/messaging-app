<script lang="ts">
	import { db, auth, googleAuthProvider } from './lib/firebase';
	import {
		collection,
		addDoc,
		onSnapshot,
		query,
		orderBy,
		deleteDoc,
		doc,
	} from 'firebase/firestore';
	import {
		onAuthStateChanged,
		signInWithPopup,
		signOut,
	} from 'firebase/auth';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';

	import MarkdownIt from 'markdown-it';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/an-old-hope.css';

	const md = new MarkdownIt({
		highlight: function (str: any, lang: any) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return hljs.highlight(str, { language: lang }).value;
				} catch (__) {}
			}

			// Try automatic language detection
			try {
				return hljs.highlightAuto(str).value;
			} catch (__) {}

			return ''; // use external default escaping
		},
	});

	let messages: any = [];
	let newMessage = '';
	let user: any = null;

	onAuthStateChanged(auth, (currentUser) => {
		user = currentUser;
		fetchMessages();
	});

	function fetchMessages() {
		const q = query(collection(db, 'messages'), orderBy('timestamp'));
		onSnapshot(q, (querySnapshot) => {
			messages = querySnapshot.docs.map((doc: any) => ({
				id: doc.id,
				...doc.data(),
			}));
		});
	}
	async function sendMessage() {
		if (newMessage.trim() !== '' && user) {
			await addDoc(collection(db, 'messages'), {
				text: newMessage,
				timestamp: Date.now(),
				uid: user.uid,
				photoURL: user.photoURL,
				displayName: user.displayName,
				email: user.email,
			});
			newMessage = '';
			fetchMessages();
		}
	}
	async function deleteMessage(messageId: any) {
		await deleteDoc(doc(db, 'messages', messageId));
		fetchMessages();
	}
	async function signInWithGoogle() {
		await signInWithPopup(auth, googleAuthProvider);
	}
	async function signOutUser() {
		await signOut(auth);
	}

	let styleStore = writable(localStorage.getItem('style') || 'dark');
	styleStore.subscribe((value) => {
		localStorage.setItem('style', value);
	});

    let form: HTMLFormElement;
</script>

<div class="theme-buttons">
	<button
		on:click={() =>
			$styleStore == 'light'
				? ($styleStore = 'dark')
				: ($styleStore = 'light')}
	>
		{$styleStore == 'light' ? 'Dark' : 'Light'} Mode
	</button>
</div>

<div class="auth-buttons">
	{#if user}
		logged in as <strong>{user.displayName}</strong>
		<button on:click={signOutUser}>Sign Out</button>
	{:else}
		<button on:click={signInWithGoogle}>Sign In with Google</button>
	{/if}
</div>

<main>
    <form on:submit|preventDefault={sendMessage} bind:this={form}>
        <textarea
            rows="2"
            bind:value={newMessage}
            placeholder={`Type a message and hit send!
you can use any markdown feature you want`}
            on:keydown={(e) => {
                if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') {
                    e.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            }}
        />
        <button type="submit">Send</button>
    </form>

	<ul>
		{#each messages as message (message.timestamp)}
			<li transition:fade={{ duration: 300, delay: 200 }}>
				<div class="message-header">
					<img src={message.photoURL} alt="User avatar" />
					<span class="name">{message.displayName}</span>
					<span class="email">{message.email}</span>
					{#if user && user.uid === message.uid}
						<button
							class="delete"
							on:click={() => deleteMessage(message.id)}
							>Delete</button
						>
					{/if}
				</div>
				<div>{@html md.render(message.text)}</div>
				<small>{new Date(message.timestamp).toLocaleString()}</small>
			</li>
		{/each}
	</ul>
</main>

{#if $styleStore == 'dark'}
	<style>
		:root {
			--background-color: #121212;
			--color: #fff;
			--main-background-color: #212121;
			--input-background-color: #333;
			--accent-color: #3f51b5;
			--list-item-background-color: #333;
			--name-color: #fff;
			--email-color: #888;
		}
	</style>
{:else}
	<style>
		:root {
			--background-color: #f5f5f5;
			--color: #333;
			--main-background-color: #fff;
			--input-background-color: #f5f5f5;
			--accent-color: #3f51b5;
			--list-item-background-color: #f5f5f5;
			--name-color: #333;
			--email-color: #888;
		}
	</style>
{/if}

<style>
	:global(pre) {
		background-color: var(--background-color);
		padding: 1em;
		border-radius: 5px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}
	:root {
		--background-color: #121212;
		--color: #fff;
		--main-background-color: #212121;
		--input-background-color: #333;
		--accent-color: #3f51b5;
		--list-item-background-color: #333;
		--name-color: #fff;
		--email-color: #888;
		scrollbar-color: var(--accent-color) var(--input-background-color);
		scrollbar-width: thin;
		scroll-behavior: smooth;
	}
	:global(body) {
		background-color: var(--background-color);
		color: var(--color);
		font-family: 'Roboto', Arial, sans-serif;
	}
	main {
		max-width: 800px;
		margin: 50px auto;
		padding: 1em;
		background-color: var(--main-background-color);
		border-radius: 8px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}
	form {
		display: flex;
		margin-bottom: 1em;
	}
	textarea {
		flex-grow: 1;
		padding: 0.5em;
		border: none;
		border-radius: 4px;
		background-color: var(--input-background-color);
		color: var(--color);
		font-family: 'Roboto', Arial, sans-serif;
		font-size: 1em;
		resize: vertical;
		scrollbar-width: thin;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
	}
	textarea:focus {
		outline: none;
		box-shadow: 0 0 0 2px var(--accent-color);
	}
	button {
		margin-left: 0.5em;
		padding: 0.5em 1em;
		color: white;
		background-color: var(--accent-color);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.26);
	}
	ul {
		list-style: none;
		padding-left: 0;
		display: flex;
		flex-direction: column-reverse;
	}
	li {
		margin-bottom: 1em;
		padding: 1em;
		background-color: var(--list-item-background-color);
		border-radius: 4px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.26);
	}
	:global(a) {
		color: var(--accent-color);
	}
	.message-header {
		display: grid;
		grid-row: 1fr 1fr;
		grid-template-columns: auto 1fr auto;
	}
	.message-header img {
		grid-area: 1 / 1 / 3 / 2;
	}
	.name {
		font-weight: bold;
		color: var(--name-color);
		grid-area: 1 / 2 / 2 / 3;
	}
	.email {
		font-size: 0.9em;
		color: var(--email-color);
		grid-area: 2 / 2 / 3 / 3;
	}
	.delete {
		background-color: #00000018;
		color: var(--color);
		border: none;
		border-radius: 4px;
		cursor: pointer;
		grid-area: 1 / 3 / 3 / 4;
		width: fit-content;
		height: fit-content;
		transition: background-color 0.1s ease;
	}
	.delete:hover {
		background-color: red;
	}
	img {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin-right: 0.5em;
	}
	.auth-buttons {
		position: absolute;
		top: 10px;
		right: 10px;
	}
</style>
