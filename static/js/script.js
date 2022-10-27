
class Paypad {
    constructor(payAmountTextElement, validateMessage, mainnet_active, mainnet_wallet_address, testnet_wallet_address, decimal_seperator) {
        this.payAmountTextElement = payAmountTextElement;
        this.clear();

        this.locale = decimal_seperator;
        //this.locale = 'nl-NL'

    }

    clear() {
        //console.log('clear()')      
        this.updateDisplay('');
    }

    delete() {
        var storedInput = this.payAmountTextElement.dataset.input;        
        //console.log(storedInput)
                
        if (storedInput.includes('.')) {
            const decimalDigits = storedInput.split('.')[1]
            var oneDigit = false;
               
            if (decimalDigits.length == 1) {
                oneDigit = true;
                
            }
        }       
        
        if (oneDigit) {
            // Remove the dot also if only one digit
            var number = storedInput.slice(0, -2)    
        } else {
            var number = storedInput.slice(0, -1)  
        }
                
        this.updateDisplay(number);
        
    }

    addNumber(amount) {
        //console.log('\naddNumber')
        var storedInput = this.payAmountTextElement.dataset.input;  
        //console.log(storedInput);

        if (isNaN(parseFloat(storedInput))) {
            storedInput = 0
            //console.log('isNaN');
        }
                
        var number = parseFloat(storedInput) + amount;
        
        this.updateDisplay(number);
    }

    appendNumber(number) {
        //console.log('\nappendNumber()');
              
        // Get data
        var storedInput = this.payAmountTextElement.dataset.input;        
        
        //console.log(storedInput)
        if (storedInput.includes('.')) {
            const decimalDigits = storedInput.split('.')[1]
            var tooManyDigits = false;
               
            if (decimalDigits.length >= 2) {
                tooManyDigits = true;
            }
        }
        
        if (tooManyDigits) return
        
        if (number === '.' && storedInput.includes('.') ) return
        
        number = storedInput + number.toString();
         
        //console.log("---------");
        //console.log(number);
        
        this.updateDisplay(number);
    }
 
    updateDisplay(number) {
        //console.log('updateDisplay');
        // Only for display
        
        // Store the data seperately from the internationalised value
        this.payAmountTextElement.dataset.input = number;
        //console.log(number);
        
        if (isNaN(parseFloat(number))) {
            number = 0
            //console.log('isNaN');
        }
        
        this.payAmountTextElement.innerText = parseFloat(number).toLocaleString(this.locale, {style:"currency", currency:"EUR"});
    }

    async sendPayRequest(amount) {
        
        
        var wallet_address = ""
        var network_type = ""
        
        console.log('mainnet_active: ' + mainnet_active)
        
        if (mainnet_active == 'True') {
            console.log('mainnet')
            network_type = 'mainnet'
            wallet_address = mainnet_wallet_address;
        } else {
            console.log('testnet')
            network_type = 'testnet'
            wallet_address = testnet_wallet_address;
        }
        
        const now = new Date();
        console.log("now:" + now)
        
        var randomID = Math.floor(Math.random() * 10000);
        
        var orderName = 'Order ' + (now.getMonth() +1) + now.getDate() + now.getHours() + now.getMinutes() + randomID
                
        //amount = Math.floor(amount * 1000000)
        const data = {
            "network_type": network_type,
            "name": orderName,
            "wallet_address": wallet_address,
            "total_with_tax": amount
        }
        
        console.log(JSON.stringify(data))
        
        var url = "http://m2paypad.home:9090/payment-request"    
	console.log(url)        
	const response = fetch(url, {
            "method": "POST",
            "body": JSON.stringify(data),            
        });
                     
        getStatus(data)

    }

    async cancelPayRequest() {
        const url = "http://m2paypad.home:9090/clear-display"
       
        const response = fetch(url, {
            "method": "GET",
        });
        
        validateMessage.style.visibility = "hidden";
           
        //const responseText = await response();
        //console.log(responseText); // logs 'OK'
    }
        

    

}

async function getStatus(data) {
    var url = "http://m2paypad.home:9090/payment-status"    
    let response = await fetch(url, {
        "method": "POST",
        "body": JSON.stringify(data),
    })
    //console.log('getStatus')
    
    if (response.status == 502) {
    console.log("502")
        // Status 502 is a connection timeout error,
        // may happen when the connection was pending for too long,
        // and the remote server or a proxy closed it
        // let's reconnect
        await getStatus(data);
    } else if (response.status == 200) {
        console.log("200")
        // An error - let's show it
        console.log(response.statusText);
        
        payment_status = response.statusText
        if (payment_status == 'not_received') {
            // Reconnect in one second
            await new Promise(resolve => setTimeout(resolve, 10000));
            await getStatus(data);
        } else {
            validateMessage.style.visibility = "visible";
        }
        
    } else {
        console.log("else")
               
        console.log(response.statusText);
        // Get and show the message
        //let message = await response.text();
        //showMessage(message);
        // Call subscribe() again to get the next message
        // await getStatus(data);
    }
    
    
}    


