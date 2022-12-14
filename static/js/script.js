class Paypad {
    constructor(payAmountTextElement, validateMessage, mainnet_active, mainnet_wallet_address, testnet_wallet_address, decimal_seperator, due_from, payment_data, request_type) {
        this.payAmountTextElement = payAmountTextElement;
        this.payment_form = payment_form;
        this.payment_data = payment_data;
        this.request_type = request_type;
        this.clear();
        this.locale = decimal_seperator;
       
        var host_m2 = window.location.host
        console.log('host: ' + host_m2)

        this.hostname_m2 = window.location.hostname
        console.log('hostname: ' + this.hostname_m2)

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
        var storedInput = this.payAmountTextElement.dataset.input;  

        if (isNaN(parseFloat(storedInput))) {
            storedInput = 0
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
        this.updateDisplay(number);
    }
 
    updateDisplay(number) {
        //console.log('updateDisplay');       
        // Store the data seperately from the internationalised value
        this.payAmountTextElement.dataset.input = number;       
        if (isNaN(parseFloat(number))) {
            number = 0
            //console.log('isNaN');
        }
        this.payAmountTextElement.innerText = parseFloat(number).toLocaleString(this.locale, {style:"currency", currency:"EUR"});
    }

    async sendPayRequest(amount) {
            
        var wallet_address = ""
        var network_type = ""
        
        //console.log('mainnet_active: ' + mainnet_active)
        
        if (mainnet_active == 'True') {
        //    console.log('mainnet')
            network_type = 'mainnet'
            wallet_address = mainnet_wallet_address;
        } else {
        //    console.log('testnet')
            network_type = 'testnet'
            wallet_address = testnet_wallet_address;
        }
        
        const now = new Date();
        //console.log("now:" + now)
        var randomID = Math.floor(Math.random() * 10000);
        var transaction_id = (now.getMonth() +1) + now.getDate() + now.getHours() + now.getMinutes() + randomID
                
        const data = {
            "network_type": network_type,
            "transaction_id": transaction_id,
            "wallet_address": wallet_address,
            "amount": amount
        }
        
        // Submit the payment request form
        console.log(JSON.stringify(data))     
        console.log(request_type)      
        this.request_type.value = 'sendPayRequest'
        this.payment_data.value = JSON.stringify(data)
        this.payment_form.submit();
    }

    async cancelPayRequest() {
        this.request_type.value = 'cancelPayRequest'    
        this.payment_form.submit();   
        
        validateMessage.style.visibility = "hidden";
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
var payment_form = document.getElementById("payment-form");
var payment_data = document.getElementsByName("payment-data")[0];
var request_type = document.getElementsByName("request-type")[0];

const mainnet_active = document.getElementById('mainnet_active').value ;
const mainnet_wallet_address = document.getElementById('mainnet_wallet_address').value ;
const testnet_wallet_address = document.getElementById('testnet_wallet_address').value ;
const decimal_seperator = document.getElementById('decimal_seperator').value ;

const numberButtons = document.querySelectorAll('[data-action]');
const paypad = new Paypad(payAmountTextElement, validateMessage, mainnet_active, mainnet_wallet_address, testnet_wallet_address, decimal_seperator, payment_form, payment_data, request_type);

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
