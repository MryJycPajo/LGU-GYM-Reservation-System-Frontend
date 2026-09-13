import"./style-BVCvSGnQ.js";/* empty css                 */async function e(){try{let e=await(await fetch(`http://localhost:3001/api/auth/dashboard`)).json();if(!e.success)return;document.querySelector(`#total-clients`).textContent=e.totalClients,document.querySelector(`#total-personnel`).textContent=e.totalPersonnel,document.querySelector(`#pending-personnel`).textContent=e.pending,document.querySelector(`#approved-accounts`).textContent=e.approved}catch(e){console.error(e)}}e(),document.querySelector(`#menu-button`).addEventListener(`click`,()=>{document.querySelector(`#sidebar`).classList.toggle(`open`)});async function t(){let e=document.querySelector(`#dashboard-pending-list`);if(e)try{let t=await(await fetch(`http://localhost:3001/api/admin/pending`)).json();if(!t.success){console.error(t.message);return}if(e.innerHTML=``,!t.accounts||t.accounts.length===0){e.innerHTML=`
                <tr>
                    <td colspan="4" style="text-align:center;">
                        No pending accounts.
                    </td>
                </tr>
            `;return}t.accounts.forEach(t=>{let n=document.createElement(`tr`),r=`${t.firstname||``} ${t.middlename||``} ${t.lastname||``}`.replace(/\s+/g,` `).trim(),i=(t.account_type||`Client`).toLowerCase();n.innerHTML=`
                <td>
                    ${t.account_id}
                </td>

                <td>
                    ${r}
                </td>

                <td>
                    <span class="type-pill ${i}">
                        ${t.account_type}
                    </span>
                </td>

                <td>
                    <a
                        class="table-button"
                        href="./pending-approvals.html">
                        View
                    </a>
                </td>
            `,e.appendChild(n)})}catch(t){console.error(`Failed to load dashboard pending accounts:`,t),e.innerHTML=`
            <tr>
                <td colspan="4" style="text-align:center;">
                    Unable to load pending accounts.
                </td>
            </tr>
        `}}t();