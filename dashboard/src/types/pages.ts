export interface AuthForm {
    email: string
    password: string
    username: string
    passwordConfirm: string
}

export interface FieldErrors {
    email?: string
    password?: string
    username?: string
    passwordConfirm?: string
}
export type DrawerFilter =
    | 'all'
    | 'unique'
    | 'duplicate'
    | 'today'
    | 'week'
    | 'month'
    | 'peak-hour'
    | 'peak-day'
    | 'date'
    | 'single-file'
    | 'single-event'
    | 'category'
    | 'extension'
    | 'source'
    | 'source-others';