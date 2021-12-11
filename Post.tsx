interface Post {
    username:string;
    title:string;
    content:string;
    createdEpoch:number; // this is the date the post was created in seconds since Jan 1 1970

    likes:number;
    dislikes:number;

    comments:Comment[];
}

interface Comment {
    username:string;
    content:string;
    createdEpoch:number;

    likes:number;
    dislikes:number;
}

export {
    Post,
    Comment
}