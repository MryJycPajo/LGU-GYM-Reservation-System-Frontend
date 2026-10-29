import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                     *//* empty css                             */import{t as e}from"../../client-name-BMX32YGT.js";var t=`http://localhost:3001/api/reservations`,n=`http://localhost:3001/api/payments`;function r(){let e=localStorage.getItem(`auth_token`);return e?{Authorization:`Bearer ${e}`}:{}}async function i(){let e=document.getElementById(`billing-list`);if(!e){console.error(`billing-list not found.`);return}let n=localStorage.getItem(`account_id`);if(!n){e.innerHTML=`
            <tr>
                <td colspan="5" style="text-align:center;">
                    Client account information not found.
                </td>
            </tr>
        `,console.error(`No account_id found in localStorage.`);return}try{let r=await fetch(`${t}/${encodeURIComponent(n)}`);if(!r.ok)throw Error(`Server returned ${r.status}`);let i=await r.json();if(console.log(`CLIENT BILLING DATA:`,i),!i.success||!Array.isArray(i.reservations))throw Error(`Invalid reservation data.`);let o=i.reservations;if(o.length===0){e.innerHTML=`
                <tr>
                    <td colspan="6" style="text-align:center;">
                        No payment records found.
                    </td>
                </tr>
            `;return}e.innerHTML=o.map(e=>{let t=e.reservation_id,n=e.service||`Gym Reservation`,r=Number(e.amount||0),i=e.payment_status||`Unpaid`,a=c(e.payment_date);return`
                    <tr>

                        <td>
                            #${t}
                        </td>

                        <td>
                            ${l(n)}
                        </td>

                        <td>
                            ₱${r.toLocaleString(`en-PH`,{minimumFractionDigits:2,maximumFractionDigits:2})}
                        </td>

                        <td>
                            <span class="status ${i===`Paid`?`paid`:`unpaid`}">
                                ${i}
                            </span>
                        </td>

                        <td>
                            ${a}
                        </td>

                        <td>
                            ${i===`Paid`?`<button class="table-button client-receipt-btn" type="button" data-reservation-id="${l(t)}">View Receipt</button>`:`—`}
                        </td>

                    </tr>
                `}).join(``),e.querySelectorAll(`.client-receipt-btn`).forEach(e=>{e.addEventListener(`click`,()=>a(e.dataset.reservationId))})}catch(t){console.error(`Client billing error:`,t),e.innerHTML=`
            <tr>
                <td colspan="6" style="text-align:center;">
                    Unable to load payment records.
                </td>
            </tr>
        `}}async function a(e){try{let t=await fetch(`${n}/${encodeURIComponent(e)}/receipt`,{headers:r()}),i=await t.json();if(t.status===401)throw Error(`Your login session is missing or expired. Please log in again.`);if(t.status===403)throw Error(`You are not authorized to view this receipt.`);if(!t.ok||!i.success||!i.receipt)throw Error(i.message||`Unable to load receipt.`);o(i.receipt)}catch(e){console.error(`CLIENT RECEIPT ERROR:`,e),window.alert(e.message||`Unable to load receipt.`)}}function o(e){let t=e.client_name||`Client`;document.querySelector(`#client-receipt-initials`).textContent=t.split(/\s+/).filter(Boolean).map(e=>e[0]).join(``).slice(0,2).toUpperCase()||`C`,document.querySelector(`#client-receipt-client-name`).textContent=t,document.querySelector(`#client-receipt-transaction-id`).textContent=`#${e.transaction_id}`,document.querySelector(`#client-receipt-reservation-id`).textContent=`#${e.reservation_id}`,document.querySelector(`#client-receipt-rental-date`).textContent=c(e.reservation_date),document.querySelector(`#client-receipt-rental-days`).textContent=e.rental_days?`${e.rental_days} day${e.rental_days===1?``:`s`}`:`—`,document.querySelector(`#client-receipt-daily-rate`).textContent=s(e.daily_rate),document.querySelector(`#client-receipt-amount`).textContent=s(e.amount),document.querySelector(`#client-receipt-payment-date`).textContent=c(e.payment_date),document.querySelector(`#client-receipt-payment-method`).textContent=e.payment_method||`—`,document.querySelector(`#client-receipt-modal`).classList.add(`show`)}function s(e){return e==null||e===``?`—`:`₱${Number(e).toLocaleString(`en-PH`,{minimumFractionDigits:2,maximumFractionDigits:2})}`}function c(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?`—`:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function l(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}document.addEventListener(`DOMContentLoaded`,()=>{let t=document.querySelector(`#client-receipt-modal`),n=()=>t?.classList.remove(`show`);document.querySelector(`#client-receipt-close`)?.addEventListener(`click`,n),document.querySelector(`#client-receipt-close-action`)?.addEventListener(`click`,n),t?.addEventListener(`click`,e=>{e.target===t&&n()}),e(),i()});