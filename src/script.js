document.addEventListener("DOMContentLoaded", function() {
    const deleteButton = document.getElementById('deleteButton');

    deleteButton.addEventListener('click', deleteEmails);
});

async function deleteEmails() {
    try {
        const response = await fetch('http://localhost:3000/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("Emails have been successfully deleted.");
        }
        else {
            alert("Failed to delete emails.");
        }
    }
     catch(error) {
        console.error(error);
        alert('An error has occurred');
     }
}