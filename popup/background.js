const BACKEND = 'http://localhost:1721';

async function getTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0].url;
}

async function updateList() {
    const ret = await fetch(BACKEND + '/domains.json');
    const domains = await ret.json();
    console.log(domains);
    chrome.storage.sync.set({domains}, () => {
        console.log('updated domains');
    });

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map(rule => rule.id);

    let blocks = [];
    let i = 0;
    for (const domain of domains) {
        i++;
        blocks.push({
            "id": i,
            "priority": 1,
            "action": {
                "type": "block"
            },
            "condition": {
                "urlFilter": domain,
                "resourceTypes": ["main_frame"] // should we change this?
            }
        });
    }

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: oldRuleIds,
        addRules: blocks,
    });
}

async function getList() {
    return (await chrome.storage.sync.get('domains')).domains;
}

chrome.windows.onCreated.addListener(async function() {
    await updateList();
    console.log(await getList());
});
