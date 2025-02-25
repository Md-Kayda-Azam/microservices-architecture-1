import { CreateDeviceInput } from './create-device.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDeviceInput extends PartialType(CreateDeviceInput) {
  @Field(() => Int)
  id: number;
}
