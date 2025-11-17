export type RequestMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiFunction<ResponseType, RequestType> = (
  req: RequestType
) => Promise<ResponseType>;

export type Include<T extends PropertyKey, K extends T> = {
  [key in T]: key;
}[K];
