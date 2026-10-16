import"./modulepreload-polyfill-P2Xu9kJm.js";/* empty css              *//* empty css                 */var e=document.querySelector(`#accounts-body`),t=document.querySelector(`#empty-state`),n=document.querySelector(`#search-input`),r=document.querySelector(`#filter-select`),i=[];function a(e){return`${e.firstname||``} ${e.lastname||``}`.trim()}function o(e){return`${e.firstname?.[0]||``}${e.lastname?.[0]||``}`.toUpperCase()}async function s(){try{let e=await(await fetch(`http://localhost:3001/api/auth/accounts`)).json();if(!e.success){alert(e.message);return}i=e.users,c()}catch(e){console.error(e),alert(`Cannot connect to server.`)}}function c(){let s=n.value.toLowerCase(),c=r.value,l=i.filter(e=>{let t=`
            ${e.account_id}
            ${e.firstname}
            ${e.lastname}
            ${e.email}
            ${e.position||``}
        `.toLowerCase();return s&&!t.includes(s)?!1:c===`all`?!0:c===`client`?e.account_type===`Client`:c===`personnel`?e.account_type===`Personnel`:e.status.toLowerCase()===c});document.querySelector(`#account-count`).textContent=`${l.length} account(s)`,e.innerHTML=l.map(e=>`

<tr>

<td>

<div class="table-user">

<span class="user-avatar">
${o(e)}
</span>

<div>

<b>${a(e)}</b>

<small>${e.account_id}</small>

</div>

</div>

</td>

<td>${e.account_type}</td>

<td>${e.email||`-`}</td>

<td>${e.position||`-`}</td>

<td>${e.status}</td>

<td>

${e.status===`Pending`?`

<button class="approve-btn"
onclick="approveAccount('${e.account_id}')">

Approve

</button>

<button class="decline-btn"
onclick="declineAccount('${e.account_id}')">

Decline

</button>

`:`-`}

</td>

</tr>

`).join(``),t.hidden=l.length>0}async function l(e){await fetch(`http://localhost:3001/api/auth/approve/${e}`,{method:`PUT`}),s()}async function u(e){await fetch(`http://localhost:3001/api/auth/decline/${e}`,{method:`PUT`}),s()}window.approveAccount=l,window.declineAccount=u,n.addEventListener(`input`,c),r.addEventListener(`change`,c),document.querySelector(`#menu-button`).addEventListener(`click`,()=>{document.querySelector(`#sidebar`).classList.toggle(`open`)}),s();