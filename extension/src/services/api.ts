import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
})

// ============================================
// Axios Interceptor - Auto-add Auth Token
// ============================================

api.interceptors.request.use(
    async (config) => {
        // Get token from chrome.storage.sync
        const token = await new Promise<string | null>(resolve => {
            chrome.storage.sync.get("authToken", (result) => {
                resolve(typeof result.authToken === "string" ? result.authToken : null)
            })
        })

        // Add token to headers if available
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// ============================================
// API Methods (token auto-included)
// ============================================

// Track a download (with duplicate detection)
export async function trackDownload(data: {
    filename: string
    url: string
    hash: string
    size: number
    fileExtension?: string
    mimeType?: string
    sourceDomain?: string
    fileCategory?: string
    duration?: number
}) {
    return api.post('/downloads/track', data)
}

// Get download statistics
export async function getDownloadStats() {
    return api.get('/downloads/stats')
}



// Get duplicate downloads
export async function getDuplicateDownloads(limit = 20) {
    return api.get(`/downloads/duplicates?limit=${limit}`)
}