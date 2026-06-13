import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQoD4Nxi5Mc7HP8hANVIgC4O4y1PFtsIQ",
  authDomain: "ebd-fiel-16abc.firebaseapp.com",
  databaseURL: "https://ebd-fiel-16abc-default-rtdb.firebaseio.com",
  projectId: "ebd-fiel-16abc",
  storageBucket: "ebd-fiel-16abc.firebasestorage.app",
  messagingSenderId: "307289323289",
  appId: "1:307289323289:web:dbdc67cedb1d4c4ad4b788"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app);

const ADMIN_EMAIL = "ebdfiel7@gmail.com";

export { db, auth, ADMIN_EMAIL, ref, get, set, update, onValue };