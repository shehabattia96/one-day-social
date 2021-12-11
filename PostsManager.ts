import {Post, Comment, User} from "./Post"

interface PostsManager {
    writePost:(post:Post, callback?: (success:boolean)=> void) => void
    removePost:(postId:string, callback?: (success:boolean)=> void) => void
    writeComment:(postId:string, comment:Comment, callback?: (success:boolean)=> void) => void
    removeComment:(postId:string, commentId:string, callback?: (success:boolean)=> void) => void
    subscribeToPostsAdded:(callback: (post:Post)=> void) => void
    subscribeToPostsChanged:(callback: (post:Post)=> void) => void
    subscribeToPostsRemoved:(callback: (post:Post)=> void) => void
    unsubscribeFromPosts:()=>void;

    getCurrentUser:(callback: (user?:User)=> void) => void
    signIn:(callback: (user?:User)=> void) => void
    signOut:()=>void
    listenToAuthStateChanged: (callback: (user?:User)=> void) => void
};

export { PostsManager }