import PostModel from '../entities/post.entity';
import Post from '../interfaces/post.interface';

class PostService {
  async createPost(postData: Post, authorId: any) {
    const createdPost = new PostModel({
      ...postData,
      author: authorId,
    });
    await createdPost.save();
    await createdPost.populate('author', '-password');
    return createdPost;
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      const posts: Post[] = await PostModel.find().populate('author', '-password').exec();

      return posts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async getPostById(id: any): Promise<Post | null> {
    try {
      const post = await PostModel.findById(id).exec();
      return post;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async findByCondition(condition: any): Promise<Post[] | null> {
    try {
      return await PostModel.find(condition).exec();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async updatePostById(id: any, postData: Post): Promise<Post | null> {
    try {
      const post = await PostModel.findByIdAndUpdate(id, postData, { new: true });
      return post;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async removePostById(id: any): Promise<any> {
    try {
      const post = await PostModel.findByIdAndDelete(id);
      console.log('post', post);

      return post;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }
}

export default PostService;
