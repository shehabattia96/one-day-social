import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, FlatList, Modal } from 'react-native';
import uuid from 'react-native-uuid';
import { FirebasePostsManager } from './FirebasePosts';

import { Post, Comment, PostActions, User, newPostUI, newCommentUI } from "./Post"
import { PostsManager } from "./PostsManager"

const postsManager:PostsManager = FirebasePostsManager; 

function createCommentUI(postId: string, comment:Comment, currentUser:User,  doAction: (action:PostActions, data:any)=>void) {

  let { user: {name = "Anon"} = {}} = comment

  return  <View key={comment.id}>
            <Text>{name} on {(new Date(comment.createdEpoch)).toString() }</Text>
            <Text>{comment.content}</Text>

            <View style={styles.fixToText}>
            {comment.user && comment.user.id == currentUser.id &&
              <Button color="red" onPress={() => doAction(PostActions.REMOVE_COMMENT, {postId, comment})} title="Delete" />}
            <Button onPress={() => doAction(PostActions.LIKE_COMMENT, {postId, comment})} title={`Like: ${Object.keys(comment.likes || {}).filter(likes => comment.likes[likes] == true).length}` } />
            <Button onPress={() => doAction(PostActions.DISLIKE_COMMENT, {postId, comment})} title={`Dislike: ${Object.keys(comment.likes || {}).filter(likes => comment.likes[likes] == false).length} `} />
            </View>
          </View>
}

function createPostUI(post:Post, currentUser:User, showNewCommentModal: (postId:string)=>void, doAction: (action:PostActions, data:any)=>void) {

  let { user: {name = "Anon"} = {}} = post

  return  <View key={post.id}>
            <Text style={styles.titleText}>{post.title} </Text>
            
            <View style={styles.fixToText}>
            
            
            {post.user && post.user.id == currentUser.id &&
              <Button color="red" onPress={() => doAction(PostActions.REMOVE_POST, post)} title="Delete" />}

            </View>
            
            <Text>Created by {name} on {(new Date(post.createdEpoch)).toString() }</Text>

            <Text>{post.content}</Text>

            <View style={styles.fixToText}>
              <Button onPress={() => doAction(PostActions.LIKE_POST, post)} title={`Like: ${Object.keys(post.likes || {} ).filter(likes => post.likes[likes] == true).length}` } />
              <Button onPress={() => doAction(PostActions.DISLIKE_POST, post)} title={`Dislike: ${Object.keys(post.likes || {}).filter(likes => post.likes[likes] == false).length}` } />
              
              </View>
            
            
              <View>
                  <Text style={styles.subtitleText}>Comments:</Text>
                {post.comments && 
                  <FlatList
                    data={Object.keys(post.comments)}
                    renderItem={(item) => createCommentUI(post.id, post.comments![item.item], currentUser, doAction) }
                  />
                  || <Text> No comments yet. </Text>
                  }
                  
                <View style={styles.fixToText}>
                  <Button title="Add comment" onPress={()=>showNewCommentModal(post.id)} />
                </View>
              </View>
            
          </View>
}

export default function App() {

  const [posts, updatePosts] = useState<Post[]>([]);

  const [currentUser, setCurrentUser] = useState<User>();

  const [newPost, updateNewPost] = useState<Post>(
    {
      id: uuid.v4().toString(),
      title: "",
      content: "",
      createdEpoch: Date.now(),
      
      likes: {},
      comments: {}
    }
  );

  const [newComment, updateNewComment] = useState<Comment>(
    {
      id: uuid.v4().toString(),
      content: "",
      createdEpoch: Date.now(),
      likes:{}
    }
  );

  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false)

  

  useEffect( () => {

    postsManager.listenToAuthStateChanged(setCurrentUser)

    if (currentUser) {

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
  } else {
    postsManager.unsubscribeFromPosts();
    updatePosts([])
  }

  }, [currentUser])


  const [newCommentModalVisible, setNewCommentModalVisible] = useState<boolean>(false);

  function showNewCommentModal(postId:string) {
    setNewCommentModalVisible(true);

    updateNewComment(comment => {return {...comment, postId}})

  }

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

          <FlatList
            data={posts}
            renderItem={(item) => createPostUI(item.item, currentUser, showNewCommentModal,  doAction)}
          />
          
          <View>
            {postsByUserInLast24Hours.length === 0  && newPostUI( postsManager, currentUser, isSubmittingPost, setIsSubmittingComment, newPost, updateNewPost ) || <Text>You've already posted today! Try again at {new Date( postsByUserInLast24Hours[0].createdEpoch + 60 * 60 * 24 * 1000 ).toString()} </Text>}
          </View>
          
          <View>
            <Button onPress={()=>postsManager.signOut()} title="Sign Out" />
          </View>

          <Modal visible={newCommentModalVisible}>{newCommentUI(postsManager, currentUser!, isSubmittingComment, setIsSubmittingComment, newComment, updateNewComment, setNewCommentModalVisible)}<Button title="Cancel" onPress={()=>setNewCommentModalVisible(false)}/></Modal>


        </View>
      );

  } else {
    return (
      <View style={styles.container}>
        <Button onPress={()=>postsManager.signIn(setCurrentUser)} title="Sign In" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    justifyContent: 'center',
  },
  
  titleText: {
    fontSize: 40,
    fontWeight: "bold"
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: "bold"
  },  
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
