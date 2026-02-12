/// <reference types="chrome"/>

import { trackDownload } from "../services/api"
import { calculateSha256 } from "../utils/hash"
import { getFileExtension, extractDomain, getFileCategory } from "../utils/fileUtils"

// =============================================================================
// SIDE PANEL - Auto-open on icon click
// =============================================================================

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
            console.error('Failed to open side panel:', err)
        })
    }
})

// =============================================================================
// AUTH MESSAGE LISTENER - Receive auth from dashboard
// =============================================================================

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
    console.log('Received external message:', message)

    if (message.type === 'AUTH_SUCCESS' && message.payload) {
        const { user, token } = message.payload

        // Save auth data to chrome.storage.sync
        chrome.storage.sync.set(
            {
                authToken: token,
                user: user,
                isAuthenticated: true
            },
            () => {
                console.log('✅ Auth data saved to storage')
                sendResponse({ success: true, message: 'Auth data received' })
            }
        )

        // Return true to indicate async response
        return true
    }

    sendResponse({ success: false, message: 'Unknown message type' })
    return true
})

// =============================================================================
// DOWNLOAD TRACKING
// =============================================================================

const processedDownloads = new Set<number>()
// Helper for notifications
function notify(title: string, message: string) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title,
        message,
        priority: 2
    })
}
chrome.downloads.onChanged.addListener((delta) => {
    // Only process when download completes
    if (delta.state?.current !== 'complete') return
    const downloadId = delta.id
    if (processedDownloads.has(downloadId)) return
    processedDownloads.add(downloadId)
    // Get download info
    chrome.downloads.search({ id: downloadId }, async (results) => {
        if (!results || results.length === 0) return
        const item = results[0]
        if (!item.filename || !item.url) return

        // >>> CALCULATE DURATION IMMEDIATELY (before any processing) <<<
        let duration = 0
        if (item.startTime && item.endTime) {
            const start = new Date(item.startTime).getTime()
            const end = new Date(item.endTime).getTime()
            duration = Math.abs((end - start) / 1000) // Duration in seconds
        }

        try {
            // Check if user is logged in
            const hasToken = await new Promise<boolean>(resolve => {
                chrome.storage.sync.get("authToken", (result) => {
                    resolve(!!result.authToken)
                })
            })
            if (!hasToken) {
                console.log('⚠️ No auth token, skipping tracking')
                return
            }
            // Read the downloaded file
            const fileUrl = `file://${item.filename}`
            const response = await fetch(fileUrl)
            const buffer = await response.arrayBuffer()
            // Calculate hash
            const hash = await calculateSha256(buffer)
            const filename = item.filename.split(/[/\\]/).pop() || 'unknown'
            const fileExtension = getFileExtension(filename)
            const mimeType = item.mime || undefined
            const sourceDomain = extractDomain(item.url)
            const fileCategory = getFileCategory(fileExtension, mimeType)

            console.log('📥 Tracking download:', filename, `Duration: ${duration}s`)
            // Track download on backend
            const result = await trackDownload({
                filename,
                url: item.url,
                hash,
                size: buffer.byteLength,
                fileExtension,
                mimeType,
                sourceDomain,
                fileCategory,
                duration: Math.round(duration * 100) / 100 // Send duration (rounded)
            })
            // Notify user if duplicate
            if (result.data?.data?.isDuplicate) {
                const existing = result.data.data.existingFile
                const downloadedDate = new Date(existing.downloadedAt).toLocaleDateString()
                notify(
                    "⚠️ Duplicate Download Detected",
                    `You already downloaded "${existing.filename}" on ${downloadedDate}`
                )
                console.log('⚠️ Duplicate detected:', filename)
            } else {
                console.log('✅ New download tracked:', filename)
                notify(
                    "✅ Download Tracked",
                    `${filename} has been tracked successfully`
                )
            }
        } catch (error: any) {
            console.error('❌ Failed to track download:', error)
            if (error.response?.status === 401) {
                console.error('Authentication failed - user needs to login')
            }
        } finally {
            setTimeout(() => {
                processedDownloads.delete(downloadId)
            }, 60000)
        }
    })
})