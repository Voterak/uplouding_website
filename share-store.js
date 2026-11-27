import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
    getAuth,
    signInAnonymously
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
const database = getFirestore(app);
const auth = getAuth(app);
let anonymousSignIn;

async function ensureFirebaseSession() {
    await auth.authStateReady();

    if (auth.currentUser) {
        return;
    }

    if (!anonymousSignIn) {
        anonymousSignIn = signInAnonymously(auth).finally(() => {
            anonymousSignIn = null;
        });
    }

    await anonymousSignIn;
}

window.ShareStore = {
    async getAll() {
        return {};
    },

    async get(code) {
        await ensureFirebaseSession();
        const snapshot = await getDoc(doc(database, "sharedItems", code));
        return snapshot.exists() ? snapshot.data() : null;
    },

    async save(code, item) {
        await ensureFirebaseSession();
        await setDoc(doc(database, "sharedItems", code), item);
    },

    async remove(code) {
        await ensureFirebaseSession();
        await deleteDoc(doc(database, "sharedItems", code));
    },

    async open(code) {
        await ensureFirebaseSession();
        const reference = doc(database, "sharedItems", code);

        return runTransaction(database, async (transaction) => {
            const snapshot = await transaction.get(reference);

            if (!snapshot.exists()) {
                return null;
            }

            const item = snapshot.data();

            if (item.opensRemaining <= 0) {
                transaction.delete(reference);
                return null;
            }

            const updatedItem = {
                ...item,
                opensRemaining: item.opensRemaining - 1
            };

            transaction.update(reference, {
                opensRemaining: updatedItem.opensRemaining
            });

            return updatedItem;
        });
    }
};
