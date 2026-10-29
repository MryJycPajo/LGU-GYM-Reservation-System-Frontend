import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                     */var e=document.querySelector(`#admin-history-list`),t=document.querySelector(`#admin-history-search`),n=document.querySelectorAll(`.filter-chip`),r=[],i=`all`;async function a(){if(!e){console.error(`admin-history-list not found.`);return}e.innerHTML=`
        <tr>
            <td colspan="7">
                Loading history records...
            </td>
        </tr>
    `;try{let t=await(await fetch(`http://localhost:3001/api/reservations`)).json();if(console.log(`History response:`,t),!t.success){e.innerHTML=`
                <tr>
                    <td colspan="7">
                        Failed to load history records.
                    </td>
                </tr>
            `;return}r=t.reservations.filter(e=>e.status===`Completed`),o()}catch(t){console.error(`Admin history loading error:`,t),e.innerHTML=`
            <tr>
                <td colspan="7">
                    Cannot connect to the server.
                </td>
            </tr>
        `}}function o(){if(!e)return;let n=t?.value.trim().toLowerCase()||``,a=[...r];if(i===`completed`&&(a=a.filter(e=>e.status===`Completed`)),i===`paid`&&(a=a.filter(e=>e.payment_status===`Paid`)),n&&(a=a.filter(e=>{let t=String(e.reservation_id||``).toLowerCase(),r=String(e.account_id||``).toLowerCase(),i=String(e.client_name||``).toLowerCase(),a=String(e.service||``).toLowerCase();return t.includes(n)||r.includes(n)||i.includes(n)||a.includes(n)})),a.length===0){e.innerHTML=`
            <tr>
                <td colspan="7">
                    No history records found.
                </td>
            </tr>
        `;return}e.innerHTML=a.map(e=>{let t=s(e.reservation_date),n=Number(e.amount||0).toLocaleString(`en-PH`,{minimumFractionDigits:2,maximumFractionDigits:2}),r=e.payment_status===`Paid`?`paid`:`unpaid`;return`
                    <tr>

                        <td>
                            ${t}
                        </td>

                        <td>
                            #${e.reservation_id}
                        </td>

                        <td>
                            ${c(e.client_name||e.account_id||`Unknown Client`)}
                        </td>

                        <td>
                            ${c(e.service||`—`)}
                        </td>

                        <td>
                            ₱${n}
                        </td>

                        <td>
                            <span class="status completed">
                                ${c(e.status)}
                            </span>
                        </td>

                        <td>
                            <span class="status ${r}">
                                ${c(e.payment_status||`Unpaid`)}
                            </span>
                        </td>

                    </tr>
                `}).join(``)}function s(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}t&&t.addEventListener(`input`,o),n.forEach(e=>{e.addEventListener(`click`,()=>{n.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),i=e.dataset.filter||`all`,o()})});function c(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}a();