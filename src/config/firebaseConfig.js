import firebase from "firebase";
require("@firebase/firestore");

// changed the config

var firebaseConfig = {
  apiKey: "AIzaSyD0CNGjBgtRYsQmmtzoXt0v97sI6e3WMT8",
  authDomain: "library-app-9764a.firebaseapp.com",
  databaseURL: "https://library-app-9764a-default-rtdb.firebaseio.com",
  projectId: "library-app-9764a",
  storageBucket: "library-app-9764a.appspot.com",
  messagingSenderId: "812576110898",
  appId: "1:812576110898:web:0fc74c2fc8032b030cbf2b",
};

firebase.initializeApp(firebaseConfig);
export default firebase.firestore();
