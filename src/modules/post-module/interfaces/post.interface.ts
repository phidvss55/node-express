import { ObjectId } from 'mongoose';

interface Post {
  _id?: ObjectId;
  authorId: string;
  content: string;
  title: string;
}

export default Post;
