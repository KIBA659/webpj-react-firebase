import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBQJryfPoQ3tDNgyvYv8zXxh3DJ2tIg2uk",
  authDomain: "webpj-7c61e.firebaseapp.com",
  projectId: "webpj-7c61e",
  storageBucket: "webpj-7c61e.appspot.com",
  messagingSenderId: "952547653257",
  appId: "1:952547653257:web:08582d56d8ef993616f858"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);

// Отримуємо доступ до Auth і Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const database = getDatabase(app);

export { database, ref, set, get, };
// Ініціалізація GoogleAuthProvider для входу через Google
const provider = new GoogleAuthProvider();

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, provider, db };