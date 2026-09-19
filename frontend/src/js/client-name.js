const accountId = localStorage.getItem('account_id');

export async function loadClientName() {
    const clientName = document.querySelector('#client-name');

    if (!clientName || !accountId) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3001/api/auth/clients/${accountId}`
        );

        const data = await response.json();

        if (!data.success || !data.client) {
            throw new Error(data.message || 'Unable to load client profile.');
        }

        const fullName = [
            data.client.firstname,
            data.client.lastname
        ]
            .filter(Boolean)
            .join(' ');

        clientName.textContent = fullName || 'Client';
    } catch (error) {
        console.error('CLIENT NAME ERROR:', error);
    }
}