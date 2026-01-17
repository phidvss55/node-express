import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  public street?: string;

  @IsString()
  @IsNotEmpty()
  public city!: string;

  @IsOptional()
  @IsString()
  public country?: string;
}

export default CreateAddressDto;
