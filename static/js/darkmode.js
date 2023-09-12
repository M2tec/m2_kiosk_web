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


// Set darkmode
const currentTheme = localStorage.getItem("theme");
console.log(currentTheme)
if (currentTheme == 'dark') {
    dark_mode()
} else {
    light_mode()
}
