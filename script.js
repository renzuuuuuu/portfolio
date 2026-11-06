// Dismiss the page loader after assets finish loading, with a fallback for stalled requests.
const pageLoader = document.querySelector('.page-loader');

if (pageLoader) {
	const minimumDisplayTime = 600;
	const loaderStartedAt = performance.now();
	let hideTimer = null;

	const hidePageLoader = () => {
		if (hideTimer !== null) return;
		const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - loaderStartedAt));
		hideTimer = window.setTimeout(() => {
			pageLoader.classList.add('is-hidden');
			pageLoader.setAttribute('aria-hidden', 'true');
		}, remainingTime);
	};

	window.addEventListener('load', () => window.setTimeout(hidePageLoader, 250), { once: true });
	window.setTimeout(hidePageLoader, 5000);
}

// Set up the theme control when it is available on the page.
const themeToggle = document.querySelector('.theme-toggle');

if (themeToggle) {
	const themeIcon = themeToggle.querySelector('i');

	// Apply the selected theme to the page and synchronize the control state.
	const applyTheme = (theme) => {
		document.body.classList.toggle('light-mode', theme === 'light');
		themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
		themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');

		if (themeIcon) {
			themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
		}

		try {
			localStorage.setItem('theme', theme);
		} catch (error) {
			console.warn('Theme could not be stored:', error);
		}
	};

	// Restore the saved theme, falling back to the system preference.
	try {
		const savedTheme = localStorage.getItem('theme');
		const preferredTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
		applyTheme(savedTheme || preferredTheme);
	} catch (error) {
		console.warn('Theme could not be loaded:', error);
		applyTheme('dark');
	}

	// Switch themes when the user activates the toggle.
	themeToggle.addEventListener('click', () => {
		const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
		applyTheme(nextTheme);
	});
}

// Find the contact assistant and the link that opens it.
const chatbot = document.querySelector('.chatbot');
const chatTrigger = document.querySelector('.chat-trigger');

if (chatbot && chatTrigger) {
	const closeButton = chatbot.querySelector('.chatbot-close');
	const messages = chatbot.querySelector('.chatbot-messages');
	const form = chatbot.querySelector('.chatbot-form');
	const input = form.querySelector('input');
	const quickActions = chatbot.querySelectorAll('[data-chat-question]');

	// Keep the assistant's supported topics and answers together.
	const localReplies = [
		{ keys: ['project', 'library', 'google', 'search bar'], reply: 'The featured projects are a Planning Office Website using HTML + CSS and JS, and a X-ecute Calculator using HTML, CSS, and JavaScript also.' },
		{ keys: ['skill', 'html', 'css', 'javascript', 'php', 'mysql'], reply: 'The main skills are HTML, CSS, JavaScript, PHP, and MySQL, plus basic CRUD, sessions, networking, troubleshooting, and customer support.' },
		{ keys: ['service', 'website', 'frontend', 'front end', 'support'], reply: 'I can help with front-end websites, PHP and MySQL projects, basic CRUD and sessions, networking, troubleshooting, and customer support.' },
		{ keys: ['contact', 'email', 'reach', 'talk'], reply: 'You can contact me at babatiorenz@gmail.com. Use the email link below this chat to start a conversation.' },
		{ keys: ['available', 'hire', 'freelance', 'job'], reply: 'Send an email with your project idea, timeline, and budget so I can review the request.' }
	];

	// Add a user or assistant message and keep the latest one visible.
	function addMessage(text, type) {
		const message = document.createElement('div');
		message.className = `chat-message ${type}-message`;
		message.textContent = text;
		messages.appendChild(message);
		messages.scrollTop = messages.scrollHeight;
	}

	// Match a question against known topics and provide a fallback response.
	function getLocalReply(question) {
		const text = question.toLowerCase();
		const match = localReplies.find((item) => item.keys.some((key) => text.includes(key)));
		return match ? match.reply : 'I can answer questions about projects, skills, services, availability, or contact details.';
	}

	// Send the assistant's local response to the chat window.
	function answer(question) {
		addMessage(getLocalReply(question), 'bot');
	}

	// Reveal the chat panel and focus its input when opened.
	function openChat(event) {
		event.preventDefault();
		chatbot.classList.add('is-open');
		chatbot.setAttribute('aria-hidden', 'false');
		input.focus();
	}

	// Wire the open and close controls for the chat panel.
	chatTrigger.addEventListener('click', openChat);
	closeButton.addEventListener('click', () => {
		chatbot.classList.remove('is-open');
		chatbot.setAttribute('aria-hidden', 'true');
	});

	// Let each quick prompt send its question without typing.
	quickActions.forEach((button) => {
		button.addEventListener('click', () => {
			const question = button.dataset.chatQuestion;
			addMessage(question, 'user');
			answer(question);
		});
	});

	// Handle typed questions and clear the input after sending.
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const question = input.value.trim();
		if (!question) return;
		addMessage(question, 'user');
		answer(question);
		input.value = '';
	});
}

// Enable pointer tilt only for precise pointing devices that allow motion.
const canTilt = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;

if (canTilt) {
	// Select the phone and project nodes that respond to pointer movement.
	const tiltTargets = document.querySelectorAll('.phone, .flow-node, .skill-card');

	tiltTargets.forEach((target) => {
		// Update the target's tilt based on the pointer's position.
		target.addEventListener('pointermove', (event) => {
			const bounds = target.getBoundingClientRect();
			const x = (event.clientX - bounds.left) / bounds.width - 0.5;
			const y = (event.clientY - bounds.top) / bounds.height - 0.5;
			const rotateX = (y * -8).toFixed(2);
			const rotateY = (x * 8).toFixed(2);

			target.classList.add('is-tilting');
			target.style.setProperty('--tilt-x', `${rotateX}deg`);
			target.style.setProperty('--tilt-y', `${rotateY}deg`);
		});

		// Reset the tilt when the pointer leaves the target.
		target.addEventListener('pointerleave', () => {
			target.classList.remove('is-tilting');
			target.style.removeProperty('--tilt-x');
			target.style.removeProperty('--tilt-y');
		});
	});
}

// Let visitors flip through the skill pages without extra navigation controls.
const skillDeck = document.querySelector('.skill-deck');
const skillCards = document.querySelectorAll('.skill-card');

if (skillDeck && skillCards.length) {
	const focusSkill = (card, advance = false) => {
		const currentIndex = [...skillCards].indexOf(card);
		const nextIndex = advance ? (currentIndex + 1) % skillCards.length : currentIndex;
		skillCards.forEach((skillCard, index) => {
			skillCard.classList.toggle('is-active', index === nextIndex);
		});
	};

	skillCards.forEach((card) => {
		card.addEventListener('click', () => focusSkill(card, true));
		card.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				focusSkill(card, true);
			}
		});
	});

	focusSkill(skillCards[0]);
}
