// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'AIzaSyDhhBkCFMBfHkSJxP079zyc9jtKYWXV2KM',
	authDomain: 'global-chat-9eed.firebaseapp.com',
	databaseURL:
		'https://global-chat-9eed-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'global-chat-9eed',
	storageBucket: 'global-chat-9eed.appspot.com',
	messagingSenderId: '7641601800',
	appId: '1:7641601800:web:6214a05d8b138130dc7ebd',
	measurementId: 'G-P120WSQ8HZ',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleAuthProvider = new GoogleAuthProvider();

export { app, auth, db, googleAuthProvider };
