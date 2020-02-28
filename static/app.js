

document.addEventListener('DOMContentLoaded', () => {
	
	// Set up select menu
	let input = document.querySelector('#city');
        input.onkeyup = function() {
            $.get('/city?q='+  input.value, function(data){
                let html = '';
                for (word of data){
                    html += `<option value="${word}">` + word + '</option>';
                }
                if (document.querySelector('input').value.length > 0 && data.length > 0){
                        show();
                        document.querySelector('select').size =data.length;
                }
                else{
                    hide()
                }
                document.querySelector('select').innerHTML = html;
            });
        };

        function hide(){
                var selector =  document.querySelector('select');
                selector.style.visibility = 'hidden';
                selector.size=0;
        }

        function show(){
                var selector =  document.querySelector('select');
                selector.style.visibility = 'visible';
        }

    // set up temperature
	let long;
	let lat;
	let temperatureDescription = document.querySelector('.temperature-description');
	let temperatureDegree = document.querySelector('.temperature-degree');
	let locationTimezone = document.querySelector('.location-timezone');
	
	const anim = document.querySelector('.temperature')
	anim.style.animationPlayState = 'paused'


		document.querySelector('#form').onsubmit = () => {
			

		 	// Initialize new request
	        const request = new XMLHttpRequest();
	        const city = document.querySelector('#city').value;
	        const city_selected = document.querySelector('#city_selected').value;
	        request.open('POST', '/search');

	         // Callback function for when request completes
	        request.onload = () => {

	            // Extract JSON data from request
	            const data = JSON.parse(request.responseText);
	            document.querySelector('#result').innerHTML ="";

	            // Update the result div
	            if (data.success) {
	                const temperature = data.temperature;
	                const summary = data.summary;
	                const city_name = data.city;
	                const icon = data.icon;
	                const country = data.country;


	                // Set DOM elements from the API
	                document.querySelector('.temperature-degree').innerHTML = `${temperature} F`;
	                document.querySelector('.temperature-description').innerHTML = summary;
	                document.querySelector('.location-timezone').innerHTML = `${city_name}, ${country}`;
	                // Set icon
					setIcons(icon, document.querySelector('#icon'));

					// Add the graph with the temperature per hour
	        		document.getElementById("default_click").click();
					

	            } else {
	                document.querySelector('#result').innerHTML = 'There was an error.';
	            }
	        }

        	function setIcons(icon,iconID) {
				

        		if (icon == "partly-cloudy-night" || icon == "clear-night") {
        			var color = "black";
        		}
				else if (icon == "clear-day") {
					var color = "yellow";
				}

				else if (icon == "cloudy" || icon == "rain"){
					var color = "grey";
				}
				else {
					var color = "white";
				}

				const skycons = new Skycons({color: color});
				const currentIcon = icon.replace(/-/g, "_").toUpperCase();

				skycons.play();
				return skycons.set(iconID, currentIcon);

			}


			// Add data to send with request
	        const data = new FormData();
	        data.append('city', city);
	        data.append('city_selected', city_selected);

			 // Send request
	        request.send(data);

	        // Clear the city input field
	        document.querySelector('#city').value=''

	        anim.style.animationPlayState = 'running';

	        hide()

	        

	        document.getElementById("button_graph").style.display = "block";
			return false;
		 }

		 document.querySelectorAll('button').forEach(button	=> {
		 		button.onclick = () => {
		 			const selection = button.dataset.type;
		 			// Initialize new request
			        const request = new XMLHttpRequest();
			        const city = document.getElementById("current_city").textContent;;
			        const city_selected = '';
			        request.open('POST', '/search');

			         // Callback function for when request completes
			        request.onload = () => {
					    // Extract JSON data from request
			            const data = JSON.parse(request.responseText);
			            // Update the result div
			            if (data.success) {
			                const temp_per_hour = data.temp_per_hour;
			                const hour_list = data.hour_list;
			                const wind_per_hour = data.wind_per_hour;
			                const precip_per_hour = data.precip_per_hour;

			                
			                if (selection=="temperature"){
			                	data_selection = temp_per_hour;
			                	type_selection = 'line';
			                	label_selection = 'F';
			                }
			              	else if (selection=="wind"){
			               		data_selection = wind_per_hour;
			               		type_selection = 'bar';
			               		label_selection = 'mph';
			                }
			              	else if (selection=="precipitation"){
			               		data_selection = precip_per_hour;
			               		type_selection = 'bar';
			               		label_selection = '%';
			                }

			              	var ctx = document.getElementById('myChart').getContext('2d');

			        var chart = new Chart(ctx, {
			        	type: type_selection,
			        	data:{
			        		labels:	hour_list,
			        		datasets:[{
			        			label:label_selection,
			        			data: data_selection,
			        			borderWidth: 2,
			        			borderSkipped: 'bottom',
			        			borderColor:'blue'
			        		}
			        		]
			        	},
			        	options:{
			        	}

			        });




					    }
					    // end of data success
					}
					// Add data to send with request
			        const data = new FormData();
			        data.append('city', city);
			        data.append('city_selected', city_selected);
					 // Send request
			        request.send(data);


				}
		 })

		
});

