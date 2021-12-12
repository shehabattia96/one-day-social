// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, onChildAdded, onChildRemoved, onChildChanged, ref, set, update, remove, Unsubscribe } from 'firebase/database';

import {getAuth, signInWithPopup,  GoogleAuthProvider, onAuthStateChanged} from 'firebase/auth'


import { PostsManager } from "./PostsManager";
import { Post, Comment, User } from "./Post"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvdZVJ0EdZUe6oBZPHORuPnWhJhDbp5GE",
  authDomain: "one-day-social.firebaseapp.com",
  projectId: "one-day-social",
  storageBucket: "one-day-social.appspot.com",
  messagingSenderId: "750450825511",
  appId: "1:750450825511:web:237573ab51e0f150e4b102"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

let databasePostsPath = 'posts/'

var postsAddedListener:Unsubscribe|null = null;
var postsChangedListener:Unsubscribe|null = null;
var postsRemovedListener:Unsubscribe|null = null;

var userAuthListener:Unsubscribe|null = null;

function subscribeToPostsAdded(callback: (post:Post)=> void) {

    if (postsAddedListener != null) {
        console.log("FirebasePosts: postsAddedListener already has a Listener! Unsubscribe first to add another listener.")
        return
    }

    const postsPath = ref(database, databasePostsPath);

    postsAddedListener = onChildAdded(postsPath,  (snapshot) => {
        const data = snapshot.val();

        callback(data);

    });

}

function subscribeToPostsChanged(callback: (post:Post)=> void) {

    if (postsChangedListener != null) {
        console.log("FirebasePosts: postsChangedListener already has a Listener! Unsubscribe first to add another listener.")
        return
    }

    const postsPath = ref(database, databasePostsPath);

    postsChangedListener = onChildChanged(postsPath,  (snapshot) => {
        const data = snapshot.val();

        callback(data);

    });

}


function subscribeToPostsRemoved(callback: (post:Post)=> void) {

    if (postsRemovedListener != null) {
        console.log("FirebasePosts: postsRemovedListener already has a Listener! Unsubscribe first to add another listener.")
        return
    }

    const postsPath = ref(database, databasePostsPath);

    postsRemovedListener = onChildRemoved(postsPath,  (snapshot) => {
        const data = snapshot.val();

        callback(data);

    });

}

function unsubscribeFromPosts() {
    if (postsAddedListener) {
        postsAddedListener();
    }
    if (postsChangedListener) {
        postsChangedListener();
    }
    if (postsRemovedListener) {
        postsRemovedListener();
    }
    postsAddedListener = null;
    postsChangedListener = null;
    postsRemovedListener = null;
}

function writePost(post:Post, callback?: (success:boolean)=> void) {
    
    const postsPath = ref(database, databasePostsPath + '/' + post.id);

    update( postsPath, post ).then( (error) => { if (callback) callback(error == null); } );
    
}

function writeComment(postId:string, comment:Comment, callback?: (success:boolean)=> void) {
    
    const commentPath = ref(database, databasePostsPath + '/' + postId + '/comments/' + comment.id);

    update( commentPath, comment ).then( (error) => { if (callback) callback(error == null); } );
    
}


function removePost(postId:string, callback?: (success:boolean)=> void) {
    
    const postsPath = ref(database, databasePostsPath + '/' + postId);

    remove( postsPath ).then( (error) => { if (callback) callback(error == null); } );
    
}

function removeComment(postId:string, commentId:string, callback?: (success:boolean)=> void) {
    
    const commentPath = ref(database, databasePostsPath + '/' + postId + '/' + commentId);

    remove( commentPath ).then( (error) => { if (callback) callback(error == null); } );
    
}

function signIn(callback: (user?:User)=> void){

    if (signInWithPopup) {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
    .then((result) => {
        return getCurrentUser(callback);
    }).catch((error) => {
        console.log("Sign in failed. ", error);
        return callback();
    });
    } else {
        console.error("Can't sign in with popup!")
    }
    
}

function listenToAuthStateChanged(callback: (user?:User)=> void) {

    if (userAuthListener != null) {
        console.log("FirebasePosts: userAuthListener already has a Listener! Unsubscribe first to add another listener.")
        return
    }

    const auth = getAuth();
    userAuthListener = onAuthStateChanged(auth, user => {

        console.log("FirebasePosts: Auth state changed: ", user)
        
        getCurrentUser(callback)

    })
}

function signOut() {

    console.log("signed out")
    const auth = getAuth();

    auth.signOut()
}

function getCurrentUser(callback: (user?:User)=> void) {

    const auth = getAuth();
    let currentUser = auth.currentUser

    if (!currentUser || !currentUser.uid) {
        return callback()
    }

    return callback({
        id: currentUser!.uid!,
        email: currentUser!.email,
        name: currentUser!.displayName
    })
}

let FirebasePostsManager : PostsManager = {
    writePost,
    removePost,
    writeComment,
    removeComment,
    subscribeToPostsAdded,
    subscribeToPostsChanged,
    subscribeToPostsRemoved,
    unsubscribeFromPosts,

    getCurrentUser,
    signIn,
    signOut,
    listenToAuthStateChanged
}

export { FirebasePostsManager }