import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                             */var e=document.querySelector(`#menu-button`),t=document.querySelector(`#sidebar`);e&&t&&e.addEventListener(`click`,()=>{t.classList.toggle(`open`)});var n=JSON.parse(localStorage.getItem(`client`));if(!n)console.log(`No client session found`);else{let e=`${n.firstname||``} ${n.lastname||``}`.trim(),t=document.querySelector(`#client-name`);t&&(t.textContent=e||`Client`);let i=document.querySelector(`.profile-avatar`);i&&n.firstname&&(i.textContent=n.firstname.charAt(0).toUpperCase());let a=document.querySelector(`#welcome-title`);a&&(a.textContent=`Welcome, ${e||`Client`}!`),r(n.account_id)}async function r(e){if(!e){console.error(`No account_id found in client session.`);return}try{console.log(`Loading reservations for account:`,e);let t=await(await fetch(`http://localhost:3001/api/reservations/${e}`)).json();if(console.log(`Client reservations response:`,t),!t.success){console.error(t.message||`Failed to load reservations.`);return}let n=t.reservations||[],r=n.length,s=n.filter(e=>e.status===`Pending`).length,c=n.filter(e=>e.status===`Completed`).length,l=document.querySelector(`#total-reservations`);l&&(l.textContent=r);let u=document.querySelector(`#pending-reservations`);u&&(u.textContent=s);let d=document.querySelector(`#completed-reservations`);d&&(d.textContent=c);let f=document.querySelector(`#recent-reservations-list`);if(!f){console.warn(`recent-reservations-list not found.`);return}if(n.length===0){f.innerHTML=`
                <tr>
                    <td colspan="3"
                        style="text-align: center;">
                        No reservations yet.
                    </td>
                </tr>
            `;return}f.innerHTML=n.slice(0,5).map(e=>{let t=i(e.reservation_date),n=a(e.status);return`
                        <tr>

                            <td>
                                ${t}
                            </td>

                            <td>
                                ${o(e.service)}
                            </td>

                            <td>
                                <span class="status ${n}">
                                    ${e.status}
                                </span>
                            </td>

                        </tr>
                    `}).join(``)}catch(e){console.error(`Error loading client reservations:`,e)}}function i(e){if(!e)return`-`;let t=new Date(e);return isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function a(e){switch(e){case`Completed`:return`completed`;case`Approved`:return`approved`;case`Pending`:return`pending-approval`;case`Declined`:return`declined`;default:return``}}function o(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}var s=document.querySelector(`#submit-reservation-btn`),c=document.querySelector(`#reservation-service`),l=document.querySelector(`#reservation-date`),u=document.querySelector(`#reservation-time`),d=document.querySelector(`#reservation-details`);s&&s.addEventListener(`click`,async()=>{let e=JSON.parse(localStorage.getItem(`client`));if(!e){alert(`Please log in first.`);return}if(!c||!l||!u){console.error(`Reservation form elements not found.`);return}if(!c.value||!l.value||!u.value){alert(`Please complete the reservation details.`);return}let t={account_id:e.account_id,service:c.value,reservation_date:l.value,reservation_time:u.value,reservation_details:d?d.value:null};console.log(`Sending reservation:`,t);try{let n=await(await fetch(`http://localhost:3001/api/reservations`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)})).json();if(console.log(`Reservation response:`,n),!n.success){alert(n.message||`Failed to submit reservation.`);return}alert(`Reservation submitted successfully!\n\nReservation ID: ${n.reservation_id}`),l.value=``,u.value=``,d&&(d.value=``),e.account_id&&r(e.account_id)}catch(e){console.error(`Reservation submission error:`,e),alert(`Cannot connect to the server.`)}});