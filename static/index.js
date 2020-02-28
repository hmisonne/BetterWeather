// document.addEventListener('DOMContentLoaded', () => {

//     document.querySelector('#form').onsubmit = () => {

//         // Initialize new request
//         const request = new XMLHttpRequest();
//         const city = document.querySelector('#city').value;
//         // request.open('POST', '/search');

//         // Callback function for when request completes
//         // request.onload = () => {

//             // Extract JSON data from request
//             const data = JSON.parse(request.responseText);

//             // Update the result div
//             // if (data.success) {
//                 console.log(data)
//                 // const contents = `The weather is ${data.currently.temperature} in ${city}.`
//                 // document.querySelector('#result').innerHTML = contents;
//             // } else {
//             //     document.querySelector('#result').innerHTML = 'There was an error.';
//             // }
//         // }

//         // Add data to send with request
//         // const data = new FormData();
//         // data.append('city', city);

//         // Send request
//         // request.send(data);
//         return false;
//     };

// });
