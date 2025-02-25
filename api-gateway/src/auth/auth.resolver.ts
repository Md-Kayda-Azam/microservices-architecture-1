import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => Object) // ✅ Object হিসেবে রিটার্ন টাইপ সেট করুন
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<{ access_token: string }> {
    return this.authService.login({ email, password });
  }
}
