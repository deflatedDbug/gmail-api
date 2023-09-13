document.addEventListener("DOMContentLoaded", function() {
    const dropdownMenuButton = document.getElementById('dropdownMenuButton');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dltEmails = document.getElementById('deleteEmails');
    const previewInbox = document.getElementById('previewInbox');
    const sendEmails = document.getElementById('sendEmails');

    dltEmails.addEventListener('click', deleteEmails);
    
    dropdownMenuButton.addEventListener('click', function() {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });
})


 async function deleteEmails() {
    try {
        const response = await fetch('http://localhost:3000/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

    const text = await response.text();
    console.log(text);

    const data = JSON.parse(text);

    // const data = await response.json(); 

        if (response.ok) {
            alert(`${data.message} Number of emails deleted: ${data.count}`);
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