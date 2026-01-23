export interface User {
    id: string,
    email: string,
    username?: string
}

export interface AuthToken{
    accessToken: string
}

export interface ExtensionStats{
    storageSaved : number,
    duplicatesBlocked : number,
    filesTracked: number
}

export interface BlockedFile{
    filename: string,
    url: string,
    timestamp: Date,
    originalPath: string
}