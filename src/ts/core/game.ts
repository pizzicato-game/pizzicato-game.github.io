import Phaser from 'phaser';
import { LoadingScene, ElectronScene } from '../scenes/loadingScene';
import LevelScene from '../scenes/levelScene';
import MainMenu from '../scenes/mainMenuScene';
import LevelSelect from '../scenes/levelSelectScene';
import Options from '../scenes/optionsScene';
import Scoreboard from '../scenes/scoreboardScene';
import Calibration from '../scenes/calibrationScene';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { child, getDatabase, ref, set, update } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
/*
To add a new scene:
1. import MySceneClassName from "scenes/mySceneClassName";
2. Add it to the scene array inside of config (below).
3. Ensure you are calling super("MySceneClassName") in your scene's constructor. 
   Otherwise you will get the following error: "Scene not found for key: MySceneClassName"
4. (Optional) To start in your scene, set initialScene = "MySceneClassName" in config.ts.
*/

const config = {
  type: Phaser.WEBGL, // PHASER.CANVAS, PHASER.AUTO
  scale: { mode: Phaser.Scale.RESIZE },
  transparent: true,
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: { x: 0, y: 0 },
    },
  },
  scene: [
    ElectronScene,
    LoadingScene,
    MainMenu,
    Options,
    LevelSelect,
    LevelScene,
    Scoreboard,
    Calibration,
  ],
};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAHkhSVhXo1qrE3lYqXEh2ozwOgZJhk960',
  authDomain: 'pizzicato-1f765.firebaseapp.com',
  projectId: 'pizzicato-1f765',
  storageBucket: 'pizzicato-1f765.firebasestorage.app',
  messagingSenderId: '196367706867',
  appId: '1:196367706867:web:bb5cac34655842ac462586',
  databaseURL:
    'https://pizzicato-1f765-default-rtdb.europe-west1.firebasedatabase.app/',
};

// Initialize Firebase app (assuming you have firebaseConfig defined elsewhere)
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);

// Type definition for user data
interface UserData {
  name?: string;
  lastLogin: string;
}

function getValidNameEmailPassword() {
  // Get user input fields
  const name = (<HTMLInputElement>document.getElementById('name')).value;
  const password = (<HTMLInputElement>document.getElementById('password'))
    .value;
  const email = name + '@pizzicato.com';

  // Validate input fields
  if (!validateName(name)) {
    alert('Name "' + name + '" is invalid!');
    return ['', '', ''];
  }
  if (!validatePassword(password)) {
    alert('Password is invalid!');
    return ['', '', ''];
  }
  if (!validateEmail(email)) {
    alert('Failed email creation "' + email + '" is invalid!');
    alert('Failed to validate credentials!');
    return ['', '', ''];
  }
  return [name, email, password];
}

// Register function
async function register(): Promise<void> {
  const [name, email, password] = getValidNameEmailPassword();

  // Register user with Firebase Auth

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed up
      const user = userCredential.user;

      // Create user data object
      const userData: UserData = {
        name,
        lastLogin: new Date().toUTCString(),
      };
      const db = ref(database);

      set(child(db, `users/${user.uid}`), userData);

      alert('User created successfully!');
      // ...
    })
    .catch(error => {
      //const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
}

// Login function
async function login(): Promise<void> {
  const [_, email, password] = getValidNameEmailPassword();

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed up
      const user = userCredential.user;

      // Update user last login in Firebase Database
      const db = ref(database);
      const updates = { lastLogin: new Date().toUTCString() };

      update(child(db, `users/${user.uid}`), updates);

      //alert('User logged in successfully!');

      document.body.innerHTML = '';

      const _game = new Phaser.Game(config);
      // ...
    })
    .catch(error => {
      // const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
}

// Email validation function
function validateName(name: string): boolean {
  const expression = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
  return expression.test(name);
}

// Email validation function
function validateEmail(email: string): boolean {
  const expression = /^[^@]+@\w+(\.\w+)+\w$/;
  return expression.test(email);
}

// Password validation function
function validatePassword(password: string): boolean {
  return password.length >= 6; // Minimum password length of 6
}

// Field validation function
// function validateField(field: string | boolean): boolean {
//   return field != null && field.toString().length > 0;
// }

const form =
  '<div id="content_container"><div id="form_container"><div id="form_header_container"><h2 id="form_header"> Pizzicato Login </h2></div><div id="form_content_container"><div id="form_content_inner_container"><input type="text" id="name" placeholder="Name"><input type="password" id="password" placeholder="Password"><div id="button_container"><button id="login_button">Login</button><button id="register_button">Register</button></div></div></div></div></div>';

// Append the form to the document
document.body.innerHTML += form;

// Add event listeners
(<HTMLInputElement>document.getElementById('login_button')).addEventListener(
  'click',
  login,
);
(<HTMLInputElement>document.getElementById('register_button')).addEventListener(
  'click',
  register,
);
