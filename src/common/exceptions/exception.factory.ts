type ExceptionParams<
  T extends string,
  U extends string = never,
> = T extends `${infer _}{{${infer K}}}${infer Rest}`
  ? ExceptionParams<Rest, U | K>
  : {
      [key in U]: string | number;
    };

export abstract class BaseException<
  StatusCode extends number,
  Message extends string,
  Code extends string,
> extends Error {
  constructor(
    public statusCode: StatusCode,
    public override message: Message,
    public code: Code,
  ) {
    super(message);
  }
}

export const createException = () => {
  return <T extends number, K extends string, U extends string>(
    statusCode: T,
    defaultMessage: K,
    code: U,
  ) => {
    return class extends BaseException<T, K, U> {
      constructor(arg?: ExceptionParams<K>) {
        super(statusCode, defaultMessage, code);

        if (arg) {
          this.message = composeExceptionMessage(defaultMessage, arg) as K;
        }
      }
    };
  };
};

const composeExceptionMessage = <T extends string>(
  message: T,
  options: Record<string, string | number> = {},
) => {
  return message.replace(
    /{{([a-zA-Z0-9_-]+)}}/g,
    (_: string, matched: string) => {
      return String(options[matched] ?? '');
    },
  );
};
