import { Exception } from "./exception"

const exceptions = {
  E_MISSING_APP_KEY: { message: "Invalid App Secret", status: 500, code: "E_INVALID_APP_KEY" },
  E_INSECURE_APP_KEY: { message: "Insecure App Secret", status: 500, code: "E_INSECURE_APP_KEY" }
}
export class AppKeyException extends Exception {
  public static missingAppKey(): AppKeyException {
    const details = exceptions['E_MISSING_APP_KEY']
    const error = new this(details.message, details)
    return error
  }

  public static insecureAppKey(): AppKeyException {
    const details = exceptions['E_INSECURE_APP_KEY']
    const error = new this(details.message, details)
    return error
  }
}