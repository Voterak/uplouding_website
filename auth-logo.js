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
const logo = document.getElementById('elo');

if (logo) {
    const statuses = ['online', 'away', 'offline'];

    function applyStatus(status) {
        logo.classList.remove('status-online', 'status-away', 'status-offline');
        logo.classList.add(`status-${status}`);
        logo.dataset.status = status;

        const names = {
            online: 'Status: dostępny',
            away: 'Status: zajęty',
            offline: 'Status: offline'
        };

        logo.title = names[status];
        logo.setAttribute('aria-label', names[status]);
        localStorage.setItem('logoStatus', status);
    }

    logo.addEventListener('click', () => {
        const isLoggedIn = Boolean(localStorage.getItem('currentUser'));

        if (!isLoggedIn) {
            window.location.href = 'login.html';
            return;
        }

        const current = logo.dataset.status || 'online';
        const next = statuses[(statuses.indexOf(current) + 1) % statuses.length];
        applyStatus(next);
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            localStorage.setItem('currentUser', user.uid);
            const initial = (user.email || 'U').trim().charAt(0).toUpperCase();
            logo.textContent = initial;
            logo.classList.add('has-user-status');
            applyStatus(localStorage.getItem('logoStatus') || 'online');
        } else {
            localStorage.removeItem('currentUser');
            logo.textContent = 'LS';
            logo.classList.remove('has-user-status', 'status-online', 'status-away', 'status-offline');
            logo.title = 'Zaloguj się';
            logo.setAttribute('aria-label', 'Zaloguj się');
        }
    });
}
