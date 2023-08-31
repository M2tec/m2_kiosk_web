function light_mode() {
    document.documentElement.style.setProperty
    ('--background-color', '#f0eeee')
    document.documentElement.style.setProperty
    ('--font-color', '#555')
    document.documentElement.style.setProperty
    ('--line-color', '#bfbfbf')
    document.documentElement.style.setProperty
    ('--button-background-color', '#e2e2e2')          
    document.documentElement.style.setProperty
    ('--currency-background-color', '#78baff')
    document.documentElement.style.setProperty
    ('--currency-font-color', 'white')
    document.documentElement.style.setProperty
    ('--payment-line-background', 'white')
    document.documentElement.style.setProperty
    ('--shadow-color', 'rgba(0,0,0,0.2)')      
    
    localStorage.setItem("theme", "light");

    document.getElementById('light-theme-button').style.display = "none"; 
    document.getElementById('dark-theme-button').style.display = "block";

}

function dark_mode() {

    document.documentElement.style.setProperty
    ('--background-color', '#0f0f0f')
    document.documentElement.style.setProperty
    ('--font-color', '#949742')
    document.documentElement.style.setProperty
    ('--line-color', '#44451f')
    document.documentElement.style.setProperty
    ('--button-background-color', '#030303')          
    document.documentElement.style.setProperty
    ('--currency-background-color', '#ded43a')
    document.documentElement.style.setProperty
    ('--currency-font-color', 'black')
    document.documentElement.style.setProperty
    ('--payment-line-background', '#555')    
    document.documentElement.style.setProperty
    ('--shadow-color', 'gold') 
        
    localStorage.setItem("theme", "dark");

    document.getElementById('light-theme-button').style.display = "block";
    document.getElementById('dark-theme-button').style.display = "none"; 
}

document.getElementById('light-theme-button').addEventListener('click', () => {
    light_mode()
})

document.getElementById('dark-theme-button').addEventListener('click', () => {
    dark_mode()
}) 


class Paypad {
    constructor(payAmountTextElement, payment_data, request_type, pad_dot) {         
        console.log("Constructor")
        var locale_setting = document.getElementById('locale_setting').dataset.locale_setting ;  
        this.locale = locale_setting.split(".")[0].replace('_','-');
        console.log(this.locale)

        // Set darkmode
        const currentTheme = localStorage.getItem("theme");
        console.log(currentTheme)
        if (currentTheme == 'dark') {
            dark_mode()
        } else {
            light_mode()
        }


        this.payAmountTextElement = payAmountTextElement;
        this.payment_form = document.getElementById("payment-form");
        this.payment_data = payment_data;
        this.request_type = request_type;
                    
        var validateMessage = document.getElementById('validate-message');        
        
        this.clear();
        var host_m2 = window.location.host
        console.log('host: ' + host_m2)

        this.hostname_m2 = window.location.hostname
        //console.log('hostname: ' + this.hostname_m2)
    
        //Finde the decimal seperator of this locale and set it on the keypad
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

        //var mainnet_wallet_address = document.getElementById('mainnet_wallet_address').value ;        
        var network_type = document.getElementById('network_type').dataset.network_type ;   
        //var testnet_wallet_address = document.getElementById('testnet_wallet_address').value ; 
        var token_policyID = selectedToken.getAttribute('data-policyID');
        console.log(token_policyID);
        var token_name = selectedToken.innerText;   
        
        var wallet_address = document.getElementById(network_type + "_wallet_address").value

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
            "token_policyID": token_policyID,
            "token_name": token_name,
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
    
    changeToken(token) {
        console.log(token);
    }
}


const paymentPage = document.getElementById('payment-page') ;
paymentPage.style.display = 'block';
const cancelTransactionButton = document.getElementById('cancel-transaction');
const payAmountTextElement = document.querySelector('[data-input]');
const validateTransactionButton = document.getElementById('validate-transaction');
var payment_data = document.getElementsByName("payment-data")[0];
var request_type = document.getElementsByName("request-type")[0];

//var tokenButtons = document.getElementsByClassName("token");
const tokenButtons = document.querySelectorAll('#token');

const configPage = document.getElementById('config-page');
configPage.style.display = 'none';
var form = document.getElementById("config-form");
const cancelConfigButton = document.getElementById('cancel-config');
const saveConfigButton = document.getElementById('save-config');

const pad_dot = document.getElementById('Dot')
const numberButtons = document.querySelectorAll('[data-action]');

const paypad = new Paypad(payAmountTextElement, payment_data, request_type, pad_dot);


document.addEventListener('input',(e)=>{

    if(e.target.getAttribute('name')=="network_type")
        network_type = e.target.value

        var networksRadioButtons = document.querySelectorAll("input[type='radio'][name=network_type]");
        networksRadioButtons.forEach((network_Button) => { 
        
            var config_block = document.getElementById(network_Button.value)

            if (network_Button.value == network_type) {
                config_block.style.display = "grid"
                console.log("block")
            } else {
                config_block.style.display = "none"
                console.log("none")
            }
    }
    );

    })



var locale_selector = document.getElementById("locale_setting");
var locale_setting = document.getElementById('locale_setting').dataset.locale_setting ;  
if (locale_setting == 'en_US.UTF-8') {
    radioButton = document.getElementById("en_US.UTF-8");
    radioButton.checked = true; 
}

if (locale_setting == 'nl_NL.UTF-8') {
    radioButton = document.getElementById("nl_NL.UTF-8");
    radioButton.checked = true;
}

locale_selector.addEventListener('click', () => {

    console.log(" ")    
    console.log("US: " + document.getElementById('en_US.UTF-8').checked)
    console.log("EU: " + document.getElementById('nl_NL.UTF-8').checked)    
    
})   

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
        
        if (paymentPage.style.display == "none") {
            //console.log("show");
            paymentPage.style.display = "block";
            configPage.style.display = "none";
            console.log(paymentPage);
        } else {
            //console.log("hide")
            paymentPage.style.display = "none";
            configPage.style.display = "block";
        }       
    }  
  })
})

tokenButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedToken.innerText = button.innerText;
    
    selectedToken.setAttribute('data-policyID', button.getAttribute('data-policyID'));  
    })    
})




document.addEventListener('click', function (event) {
    if (cancelConfigButton.contains(event.target)) {
        console.log('cancel config');
        if (paymentPage.style.display == "none") {
            //console.log("show");
            paymentPage.style.display = "block";
            configPage.style.display = "none";
            console.log(paymentPage);
        } else {
            //console.log("hide")
            paymentPage.style.display = "none";
            configPage.style.display = "block";
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
    
    if (configPage.style.display == "none"  ) {    
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
