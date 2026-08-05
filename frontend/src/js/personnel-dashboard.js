async function loadDashboard() {

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/accounts'
        );

        const data = await response.json();

        if (!data.success) return;

        const clients = data.users.filter(
            u => u.account_type === 'Client'
        );

        document.querySelector('#totalClients').textContent =
            clients.length;

        document.querySelector('#pendingClients').textContent =
            clients.filter(c => c.status === 'Pending').length;

        document.querySelector('#approvedClients').textContent =
            clients.filter(c => c.status === 'Approved').length;

    } catch (err) {

        console.log(err);

    }

}

loadDashboard();

async function loadClientList(){

    try {

        const response = await fetch(
            'http://localhost:3001/api/auth/clients'
        );


        const data = await response.json();


        const table = document.querySelector('#client-list');


        if (!table) return;


        if (data.success){


            table.innerHTML = data.clients.map(client => `

                <tr>

                    <td>
                        ${client.firstname}
                        ${client.lastname}
                    </td>


                    <td>
                        ${client.email || '-'}
                    </td>


                    <td>
                        ${client.phone_number || '-'}
                    </td>


                    <td>
                        <span class="status">
                            ${client.status}
                        </span>
                    </td>


                </tr>


            `).join('');


        }


    } catch(err){

        console.log(err);

    }

}


loadClientList();