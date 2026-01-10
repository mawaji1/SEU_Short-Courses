import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Current User Decorator
 * 
 * Extracts the current authenticated user from the request.
 * Example: @CurrentUser() user: UserPayload
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if (data) {
            return user?.[data];
        }

        return user;
    },
);
