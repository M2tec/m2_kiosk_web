const configPage = document.getElementById('config-page');
var form = document.getElementById("config-form");
const cancelConfigButton = document.getElementById('cancel-config');
const saveConfigButton = document.getElementById('save-config');

document.addEventListener('input',(e)=>{

    switch (e.target.getAttribute('name')){
        case "network_type":{

            network_type = e.target.value

            var networksRadioButtons = document.querySelectorAll("input[type='radio'][name=network_type]");
            networksRadioButtons.forEach((network_Button) => { 
            
                var config_block = document.getElementById(network_Button.value)

                if (network_Button.value == network_type) {
                    config_block.style.display = "grid"
                    console.log("grid")
                } else {
                    config_block.style.display = "none"
                    console.log("none")
                }
                }
            );
            }
            break;
        case "file":{
            console.log("file")}
            console.log(document.getElementById("file"));
            break;
        default:{
            console.log('no action')}

    }
    console.log("")
})

document.addEventListener('click', function (event) {
    if (cancelConfigButton.contains(event.target)) {
        console.log('cancel config');

    }
        
    if (saveConfigButton.contains(event.target)) {
        console.log('save config');
        form.submit();
    }
    
});

