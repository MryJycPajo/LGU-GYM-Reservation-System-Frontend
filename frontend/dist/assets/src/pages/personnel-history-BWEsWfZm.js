import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                      */var e=`http://localhost:3001/api/reservations`,t=JSON.parse(localStorage.getItem(`personnel`)||`null`);if(t){let e=`${t.firstname||``} ${t.lastname||``}`.trim(),n=document.querySelector(`#personnel-history-name`),r=document.querySelector(`#personnel-history-avatar`);n&&(n.textContent=e||`Personnel`),r&&t.firstname&&(r.textContent=t.firstname.charAt(0).toUpperCase())}function n(e){if(!e)return`—`;let t=new Date(e);return Number.isNaN(t.getTime())?e:t.toLocaleDateString(`en-US`,{month:`short`,day:`numeric`,year:`numeric`})}function r(e){if(!e)return`—`;let t=String(e).split(`:`);if(t.length<2)return e;let n=Number(t[0]),r=n>=12?`PM`:`AM`;return n=n%12||12,`${n}:${t[1]} ${r}`}function i(e){return String(e??`—`).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function a(e){return e===`Approved`||e===`Completed`?`approved`:e===`Declined`?`declined`:`pending-approval`}async function o(){let t=document.querySelector(`#personnel-history-list`);if(t)try{let o=await(await fetch(e)).json();if(!o.success)throw Error(o.message||`Unable to load reservation history.`);let s=(o.reservations||[]).filter(e=>e.status===`Completed`);if(s.length===0){t.innerHTML=`<tr><td colspan="10">No reservation history found.</td></tr>`;return}t.innerHTML=s.map(e=>`
            <tr>
                <td>#${i(e.reservation_id)}</td>
                <td>${i(e.client_name)}</td>
                <td>${i(e.service)}</td>
                <td>${i(e.purpose)}</td>
                <td>${n(e.reservation_date)}</td>
                <td>${r(e.reservation_time)}</td>
                <td>${r(e.end_time)}</td>
                <td>${i(e.participants)}</td>
                <td><span class="status ${a(e.status)}">${i(e.status)}</span></td>
                <td><span class="status">${i(e.payment_status)}</span></td>
            </tr>
        `).join(``)}catch(e){console.error(`PERSONNEL HISTORY ERROR:`,e),t.innerHTML=`<tr><td colspan="10">Unable to load reservation history.</td></tr>`}}o();