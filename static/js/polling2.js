        async function subscribe() {
        let response = await fetch(url, {
            "method": "POST",
            "body": JSON.stringify(data),
            "mode": 'no-cors'        
        });
        
        console.log('subscribe: ' + url)
        
        if (response.status == 502) {
            console.log("502")
            // Status 502 is a connection timeout error,
            // may happen when the connection was pending for too long,
            // and the remote server or a proxy closed it
            // let's reconnect
            await subscribe();
        } else if (response.status != 200) {
            console.log("200")
            // An error - let's show it
            showMessage(response.statusText);
            // Reconnect in one second
            //await new Promise(resolve => setTimeout(resolve, 2000));
            //await subscribe();
        } else {
            console.log("else")
            validateMessage.style.visibility = "visible";
            // Get and show the message
            //let message = await response.text();
            //showMessage(message);
            // Call subscribe() again to get the next message
            await subscribe();
        }
        }

        subscribe();
