import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                     */var e=`http://localhost:3001/api/reservations`,t=[],n=`All`;async function r(){let n=document.querySelector(`#admin-reservations-list`);if(!n){console.error(`admin-reservations-list not found.`);return}try{let r=await(await fetch(e)).json();if(console.log(`ADMIN RESERVATIONS RESPONSE:`,r),!r.success){n.innerHTML=`
                <tr>
                    <td colspan="7">
                        Unable to load reservations.
                    </td>
                </tr>
            `;return}t=r.reservations||[],i()}catch(e){console.error(`ADMIN RESERVATIONS ERROR:`,e),n.innerHTML=`
            <tr>
                    <td colspan="7">
                    Cannot connect to the server.
                </td>
            </tr>
        `}}function i(){let e=document.querySelector(`#admin-reservations-list`),r=document.querySelector(`#admin-reservation-search`);if(!e)return;let i=r?r.value.toLowerCase().trim():``,o=t.filter(e=>{if(n!==`All`&&e.status!==n)return!1;if(i!==``){let t=String(e.reservation_id).toLowerCase(),n=String(e.client_name||``).toLowerCase();return t.includes(i)||n.includes(i)}return!0});if(o.length===0){e.innerHTML=`
            <tr>
                <td colspan="7">
                    No reservations found.
                </td>
            </tr>
        `;return}e.innerHTML=o.map(e=>`
            <tr>

                <td>
                    #${e.reservation_id}
                </td>

                <td>
                    ${g(e.client_name||`-`)}
                </td>

                <td>
                    ${g(e.service||`-`)}
                </td>

                <td>
                    ${m(e.reservation_date)}
                </td>

                <td>
                    <span class="status ${f(e.status)}">
                        ${g(e.status||`-`)}
                    </span>
                </td>

                <td>
                    <span class="status ${p(e.payment_status)}">
                        ${g(e.payment_status||`-`)}
                    </span>
                </td>

                <td>

                    <!-- VIEW -->
                    <button
                        class="table-button view-reservation-btn"
                        type="button"
                        data-id="${e.reservation_id}"
                    >
                        View
                    </button>

                    <!-- APPROVE / DECLINE -->
                    ${e.status===`Pending`?`
                            <button
                                class="table-button approve-btn"
                                type="button"
                                data-id="${e.reservation_id}"
                            >
                                Approve
                            </button>

                            <button
                                class="table-button decline-btn"
                                type="button"
                                data-id="${e.reservation_id}"
                            >
                                Decline
                            </button>
                        `:``}

                    <!-- COMPLETE -->
                    ${e.status===`Approved`&&e.payment_status===`Paid`?`
                            <button
                                class="table-button complete-btn"
                                type="button"
                                data-id="${e.reservation_id}"
                            >
                                Complete
                            </button>
                        `:``}

                </td>

            </tr>
        `).join(``),a()}function a(){document.querySelectorAll(`.view-reservation-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.id,r=t.find(e=>String(e.reservation_id)===String(n));r&&l(r)})}),document.querySelectorAll(`.approve-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.id;t.find(e=>String(e.reservation_id)===String(n))&&await o(n,`Approved`)})}),document.querySelectorAll(`.decline-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.id;t.find(e=>String(e.reservation_id)===String(n))&&await o(n,`Declined`)})}),document.querySelectorAll(`.complete-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id;await o(t,`Completed`)})})}async function o(t,n){try{let i=await(await fetch(`${e}/${t}/status`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:n})})).json();if(console.log(`STATUS UPDATE RESPONSE:`,i),!i.success){_(`Update Failed`,i.message||`Unable to update reservation.`,`!`);return}let a=``;a=n===`Approved`?`Reservation #${t} has been approved successfully.`:n===`Declined`?`Reservation #${t} has been declined.`:n===`Completed`?`Reservation #${t} has been marked as completed.`:`Reservation #${t} has been updated successfully.`,_(`Reservation ${n}`,a,`✓`),await r()}catch(e){console.error(`Update reservation status error:`,e),_(`Server Error`,`Cannot connect to the server.`,`!`)}}function s(){let e=document.querySelectorAll(`.filter-chip`);e.forEach(t=>{t.addEventListener(`click`,()=>{e.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),n=t.textContent.trim(),i()})})}function c(){let e=document.querySelector(`#admin-reservation-search`);e&&e.addEventListener(`input`,()=>{i()})}function l(e){let t=document.querySelector(`#reservation-modal`);if(!t){console.error(`Reservation modal not found.`);return}document.querySelector(`#modal-reservation-id`).textContent=`#${e.reservation_id}`,document.querySelector(`#modal-client-name`).textContent=e.client_name||`-`,document.querySelector(`#modal-account-id`).textContent=e.account_id||`-`,document.querySelector(`#modal-service`).textContent=e.service||`-`,document.querySelector(`#modal-date`).textContent=m(e.reservation_date),document.querySelector(`#modal-time`).textContent=h(e.reservation_time),document.querySelector(`#modal-end-time`).textContent=h(e.end_time),document.querySelector(`#modal-status`).textContent=e.status||`-`,document.querySelector(`#modal-payment`).textContent=e.payment_status||`-`,document.querySelector(`#modal-details`).textContent=e.reservation_details||`No reservation details provided.`,t.classList.add(`show`)}function u(){let e=document.querySelector(`#reservation-modal`);e&&e.classList.remove(`show`)}function d(){let e=document.querySelector(`#close-reservation-modal`),t=document.querySelector(`#modal-close-btn`),n=document.querySelector(`#reservation-modal`);e&&e.addEventListener(`click`,u),t&&t.addEventListener(`click`,u),n&&n.addEventListener(`click`,e=>{e.target===n&&u()})}function f(e){switch(e){case`Approved`:return`approved`;case`Pending`:return`pending-approval`;case`Declined`:return`declined`;case`Completed`:return`approved`;default:return``}}function p(e){switch(e){case`Paid`:return`paid`;case`Unpaid`:return`unpaid`;default:return``}}function m(e){if(!e)return`-`;let t=new Date(e);return isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function h(e){if(!e)return`-`;let t=e.split(`:`);if(t.length<2)return e;let n=parseInt(t[0],10),r=t[1],i=n>=12?`PM`:`AM`;return n%=12,n===0&&(n=12),`${n}:${r} ${i}`}function g(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function _(e,t,n=`✓`){let r=document.querySelector(`#message-overlay`),i=document.querySelector(`#message-title`),a=document.querySelector(`#message-text`),o=document.querySelector(`#message-icon`),s=document.querySelector(`#message-ok-btn`);if(!r){console.error(`message-overlay not found.`);return}i&&(i.textContent=e),a&&(a.textContent=t),o&&(o.textContent=n),r.classList.add(`show`),s&&(s.onclick=()=>{r.classList.remove(`show`)})}document.addEventListener(`DOMContentLoaded`,()=>{s(),c(),d(),r()});