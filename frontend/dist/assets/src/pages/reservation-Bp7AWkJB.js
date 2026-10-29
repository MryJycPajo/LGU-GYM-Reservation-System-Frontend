import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                             */import{t as e}from"../../client-name-BMX32YGT.js";var t=localStorage.getItem(`account_id`),n={},r=[];try{n=JSON.parse(localStorage.getItem(`client`)||`{}`)}catch(e){console.error(`CLIENT SESSION DATA ERROR:`,e)}e(),t||(alert(`Your account session was not found. Please login again.`),window.location.href=`../login.html`);async function i(){let e=document.querySelector(`#client-reservations`);if(e)try{let n=await(await fetch(`http://localhost:3001/api/reservations/${t}`)).json();if(console.log(`CLIENT RESERVATIONS RESPONSE:`,n),!n.success){e.innerHTML=`
                <tr>
                    <td colspan="8">
                        Unable to load your reservations.
                    </td>
                </tr>
            `;return}if(r=n.reservations||[],r.length===0){e.innerHTML=`
                <tr>
                    <td colspan="8">
                        You have no reservations yet.
                    </td>
                </tr>
            `;return}a(),document.querySelector(`#reservation-search-input`)?.addEventListener(`input`,a)}catch(t){console.error(`CLIENT RESERVATIONS ERROR:`,t),e.innerHTML=`
            <tr>
                <td colspan="8">
                    Cannot connect to the server.
                </td>
            </tr>
        `}}function a(){let e=document.querySelector(`#client-reservations`),t=o(document.querySelector(`#reservation-search-input`)?.value||``),i=r.filter(e=>{if(!t)return!0;let r=[e.client_name,e.firstname,e.lastname,n.firstname,n.lastname].filter(Boolean).join(` `),i=String(e.reservation_id||``),a=String(e.reservation_date||``),c=s(e.reservation_date);return[r,i,`#${i}`,a,c].some(e=>o(e).includes(t))});if(!i.length){e.innerHTML=`<tr><td colspan="8">No matching reservations found.</td></tr>`;return}e.innerHTML=``,i.forEach(t=>{let n=document.createElement(`tr`);n.innerHTML=`
                <td>
                    #${f(t.reservation_id)}
                </td>

                <td>
                    ${f(t.service||`—`)}
                </td>

                <td>
                    ${f(t.purpose||`—`)}
                </td>

                <td>
                    ${s(t.reservation_date)}
                </td>

                <td>
                    ${f(t.participants??`—`)}
                </td>
                <td>
                    <span class="status ${l(t.status)}">
                        ${f(t.status||`—`)}
                    </span>
                </td>
                <td>
                    <span class="status ${u(t.payment_status)}">
                        ${f(t.payment_status||`—`)}
                    </span>
                </td>
                <td>
                    <button
                        class="table-button view-reservation-btn"
                        type="button"
                        data-id="${t.reservation_id}"
                    >
                        View
                    </button>
                </td>
            `,e.appendChild(n)}),document.querySelectorAll(`.view-reservation-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.id,n=r.find(e=>String(e.reservation_id)===String(t));n&&d(n)})})}function o(e){return String(e).trim().replace(/\s+/g,` `).toLowerCase()}function s(e){if(!e)return`-`;let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function c(e){if(!e)return`-`;let t=e.split(`:`);if(t.length<2)return e;let n=parseInt(t[0],10),r=t[1],i=n>=12?`PM`:`AM`;return n=n%12||12,`${n}:${r} ${i}`}function l(e){switch(e){case`Approved`:return`approved`;case`Pending`:return`pending-approval`;case`Declined`:return`declined`;case`Completed`:return`approved`;default:return``}}function u(e){switch(e){case`Paid`:return`paid`;case`Unpaid`:return`unpaid`;default:return``}}function d(e){let r=e.reservation_details||e.details||`—`,i=[e.firstname||n.firstname,e.lastname||n.lastname].filter(Boolean).join(` `)||e.client_name||`—`,a={"#modal-reservation-id":e.reservation_id||`—`,"#modal-client-name":i,"#modal-account-id":e.account_id||t||`—`,"#modal-service":e.service||`—`,"#modal-purpose":e.purpose||`—`,"#modal-date":s(e.reservation_date),"#modal-start-time":c(e.reservation_time),"#modal-end-time":c(e.end_time),"#modal-participants":e.participants??`—`,"#modal-details":r,"#modal-status":e.status||`—`,"#modal-payment-status":e.payment_status||`—`};Object.entries(a).forEach(([e,t])=>{let n=document.querySelector(e);n&&(n.textContent=t)});let o=document.querySelector(`#message-overlay`),l=document.querySelector(`#message-title`),u=document.querySelector(`#message-ok-btn`);o&&l&&(l.textContent=`Reservation Details`,o.classList.add(`show`),u&&(u.onclick=()=>{o.classList.remove(`show`)}))}function f(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}t&&i();