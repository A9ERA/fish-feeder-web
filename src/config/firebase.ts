import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDJiOtE-qr9Y9oaVWQmG4BkKIOfIBjxsWU",
  authDomain: "fish-feeder-test-1.firebaseapp.com",
  databaseURL: "https://fish-feeder-test-1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fish-feeder-test-1",
  storageBucket: "fish-feeder-test-1.firebasestorage.app",
  messagingSenderId: "387912259730",
  appId: "1:387912259730:web:e509b3114cb833aef0ee4b",
  measurementId: "G-9D6HT899ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app; 