document.addEventListener("DOMContentLoaded", () => {
    const deleteButton = document.getElementById('deleteButton');

    deleteButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/delete-emails', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({

                });
                const result = await response.json();
                if (result.status === 'success') {
                    
                }
            })
        }
    })
})