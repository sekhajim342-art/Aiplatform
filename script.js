const state = {
    currentSection: 'production',
    isLoading: false,
    theme: 'dark',
    sidebarOpen: true,
    lastFocus: null
};

function sanitizeText(value) {
    return String(value || '').replace(/[<>]/g, '').trim();
}

function logLine(message) {
    const terminal = document.getElementById('terminalLogs');
    if (!terminal) return;
    const time = new Date().toLocaleTimeString();
    terminal.textContent += `
[${time}] ${message}`;
    terminal.scrollTop = terminal.scrollHeight;
}

function showSection(sectionName) {
    try {
        const productionSection = document.getElementById('production-section');
        const btnProduction = document.getElementById('btnProduction');
        const btnAdmin = document.getElementById('btnAdmin');

        if (!productionSection) return;

        state.currentSection = sectionName;
        const isProduction = sectionName === 'production';

        productionSection.hidden = !isProduction;
        productionSection.classList.toggle('active', isProduction);

        btnProduction?.classList.toggle('active', isProduction);
        btnProduction?.setAttribute('aria-pressed', String(isProduction));

        btnAdmin?.setAttribute('aria-expanded', 'false');

        if (isProduction) {
            productionSection.hidden = false;
        }

        logLine(`Section switched to ${sectionName}`);
    } catch (error) {
        console.error(error);
        logLine('Error switching sections.');
    }
}

function openAdminPanel() {
    try {
        const dialog = document.getElementById('adminDialog');
        const btnAdmin = document.getElementById('btnAdmin');
        if (!dialog) return;

        state.lastFocus = document.activeElement;
        btnAdmin?.setAttribute('aria-expanded', 'true');

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }

        const firstInput = dialog.querySelector('input, select, button');
        firstInput?.focus();
        logLine('Admin panel opened.');
    } catch (error) {
        console.error(error);
        logLine('Failed to open admin panel.');
    }
}

function closeAdminPanel() {
    try {
        const dialog = document.getElementById('adminDialog');
        const btnAdmin = document.getElementById('btnAdmin');
        if (!dialog) return;

        dialog.close();
        btnAdmin?.setAttribute('aria-expanded', 'false');
        state.lastFocus?.focus?.();
        logLine('Admin panel closed.');
    } catch (error) {
        console.error(error);
        logLine('Failed to close admin panel.');
    }
}

function toggleTheme() {
    try {
        const root = document.documentElement;
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', state.theme);
        root.style.colorScheme = state.theme;
        logLine(`Theme changed to ${state.theme}`);
    } catch (error) {
        console.error(error);
        logLine('Theme toggle failed.');
    }
}

function toggleSidebar() {
    try {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        state.sidebarOpen = !state.sidebarOpen;
        sidebar.classList.toggle('collapsed', !state.sidebarOpen);
        const btn = document.querySelector('.mobile-menu-toggle');
        if (btn) btn.setAttribute('aria-expanded', String(state.sidebarOpen));
    } catch (error) {
        console.error(error);
    }
}

async function handleSubmit(event) {
    event.preventDefault();
    if (state.isLoading) return;

    const topicInput = document.getElementById('topicInput');
    const platformSelect = document.getElementById('platformSelect');
    const launchBtn = document.getElementById('launchBtn');
    const agentGrid = document.getElementById('agentGrid');

    const topic = sanitizeText(topicInput?.value);
    const platform = sanitizeText(platformSelect?.value);

    if (!topic || !platform) {
        logLine('Validation failed: topic and platform are required.');
        return;
    }

    try {
        state.isLoading = true;
        if (launchBtn) {
            launchBtn.disabled = true;
            launchBtn.textContent = 'RUNNING...';
        }

        logLine(`Starting production for "${topic}" on ${platform}`);

        if (agentGrid) {
            agentGrid.innerHTML = `
                <div class="agent-card loading-card">
                    <h3>AgentMonitor</h3>
                    <p>Initializing workflow...</p>
                </div>
            `;
        }

        await new Promise(resolve => setTimeout(resolve, 1200));

        if (agentGrid) {
            agentGrid.innerHTML = `
                <div class="agent-card">
                    <h3>Topic Research</h3>
                    <p>Ready</p>
                </div>
                <div class="agent-card">
                    <h3>Script Writer</h3>
                    <p>Ready</p>
                </div>
                <div class="agent-card">
                    <h3>SEO Agent</h3>
                    <p>Ready</p>
                </div>
            `;
        }

        logLine('Production pipeline initialized successfully.');
    } catch (error) {
        console.error(error);
        logLine('Production failed. Please retry.');
    } finally {
        state.isLoading = false;
        if (launchBtn) {
            launchBtn.disabled = false;
            launchBtn.textContent = 'RUN ALL AGENTS';
        }
    }
}

function startProduction() {
    const form = document.getElementById('productionForm');
    if (form) form.requestSubmit();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const dialog = document.getElementById('adminDialog');
        if (dialog?.open) closeAdminPanel();
    }
});

document.getElementById('adminDialog')?.addEventListener('click', (e) => {
    const dialog = e.currentTarget;
    const rect = dialog.getBoundingClientRect();
    const clickedOutside = (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
    );
    if (clickedOutside) closeAdminPanel();
});

document.addEventListener('DOMContentLoaded', () => {
    showSection('production');
});
