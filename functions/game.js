// This ensures the code inside runs only after the HTML is parsed
document.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');
    
    // Now you can safely get the element
    const button = document.getElementById("codachrome_button");
    
    if (button) {
        button.addEventListener("click", function() {
            alert("It works! The button was clicked.");
            // Add your other game logic here
        });
    } else {
        console.error("Error: Button element not found!");
    }
});
