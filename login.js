import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

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

const authForm = document.getElementById('authForm');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const authTitle = document.getElementById('authTitle');
const authName = document.getElementById('authName');
const authPassword = document.getElementById('authPassword');
const authSubmit = document.getElementById('authSubmit');
const authMessage = document.getElementById('authMessage');
const passwordToggle = document.getElementById('passwordToggle');

let mode = 'login';

function setMode(nextMode) {
    mode = nextMode;
    const isRegister = mode === 'register';

    loginTab.classList.toggle('active', !isRegister);
    registerTab.classList.toggle('active', isRegister);
    loginTab.setAttribute('aria-selected', String(!isRegister));
    registerTab.setAttribute('aria-selected', String(isRegister));

    authTitle.textContent = isRegister ? 'Utwórz konto' : 'Zaloguj się';
    authSubmit.textContent = isRegister ? 'Zarejestruj się' : 'Zaloguj się';
    authPassword.autocomplete = isRegister ? 'new-password' : 'current-password';
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
    authForm.reset();
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

passwordToggle.addEventListener('click', () => {
    const visible = authPassword.type === 'text';
    authPassword.type = visible ? 'password' : 'text';
    passwordToggle.textContent = visible ? 'Pokaż' : 'Ukryj';
    passwordToggle.setAttribute('aria-label', visible ? 'Pokaż hasło' : 'Ukryj hasło');
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        localStorage.setItem('currentUser', user.uid);
    } else {
        localStorage.removeItem('currentUser');
    }
});

authForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = authName.value.trim();
    const password = authPassword.value;

    if (!email) {
        authMessage.textContent = 'Wpisz adres e-mail.';
        authMessage.className = 'auth-message error';
        authName.focus();
        return;
    }

    if (password.length < 6) {
        authMessage.textContent = 'Hasło musi mieć co najmniej 6 znaków.';
        authMessage.className = 'auth-message error';
        authPassword.focus();
        return;
    }

    try {
        if (mode === 'register') {
            await createUserWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Konto zostało utworzone. Przekierowuję...';
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Zalogowano pomyślnie. Przekierowuję...';
        }

        authMessage.className = 'auth-message success';
    } catch (error) {
        const messages = {
            'auth/email-already-in-use': 'Ten adres e-mail ma już konto.',
            'auth/invalid-email': 'Nieprawidłowy adres e-mail.',
            'auth/invalid-credential': 'Nieprawidłowy e-mail lub hasło.',
            'auth/user-not-found': 'Nie znaleziono konta dla tego e-maila.',
            'auth/wrong-password': 'Nieprawidłowe hasło.',
            'auth/too-many-requests': 'Zbyt wiele prób. Spróbuj później.'
        };

        authMessage.textContent = messages[error.code] || 'Wystąpił błąd Firebase. Spróbuj ponownie.';
        authMessage.className = 'auth-message error';
        return;
    }

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 700);
});
