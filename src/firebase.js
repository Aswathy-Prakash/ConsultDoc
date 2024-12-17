import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';


const firebaseConfig = {
  apiKey: "AIzaSyBb2Vd81DI_pEct_ti4ScyIBfTsMBltYPY",
  authDomain: "bvote-8bc77.firebaseapp.com",
  projectId: "bvote-8bc77",
  storageBucket: "bvote-8bc77.appspot.com",
  messagingSenderId: "315184965862",
  appId: "1:315184965862:web:b795748880bd2ef365f327",
  measurementId: "G-JYSMDDT0Z5"
};
 
  
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage(app);
const storageRef = storage.ref();

export default firebase;