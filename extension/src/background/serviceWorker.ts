/// <reference types="chrome" />

console.log('Dedoup service worker loaded successfully')

chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setOptions({
        path: 'index.html',
        enabled: true
    })
})

chrome.action.onClicked.addListener(async (tab) => {
    if(!tab?.windowId) return;

    await chrome.sidePanel.open({
        windowId: tab.windowId
    })
})


