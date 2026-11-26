import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const accountAvatar = document.getElementById('account-avatar');

if (accountAvatar) {
    const statuses = ['online', 'away', 'offline'];

    function applyStatus(status) {
        accountAvatar.classList.remove('status-online', 'status-away', 'status-offline');
        accountAvatar.classList.add(`status-${status}`);
        accountAvatar.dataset.status = status;

        const names = {
            online: 'Status: dostępny',
            away: 'Status: zajęty',
            offline: 'Status: offline'
        };

        accountAvatar.title = names[status];
        accountAvatar.setAttribute('aria-label', names[status]);
        localStorage.setItem('logoStatus', status);
    }

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

    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem('currentUser', user.uid);
            const initial = (user.email || 'U').trim().charAt(0).toUpperCase();
            accountAvatar.textContent = initial;
            accountAvatar.classList.add('has-user-status');
            applyStatus(localStorage.getItem('logoStatus') || 'online');
        } else {
            localStorage.removeItem('currentUser');
            accountAvatar.textContent = 'LS';
            accountAvatar.classList.remove('has-user-status', 'status-online', 'status-away', 'status-offline');
            accountAvatar.title = 'Zaloguj się';
            accountAvatar.setAttribute('aria-label', 'Zaloguj się');
        }
    });
}
