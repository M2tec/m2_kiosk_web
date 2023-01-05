class Paypad {
    constructor(payAmountTextElement, validateMessage, networkt_type, mainnet_wallet_address, testnet_wallet_address, locale_setting, due_from, payment_data, request_type, pad_dot) {
        this.locale = locale_setting.split(".")[0].replace('_','-');
        console.log(this.locale)
        
        this.payAmountTextElement = payAmountTextElement;
        this.payment_form = payment_form;
        this.payment_data = payment_data;
        this.request_type = request_type;
        this.clear();
        var host_m2 = window.location.host
        console.log('host: ' + host_m2)

        this.hostname_m2 = window.location.hostname
        //console.log('hostname: ' + this.hostname_m2)
    
        var decimalSeparator = (1.1).toLocaleString(this.locale, { useGrouping: true, minimumFractionDigits: 2 }).substring(1, 2);
        pad_dot.innerText=decimalSeparator
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
        console.log("Stored input: " + this.payAmountTextElement.dataset.input)
        
        
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
        //console.log('updateDisplay: ' + number);       
        // Store the data seperately from the internationalised value
        this.payAmountTextElement.dataset.input = number;       
        if (isNaN(parseFloat(number))) {
            number = 0
            //console.log('isNaN');
        }
        //console.log("The number is: " + number)
        //console.log("Type of the number: " + typeof(number))
        this.payAmountTextElement.innerText = parseFloat(number).toLocaleString(this.locale, { useGrouping: true, minimumFractionDigits: 2 });
    }
    //this.payAmountTextElement.innerText = parseFloat(number).toLocaleString(this.locale, {style:"currency", currency:"EUR"});

    async sendPayRequest(amount) {
            
        var wallet_address = ""
        //var network_type = ""
        
        //console.log('mainnet_active: ' + mainnet_active)
        
        if (network_type == 'mainnet') {
        //    console.log('mainnet')
            wallet_address = mainnet_wallet_address;
        } else {
            wallet_address = testnet_wallet_address;
        }
        
        const now = new Date();
        //console.log("now:" + now)
        
        var year = (now.getYear() - 100).toString() 
        var month = (('0' + (now.getMonth() +1)).slice(-2)).toString()
        var day  = (('0' + (now.getDate())).slice(-2)).toString()
        var hours = (('0' + (now.getHours())).slice(-2)).toString()    
        var minutes = (('0' + (now.getMinutes())).slice(-2)).toString()
        var randomID = Math.floor(Math.random() * 10000);      
        
        var transaction_id = year + month  + day + "-" + hours + minutes + "-" + randomID
        //console.log(transaction_id)
                
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
//console.log('config viz ' + configPage.style.visibility);

const cancelConfigButton = document.getElementById('cancel-config');
const saveConfigButton = document.getElementById('save-config');
const cancelTransactionButton = document.getElementById('cancel-transaction');
const validateTransactionButton = document.getElementById('validate-transaction');
const validateMessage = document.getElementById('validate-message');

var form = document.getElementById("config-form");
var payment_form = document.getElementById("payment-form");
var payment_data = document.getElementsByName("payment-data")[0];
var request_type = document.getElementsByName("request-type")[0];

const network_type = document.getElementById('network_type').value ;
const mainnet_wallet_address = document.getElementById('mainnet_wallet_address').value ;
const testnet_wallet_address = document.getElementById('testnet_wallet_address').value ;
const locale_setting = document.getElementById('locale_setting').value ;
const pad_dot = document.getElementById('Dot')

const numberButtons = document.querySelectorAll('[data-action]');
const paypad = new Paypad(payAmountTextElement, validateMessage, network_type, mainnet_wallet_address, testnet_wallet_address, locale_setting, payment_form, payment_data, request_type, pad_dot);

numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    var buttonAction = button.dataset.action
     
    console.log('button action: ' + buttonAction)
    
    if (buttonAction >= "0" && buttonAction <= "9") {
        paypad.appendNumber(buttonAction)
    }
    
    if (buttonAction == "dot") {
        
        paypad.appendNumber(".")
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
