import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { FirebasePostsManager } from './FirebasePosts';

import { Post, Comment, PostActions, User, newPostUI } from "./Post"
import { PostsManager } from "./PostsManager"

const postsManager:PostsManager = FirebasePostsManager; 

function createCommentUI(postId: string, comment:Comment, currentUser:User,  doAction: (action:PostActions, data:any)=>void) {

  let { user: {name = "Anon"} = {}} = comment

  return  <div key={comment.id}>
            <h3>{name} on {(new Date(comment.createdEpoch)).toString() }</h3>
            <p>{comment.content}</p>

            {comment.user && comment.user.id == currentUser.id &&
              <button onClick={() => doAction(PostActions.REMOVE_COMMENT, comment)}> Delete </button>}
            <button onClick={() => doAction(PostActions.LIKE_COMMENT, {postId, comment})}> Likes: {Object.keys(comment.likes).filter(likes => comment.likes[likes] == true).length}</button>
            <button onClick={() => doAction(PostActions.DISLIKE_COMMENT, {postId, comment})}> Dislikes: {Object.keys(comment.likes).filter(likes => comment.likes[likes] == false).length}</button>
          </div>
}

function createPostUI(post:Post, currentUser:User, doAction: (action:PostActions, data:any)=>void) {

  let { user: {name = "Anon"} = {}} = post

  return  <div key={post.id}>
            <h1>{post.title} {post.user && post.user.id == currentUser.id &&
              <button onClick={() => doAction(PostActions.REMOVE_POST, post)}> Delete </button>}</h1>
            <h5>Created by {name} on {(new Date(post.createdEpoch)).toString() }</h5>
            <p>{post.content}</p>

            
              <div>
              <button onClick={() => doAction(PostActions.LIKE_POST, post)}> Likes: { post.likes && Object.keys(post.likes).filter(likes => post.likes![likes] == true).length || 0 }</button>
              <button onClick={() => doAction(PostActions.DISLIKE_POST, post)}> Dislikes: { post.likes && Object.keys(post.likes).filter(likes => post.likes![likes] == false).length || 0}</button>
              
              </div>
            
            
              <div>
                Comments:
                {post.comments && Object.keys(post.comments).map( (commentId) => createCommentUI(post.id, post.comments![commentId], currentUser, doAction) ) || <div> No comments yet. </div>}
              </div>
            
          </div>
}

export default function App() {

  const [posts, updatePosts] = useState<Post[]>([]);

  const [currentUser, setCurrentUser] = useState<User>();

  const [newPost, updateNewPost] = useState<Post>(
    {
      id: uuidv4(),
      title: "",
      content: "",
      createdEpoch: Date.now(),
      
      likes: {},
      comments: {}
    }
  );

  const [newComments, updateNewComments] = useState<{[postId:string]: Comment}>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  

  useEffect( () => {

    postsManager.listenToAuthStateChanged(setCurrentUser)

    postsManager.subscribeToPostsAdded((post) => {

      updatePosts( posts => [...posts, post] );
    
    })

    postsManager.subscribeToPostsChanged( post => {

      updatePosts( posts => {

        return posts.map( postInPosts => {
          if (postInPosts.id == post.id) return post;
          return postInPosts
        }); 

      } );
      
    } );

    postsManager.subscribeToPostsRemoved( post => {

      updatePosts( posts => {

        return posts.filter( postInPosts => {
          if (postInPosts.id != post.id) return postInPosts
        }); 

      } );
      
    } );

  }, [])

  function doAction(action:PostActions, data:any) {

    if (!currentUser) return console.log("Not signed in!");

    console.log("Action: ", PostActions[action])

    let post:Post = data;
    let { postId, comment } = data;

    switch (action) {
      case PostActions.CREATE_POST: break;
      case PostActions.REMOVE_POST:
        if (post.user && post.user.id ==  currentUser.id ) {
          postsManager.removePost(post.id)
        }
        break;
      case PostActions.LIKE_POST:
      case PostActions.DISLIKE_POST: 
        post.likes = {...post.likes, [currentUser!.id]: action.valueOf() == PostActions.LIKE_POST};
        postsManager.writePost(post);
        break;
      case PostActions.LIKE_COMMENT:
      case PostActions.DISLIKE_COMMENT: 
        comment.likes = {...comment.likes, [currentUser!.id]: action.valueOf() == PostActions.LIKE_COMMENT};
        postsManager.writeComment(postId, comment)
        break;
      case PostActions.REMOVE_COMMENT:
        if (comment.user && comment.user.id ==  currentUser.id ) {
          postsManager.removeComment(postId, comment)
        }
        break;
      case PostActions.CREATE_COMMENT:
      break;
    }

  }

  if (currentUser) {

    let postsByUserInLast24Hours = posts.filter(post => (post.createdEpoch > (Date.now() - 60 * 60 * 24 * 1000) )  && post.user?.id == currentUser.id)

      return (
        <View style={styles.container}>
          <div>
            <button onClick={()=>postsManager.signOut()}>Sign Out</button>
          </div>
          {
            posts.map( (post) => createPostUI(post, currentUser, doAction) )
          }
          <div>

          
          {postsByUserInLast24Hours.length === 0  && newPostUI( postsManager, currentUser, isSubmitting, setIsSubmitting, newPost, updateNewPost ) || <p>You've already posted today! Try again at {new Date( postsByUserInLast24Hours[0].createdEpoch + 60 * 60 * 24 * 1000 ).toString()} </p>}
          </div>
        </View>
      );

  } else {
    return (
      <View style={styles.container}>
        <button onClick={()=>postsManager.signIn(setCurrentUser)}>Sign in</button>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostForm: {
    
  }
});
