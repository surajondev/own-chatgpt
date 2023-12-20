document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('myForm');
    const loadDataButton = document.getElementById('loadDataButton');
    const loader = document.getElementById('loader');
    const responseDiv = document.getElementById('response');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const inputText = document.getElementById('textInput').value;

        // Show loader while waiting for the server response
        loader.classList.remove('hidden');

        try {
            const response = await postData(inputText);

            // Display the server response
            responseDiv.innerHTML = `Server Response: ${response.answer}`;
            responseDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            // Handle error if needed
        } finally {
            // Hide the loader after the server response is received
            loader.classList.add('hidden');
        }
    });

    loadDataButton.addEventListener('click', async function () {
        // Show loader while waiting for the server response
        loader.classList.remove('hidden');

        try {
            // Make a request to the server's /loadingdata endpoint
            const response = await fetch('http://localhost:5000/loadingdata');
            const data = await response.json();

            // Display the server response
            console.log(data)
            responseDiv.innerHTML = `Server Response: ${data.message}`;
            responseDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            // Handle error if needed
        } finally {
            // Hide the loader after the server response is received
            loader.classList.add('hidden');
        }
    });

    async function postData(data) {
        const url = 'http://localhost:5000/querydata'; // Replace with your server endpoint
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: data }),
        };

        const response = await fetch(url, options);
        const result = await response.json();

        return result;
    }
});
