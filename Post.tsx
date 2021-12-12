import React from 'react';
import uuid from 'react-native-uuid';
import {PostsManager} from "./PostsManager"

interface Post {
    id:string;

    user?:User;
    title:string;
    content:string;
    createdEpoch:number; // this is the date the post was created in seconds since Jan 1 1970

    likes:{[username:string]:boolean} // true means they like, false means they dislike

    comments:{ [id:string] : Comment};
}

interface Comment {
    id:string;

    user:User;
    content:string;
    createdEpoch:number;

    likes:{[username:string]:boolean}
}

interface User {
    id:string;

    email?:string|null;
    name?:string|null;
}

enum PostActions {
    CREATE_POST,
    REMOVE_POST,
    LIKE_POST,
    DISLIKE_POST,
    LIKE_COMMENT,
    DISLIKE_COMMENT,
    REMOVE_COMMENT,
    CREATE_COMMENT
}

function newPostUI(postsManager:PostsManager, currentUser:User, isSubmitting:boolean, setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>, newPost:Post, updateNewPost: React.Dispatch<React.SetStateAction<Post>>) {

    function isPostValid(post:Post) {
  
      if (!post.user || post.user.id === "") {
        return false
      }
  
      if (post.content.length === 0) {
        return false
      }
  
      if (post.title.length === 0) {
        return false
      }
  
      return true
  
    }
  
  
    function onSubmit() {
  
      if (isSubmitting) {
        return console.log("Already submitting post!");
      }
  
      setIsSubmitting(true);
  
  
      let postToSubmit = {...newPost, 
        user: currentUser,
        createdEpoch: Date.now()
      };
  
      if (isPostValid(postToSubmit)) {
  
        postsManager.writePost(postToSubmit, success => {
          if (success) {
            updateNewPost({
              id: uuid.v4().toString(),
              title: "",
              content: "",
              createdEpoch: Date.now(),
              comments: {},
              likes: {}
            })
          } else {
            console.error("Couldn't write post!", postToSubmit)
          }
          setIsSubmitting(false);
        });
  
      } else {
  
        console.error("Couldn't write post! Post is not valid.", postToSubmit)
        setIsSubmitting(false);
  
      }
  
    }
  
    return (
      <div style={{margin: 0, marginTop: 10}}>
        <input style={{display: "block"}} placeholder="Title" disabled={isSubmitting}
        onChange={ (e) => { updateNewPost( post => { 
          let { target: {value = ""} = {}} = e;
          return {...post, title: value} } ) } } 
          value={newPost.title}
          ></input>
  
        <textarea style={{display: "block"}} placeholder="My Post!" disabled={isSubmitting}
        onChange={ (e) => { updateNewPost( post => { 
          let { target: {value = ""} = {}} = e;
          return {...post, content: value} } ) } }
        value={newPost.content}
          ></textarea>
        <button style={{display: "block"}} disabled={isSubmitting} onClick={onSubmit}>Submit</button>
      </div>
    )
  }

export {
    Post,
    Comment,
    User,
    PostActions,
    newPostUI
}