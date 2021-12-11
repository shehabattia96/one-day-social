import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {Post, Comment} from "./Post"

let dummyPosts:Post[] = [
  {
    username: "Me",
    title: "My first post!",
    content: "This is my first awesome post :)",
    createdEpoch: Date.now(),

    likes: 10,
    dislikes: 0,

    comments: [
      {
        username: "K",
        content: "first!",
        createdEpoch: Date.now(),

        likes: 1,
        dislikes: 100
      }
    ]
  },

  {
    username: "K",
    title: "K's post!",
    content: "This is my awesomer post :)",
    createdEpoch: Date.now(),

    likes: 10,
    dislikes: 0,

    comments: [
      {
        username: "Me",
        content: "first!",
        createdEpoch: Date.now(),

        likes: 1,
        dislikes: 100
      }
    ]
  }
]


function createCommentUI(comment:Comment) {
  return  <div>
            <h3>{comment.username} on {(new Date(comment.createdEpoch)).toDateString() }</h3>
            <p>{comment.content}</p>

            Likes: {comment.likes}
            Dislikes: {comment.dislikes}
          </div>
}

function createPostUI(post:Post) {
  return  <div>
            <h1>{post.title}</h1>
            <h5>Created by {post.username} on {(new Date(post.createdEpoch)).toDateString() }</h5>
            <p>{post.content}</p>

            Likes: {post.likes}
            Dislikes: {post.dislikes}

            Comments:
            <div>
              {post.comments.map( (comment) => createCommentUI(comment) )}
            </div>
          </div>
}


export default function App() {
  return (
    <View style={styles.container}>
      {
        dummyPosts.map( (post) => createPostUI(post) )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    alignItems: 'baseline',
    justifyContent: 'center',
  },
});
