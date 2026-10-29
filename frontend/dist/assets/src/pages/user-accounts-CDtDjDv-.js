import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                     */var e=document.querySelector(`#accounts-body`),t=document.querySelector(`#empty-state`),n=document.querySelector(`#search-input`),r=document.querySelector(`#filter-select`),i=document.querySelector(`#account-count`),a=[],o=!1;function s(){let e=localStorage.getItem(`auth_token`);return e?{Authorization:`Bearer ${e}`}:{}}function c(e){localStorage.removeItem(`auth_token`),alert(e),window.location.href=`./login.html`}function l(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}function u(n){e.innerHTML=`<tr><td colspan="5" style="text-align:center;">${l(n)}</td></tr>`,t.hidden=!0}function d(){let o=n.value.toLowerCase().trim(),s=r.value,c=a.filter(e=>{let t=e.account_type||e.role||``,n=e.status||``,r=`${e.account_id||``} ${e.username||``} ${t} ${n}`.toLowerCase();return o&&!r.includes(o)?!1:s===`all`?!0:s===`client`?t.toLowerCase()===`client`:s===`personnel`?t.toLowerCase()===`personnel`:n.toLowerCase()===s});if(i.textContent=`${c.length} account(s)`,t.hidden=c.length>0,!c.length){e.innerHTML=``;return}e.innerHTML=c.map(e=>{let t=e.account_type||e.role||`-`,n=e.status||`-`;return`
            <tr>
                <td>${l(e.account_id||`-`)}</td>
                <td>${l(e.username||`-`)}</td>
                <td>
                    <span class="password-mask">••••••••</span>
                    <button
                        class="password-toggle"
                        type="button"
                        data-account-id="${l(e.account_id)}"
                        aria-label="Password is unavailable; use the secure password reset workflow"
                        aria-pressed="false"
                        title="Passwords cannot be revealed. Use the secure password reset workflow.">
                        ◉
                    </button>
                </td>
                <td>${l(t)}</td>
                <td><span class="status ${n.toLowerCase()===`pending`?`pending-approval`:n.toLowerCase()}">${l(n)}</span></td>
            </tr>
        `}).join(``)}async function f(){if(!o){if(!localStorage.getItem(`auth_token`)){c(`Your session has expired. Please log in again.`);return}o=!0,u(`Loading accounts...`);try{let e=await fetch(`http://localhost:3001/api/auth/accounts`,{headers:s()}),t=await e.json();if(e.status===401){c(`Your session has expired. Please log in again.`);return}if(!e.ok||!t.success)throw Error(t.message||`Failed to load user accounts.`);a=Array.isArray(t.users)?t.users:[],d()}catch(e){console.error(`Failed to load user accounts:`,e),u(e.message||`Cannot connect to server.`)}finally{o=!1}}}e.addEventListener(`click`,e=>{let t=e.target.closest(`.password-toggle`);if(!t)return;let n=t.getAttribute(`aria-pressed`)===`true`;t.setAttribute(`aria-pressed`,String(!n)),n||alert(`Passwords are stored securely and cannot be revealed. Use the secure password reset workflow instead.`)}),n.addEventListener(`input`,d),r.addEventListener(`change`,d),document.querySelector(`#menu-button`).addEventListener(`click`,()=>{document.querySelector(`#sidebar`).classList.toggle(`open`)}),f();