const payAmountTextElement = document.querySelector('[data-input]');



const paymentPage = document.getElementById('payment-page') ;
const configPage = document.getElementById('config-page');
configPage.style.visibility = 'hidden';
console.log('config viz ' + configPage.style.visibility);

const cancelConfigButton = document.getElementById('cancel-config');
const saveConfigButton = document.getElementById('save-config');
const cancelTransactionButton = document.getElementById('cancel-transaction');
const validateTransactionButton = document.getElementById('validate-transaction');
const validateMessage = document.getElementById('validate-message');

var form = document.getElementById("config-form");

const mainnet_active = document.getElementById('mainnet_active').value ;
const mainnet_wallet_address = document.getElementById('mainnet_wallet_address').value ;
const testnet_wallet_address = document.getElementById('testnet_wallet_address').value ;
const decimal_seperator = document.getElementById('decimal_seperator').value ;

const numberButtons = document.querySelectorAll('[data-action]');
const paypad = new Paypad(payAmountTextElement, validateMessage, mainnet_active, mainnet_wallet_address, testnet_wallet_address, decimal_seperator);

numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    var buttonAction = button.dataset.action
     
    console.log('button action: ' + buttonAction)
    
    if (buttonAction >= "0" && buttonAction <= "9") {
        paypad.appendNumber(buttonAction)
    }
    
    if (buttonAction == ".") {
        paypad.appendNumber(buttonAction)
    }
    
    if (buttonAction === "Backspace") {
        paypad.delete()
    }   

   
    if (buttonAction === "+10") {
        paypad.addNumber(10)
    }       
    
    if (buttonAction === "+20") {
        paypad.addNumber(20)
    }    
    
    if (buttonAction === "+50") {
        paypad.addNumber(50)
    }    
    
    if (buttonAction === "Config") {
        //console.log(paymentPage);
        //console.log(paymentPage.style.visibility);
        
        if (paymentPage.style.visibility == "hidden") {
            //console.log("show");
            paymentPage.style.visibility = "visible";
            configPage.style.visibility = "hidden";
            console.log(paymentPage);
        } else {
            //console.log("hide")
            paymentPage.style.visibility = "hidden";
            configPage.style.visibility = "visible";
        }       
    }  
  })
})

document.addEventListener('click', function (event) {
    if (cancelConfigButton.contains(event.target)) {
        console.log('cancel config');
        if (paymentPage.style.visibility == "hidden") {
            //console.log("show");
            paymentPage.style.visibility = "visible";
            configPage.style.visibility = "hidden";
            console.log(paymentPage);
        } else {
            //console.log("hide")
            paymentPage.style.visibility = "hidden";
            configPage.style.visibility = "visible";
        }    
        }
        
    if (saveConfigButton.contains(event.target)) {
        console.log('save config');
        form.submit();
    }
    if (cancelTransactionButton.contains(event.target)) {
        console.log('cancel transaction');
        paypad.clear();
        paypad.cancelPayRequest()
    }
    if (validateTransactionButton.contains(event.target)) {
    //console.log('clicked inside');
        amount = paypad.payAmountTextElement.dataset.input
        console.log(amount);
        paypad.sendPayRequest(amount);
    }
        
        
  });

document.addEventListener('keydown', function (event) {
    console.log(event.key);
    
    if (configPage.style.visibility == "hidden"  ) {    
        if (event.key >= "0" && event.key <= "9") {
            event.preventDefault();
            paypad.appendNumber(event.key);       
        }
      
        if (event.key == '.') {
            event.preventDefault();
            paypad.appendNumber(event.key);
            console.log('Dot');
        }
        
        if (event.key == "Backspace") {
            
                event.preventDefault();
                paypad.delete()
          
        }
        
        if (event.key == 'Delete') {
            event.preventDefault();
            paypad.clear();
        }    

        if (event.key == "Enter") {
            event.preventDefault();
            amount = paypad.payAmountTextElement.dataset.input
            console.log(amount);
            paypad.sendPayRequest(amount);
            console.log('Send transaction');
        }      

        if (event.key === "Escape") {
            event.preventDefault();
            console.log('Cancel transaction');
        } 
    }
    
  });
