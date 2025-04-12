async function sendPaymentRequest() {
    try {
        const response = await fetch("http://localhost:8000/payment");

        if (!response.ok) {
            throw new Error("Request failed: " + response.status);
        }

        const contentType = response.headers.get("Content-Type");

        // Check if the response is HTML
        if (contentType && contentType.includes("text/html")) {
            const html = await response.text();
            // Insert the HTML into a container or replace the body content
            document.body.innerHTML = html; // This will replace the entire page content
            // Or, you could insert it into a specific container
            // document.getElementById("yourContainer").innerHTML = html;
        } else {
            const data = await response.json();
            alert("Payment response: " + JSON.stringify(data));
        }
    } catch (error) {
        console.log(error.message);
        alert("Payment failed: " + error.message);
    }
}
