const BACKEND = 'http://localhost:1721';

(async() => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    
    if (tab) {
        document.getElementById('domain').innerText = (new URL(tab.url)).hostname;
    }

    document.getElementById('report').addEventListener('click', async() => {
        try {
            const res = await fetch(BACKEND + '/report', {
                method: 'post',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    domain: (new URL(tab.url)).hostname,
                }),
            });

            const data = await res.json();

            if (data.success) {
                document.getElementById('success').display = 'block';
            } else {
                document.getElementById('fail').display = 'block';
            }
        } catch(e) {
            document.getElementById('fail').display = 'block';
            return;
        }    
    });
})();


