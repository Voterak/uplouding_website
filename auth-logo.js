import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCg5kdHueVqHPqa0JNdImjLCgm_K98BFOs",
    authDomain: "apr-18c3e.firebaseapp.com",
    projectId: "apr-18c3e",
    storageBucket: "apr-18c3e.firebasestorage.app",
    messagingSenderId: "56355366418",
    appId: "1:56355366418:web:43c2cb5caec79d13909acb",
    measurementId: "G-P043XM458N"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const accountAvatar = document.getElementById('account-avatar');
const menuDetails = document.querySelector('.menu');
const menuPanel = document.querySelector('.menu-panel');
const desktopLayout = window.matchMedia('(min-width: 700px)');

const statuses = ['online', 'away', 'offline'];

function applyStatus(status) {
    accountAvatar.classList.remove('status-online', 'status-away', 'status-offline');
    accountAvatar.classList.add(`status-${status}`);
    accountAvatar.dataset.status = status;

    const names = {
        online: 'Status: online',
        away: 'Status: away',
        offline: 'Status: offline'
    };

    accountAvatar.title = names[status];
    accountAvatar.setAttribute('aria-label', names[status]);
    localStorage.setItem('logoStatus', status);
}

if (accountAvatar) {
    accountAvatar.addEventListener('click', () => {
        const isLoggedIn = Boolean(localStorage.getItem('currentUser'));

        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }

        const current = accountAvatar.dataset.status || 'online';
        const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
        applyStatus(next);
    });
}

function updateMenu(isLoggedIn) {
    if (!menuPanel) {
        return;
    }

    const page = window.location.pathname.split('/').pop();
    const legacyRoutes = page === 'kod.html' || page === 'outkod.html';
    const links = [
        { href: legacyRoutes ? 'kod.html' : 'upload.html', label: 'Upload' },
        { href: legacyRoutes ? 'outkod.html' : 'download.html', label: 'Download' }
    ];

    if (isLoggedIn) {
        links.push(
            { href: 'inter.html', label: 'My files' },
            { href: 'q&a.html', label: 'Q&A' }
        );
    }

    menuPanel.replaceChildren(...links.map(({ href, label }) => {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        return link;
    }));
}

function updateMenuLayout() {
    if (menuDetails) {
        menuDetails.open = desktopLayout.matches;
    }
}

updateMenuLayout();
desktopLayout.addEventListener('change', updateMenuLayout);
updateMenu(false);

onAuthStateChanged(auth, (user) => {
    const isLoggedIn = Boolean(user && !user.isAnonymous);
    updateMenu(isLoggedIn);

    if (isLoggedIn) {
        localStorage.setItem('currentUser', user.uid);
        if (accountAvatar) {
            const initial = (user.email || 'U').trim().charAt(0).toUpperCase();
            accountAvatar.textContent = initial;
            accountAvatar.classList.add('has-user-status');
            applyStatus(localStorage.getItem('logoStatus') || 'online');
        }
    } else {
        localStorage.removeItem('currentUser');
        if (accountAvatar) {
            accountAvatar.textContent = 'LS';
            accountAvatar.classList.remove('has-user-status', 'status-online', 'status-away', 'status-offline');
            accountAvatar.title = 'Log in';
            accountAvatar.setAttribute('aria-label', 'Log in');
        }
    }
});
