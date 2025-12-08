
// Step 2a: Find the HTML element you want to watch.
const buttonElement = document.getElementById("codachrome_button");

// Step 2b: Define a function (callback) that runs when the event happens.
function handleButtonClick() {
    console.log("A click was detected in JS!");
    alert("Button clicked!");
    // You can send data, change styles, or call other JS functions here.
}

// Step 2c: Attach the event listener to the element.
// We listen for the 'click' event and run the handleButtonClick function when it occurs.
buttonElement.addEventListener("click", handleButtonClick);