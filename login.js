import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
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

    authTitle.textContent = isRegister ? 'Create an account' : 'Log in';
    authSubmit.textContent = isRegister ? 'Register' : 'Log in';
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
    passwordToggle.textContent = visible ? 'Show' : 'Hide';
    passwordToggle.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
});

onAuthStateChanged(auth, (user) => {
    if (user && !user.isAnonymous) {
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
        authMessage.textContent = 'Enter your email address.';
        authMessage.className = 'auth-message error';
        authName.focus();
        return;
    }

    if (password.length < 6) {
        authMessage.textContent = 'Password must be at least 6 characters long.';
        authMessage.className = 'auth-message error';
        authPassword.focus();
        return;
    }

    try {
        if (mode === 'register') {
            await createUserWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Account created. Redirecting...';
        } else {
            await signInWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Successfully logged in. Redirecting...';
        }

        authMessage.className = 'auth-message success';
    } catch (error) {
        const messages = {
            'auth/email-already-in-use': 'An account already exists for this email address.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/invalid-credential': 'Invalid email or password.',
            'auth/user-not-found': 'No account was found for this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/too-many-requests': 'Too many attempts. Please try again later.'
        };

        authMessage.textContent = messages[error.code] || 'A Firebase error occurred. Please try again.';
        authMessage.className = 'auth-message error';
        return;
    }

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 700);
});
