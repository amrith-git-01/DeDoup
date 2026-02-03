export function getFileExtension(filename: string): string {
    const parts = filename.split('.')
    if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
    }
    return ''
}

export function extractDomain(url: string): string {
    try {
        const urlObject = new URL(url)
        return urlObject.hostname.toLowerCase()
    } catch (e) {
        return ''
    }
}

export function getFileCategory(extension: string, mimeType?: string): string {
    const ext = extension.toLowerCase()
    const mime = mimeType?.toLowerCase() || ''
    // Documents
    const documents = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv']
    if (documents.includes(ext) || mime.includes('document') || mime.includes('text') || mime.includes('pdf')) {
        return 'document'
    }
    // Images
    const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff']
    if (images.includes(ext) || mime.includes('image')) {
        return 'image'
    }
    // Videos
    const videos = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', 'mpeg', 'mpg']
    if (videos.includes(ext) || mime.includes('video')) {
        return 'video'
    }
    // Audio
    const audio = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus']
    if (audio.includes(ext) || mime.includes('audio')) {
        return 'audio'
    }
    // Archives
    const archives = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso']
    if (archives.includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
        return 'archive'
    }
    // Executables
    const executables = ['exe', 'msi', 'dmg', 'pkg', 'deb', 'rpm', 'apk', 'app']
    if (executables.includes(ext) || mime.includes('executable') || mime.includes('application/x-')) {
        return 'executable'
    }

    return 'other'
}