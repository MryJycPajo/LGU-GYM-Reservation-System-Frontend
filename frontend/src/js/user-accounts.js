const body = document.querySelector('#accounts-body');
const empty = document.querySelector('#empty-state');
const search = document.querySelector('#search-input');
const filter = document.querySelector('#filter-select');

let users = [];

function fullName(user) {
    return `${user.firstname || ''} ${user.lastname || ''}`.trim();
}

function initials(user) {
    return `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
}

async function loadUsers() {

    try {

        const response = await fetch('http://localhost:3001/api/auth/accounts');
        const data = await response.json();

        if (!data.success) {
            alert(data.message);
            return;
        }

        users = data.users;
        render();

    } catch (err) {

        console.error(err);
        alert('Cannot connect to server.');

    }

}

function render() {

    const keyword = search.value.toLowerCase();
    const selected = filter.value;

    const filtered = users.filter(user => {

        const text = `
            ${user.account_id}
            ${user.firstname}
            ${user.lastname}
            ${user.email}
            ${user.position || ''}
        `.toLowerCase();

        if (keyword && !text.includes(keyword))
            return false;

        if (selected === 'all')
            return true;

        if (selected === 'client')
            return user.account_type === 'Client';

        if (selected === 'personnel')
            return user.account_type === 'Personnel';

        return user.status.toLowerCase() === selected;

    });

    document.querySelector('#account-count').textContent =
        `${filtered.length} account(s)`;

    body.innerHTML = filtered.map(user => `

<tr>

<td>

<div class="table-user">

<span class="user-avatar">
${initials(user)}
</span>

<div>

<b>${fullName(user)}</b>

<small>${user.account_id}</small>

</div>

</div>

</td>

<td>${user.account_type}</td>

<td>${user.email || '-'}</td>

<td>${user.position || '-'}</td>

<td>${user.status}</td>

<td>

${user.status === 'Pending' ? `

<button class="approve-btn"
onclick="approveAccount('${user.account_id}')">

Approve

</button>

<button class="decline-btn"
onclick="declineAccount('${user.account_id}')">

Decline

</button>

` : '-'}

</td>

</tr>

`).join('');

    empty.hidden = filtered.length > 0;

}

async function approveAccount(id) {

    await fetch(
        `http://localhost:3001/api/auth/approve/${id}`,
        {
            method: 'PUT'
        }
    );

    loadUsers();

}

async function declineAccount(id) {

    await fetch(
        `http://localhost:3001/api/auth/decline/${id}`,
        {
            method: 'PUT'
        }
    );

    loadUsers();

}

window.approveAccount = approveAccount;
window.declineAccount = declineAccount;

search.addEventListener('input', render);
filter.addEventListener('change', render);

document.querySelector('#menu-button')
.addEventListener('click', () => {

    document.querySelector('#sidebar')
    .classList.toggle('open');

});

loadUsers();