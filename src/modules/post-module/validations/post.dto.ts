import { IsString } from 'class-validator';

class PostDto {
  @IsString()
  public content!: string;

  @IsString()
  public title!: string;
}

export default PostDto;
