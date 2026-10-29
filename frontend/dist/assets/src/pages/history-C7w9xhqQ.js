import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                             */import{t as e}from"../../client-name-BMX32YGT.js";var t=`http://localhost:3001/api/reservations`;document.addEventListener(`DOMContentLoaded`,()=>{e(),n()});async function n(){let e=document.getElementById(`history-list`);if(!e){console.error(`History list element not found.`);return}let n=localStorage.getItem(`account_id`);if(!n){e.innerHTML=`
            <tr>
                <td colspan="5" style="text-align: center;">
                    No account information found.
                </td>
            </tr>
        `,console.error(`No account_id found in localStorage.`);return}try{let a=await fetch(`${t}/${encodeURIComponent(n)}`);if(!a.ok)throw Error(`Failed to load reservation history.`);let o=await a.json();if(!o.success||!Array.isArray(o.reservations))throw Error(`Invalid reservation data.`);let s=o.reservations.filter(e=>e.status===`Completed`);if(s.length===0){e.innerHTML=`
                <tr>
                    <td colspan="5" style="text-align: center;">
                        No completed reservations yet.
                    </td>
                </tr>
            `;return}e.innerHTML=s.map(e=>{let t=e.reservation_id,n=r(e.reservation_date),a=e.service||`Gym Reservation`,o=e.payment_status||`Unpaid`;return`
                    <tr>
                        <td>
                            #${t}
                        </td>

                        <td>
                            ${n}
                        </td>

                        <td>
                            ${i(a)}
                        </td>

                        <td>
                            <span class="status completed">
                                ${i(e.status||`—`)}
                            </span>
                        </td>

                        <td>
                            <span class="status ${o===`Paid`?`paid`:`pending-approval`}">
                                ${i(o)}
                            </span>
                        </td>
                    </tr>
                `}).join(``)}catch(t){console.error(`Error loading history:`,t),e.innerHTML=`
            <tr>
                <td colspan="5" style="text-align: center;">
                    Unable to load reservation history.
                </td>
            </tr>
        `}}function r(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function i(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}