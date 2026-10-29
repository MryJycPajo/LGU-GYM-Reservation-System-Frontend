import"../../modulepreload-polyfill-P2Xu9kJm.js";/* empty css                  *//* empty css                  *//* empty css                             */import"../../client-change-password-DWjXxEz6.js";/* empty css                    */var e=localStorage.getItem(`account_id`);e||(alert(`Your account session was not found. Please login again.`),window.location.href=`../login.html`);async function t(){try{let t=await(await fetch(`http://localhost:3001/api/auth/clients/${e}`)).json();if(console.log(`CLIENT PROFILE RESPONSE:`,t),!t.success){alert(t.message||`Unable to load your profile.`);return}let n=t.client;window.currentClientProfile=n,document.querySelector(`#profile-client-id`).textContent=n.account_id||`-`,document.querySelector(`#profile-status`).textContent=n.status||`-`,document.querySelector(`#profile-lastname`).textContent=n.lastname||`-`,document.querySelector(`#profile-firstname`).textContent=n.firstname||`-`,document.querySelector(`#profile-middlename`).textContent=n.middlename||`-`,document.querySelector(`#profile-birthdate`).textContent=o(n.birthdate),document.querySelector(`#profile-gender`).textContent=n.gender||`-`,document.querySelector(`#profile-address`).textContent=n.address||`-`,document.querySelector(`#profile-email`).textContent=n.email||`-`,document.querySelector(`#profile-phone`).textContent=n.phone_number||`-`,document.querySelector(`#profile-username`).textContent=n.username||`-`;let r=document.querySelector(`#client-name`);r&&(r.textContent=[n.firstname,n.lastname].filter(Boolean).join(` `)||`Client`)}catch(e){console.error(`CLIENT PROFILE ERROR:`,e),alert(`Cannot connect to the server.`)}}var n=document.querySelector(`#edit-profile-btn`);n&&n.addEventListener(`click`,r);function r(){let e=window.currentClientProfile;if(!e){alert(`Profile data is not loaded yet.`);return}console.log(`EDITING CLIENT:`,e),document.querySelector(`#profile-lastname`).innerHTML=`
        <input
            type="text"
            id="edit-lastname"
            value="${s(e.lastname||``)}"
        >
    `,document.querySelector(`#profile-firstname`).innerHTML=`
        <input
            type="text"
            id="edit-firstname"
            value="${s(e.firstname||``)}"
        >
    `,document.querySelector(`#profile-middlename`).innerHTML=`
        <input
            type="text"
            id="edit-middlename"
            value="${s(e.middlename||``)}"
        >
    `,document.querySelector(`#profile-birthdate`).innerHTML=`
        <input
            type="date"
            id="edit-birthdate"
            value="${a(e.birthdate)}"
        >
    `,document.querySelector(`#profile-gender`).innerHTML=`
        <select id="edit-gender">
            <option value="">Select Gender</option>

            <option
                value="Male"
                ${e.gender===`Male`?`selected`:``}
            >
                Male
            </option>

            <option
                value="Female"
                ${e.gender===`Female`?`selected`:``}
            >
                Female
            </option>
        </select>
    `,document.querySelector(`#profile-address`).innerHTML=`
        <input
            type="text"
            id="edit-address"
            value="${s(e.address||``)}"
        >
    `,document.querySelector(`#profile-email`).innerHTML=`
        <input
            type="email"
            id="edit-email"
            value="${s(e.email||``)}"
        >
    `,document.querySelector(`#profile-phone`).innerHTML=`
        <input
            type="text"
            id="edit-phone"
            value="${s(e.phone_number||``)}"
        >
    `,document.querySelector(`#profile-username`).innerHTML=`
        <input
            type="text"
            id="edit-username"
            value="${s(e.username||``)}"
        >
    `,n.textContent=`Save Changes`,n.removeEventListener(`click`,r),n.addEventListener(`click`,i)}async function i(){let e=localStorage.getItem(`account_id`);if(!e){alert(`Your account session was not found. Please login again.`),window.location.href=`../login.html`;return}let t=document.querySelector(`#edit-lastname`),n=document.querySelector(`#edit-firstname`),r=document.querySelector(`#edit-middlename`),i=document.querySelector(`#edit-birthdate`),a=document.querySelector(`#edit-gender`),o=document.querySelector(`#edit-address`),s=document.querySelector(`#edit-email`),l=document.querySelector(`#edit-phone`),u=document.querySelector(`#edit-username`);if(console.log(`EDIT INPUTS:`,{lastnameInput:t,firstnameInput:n,middlenameInput:r,birthdateInput:i,genderInput:a,addressInput:o,emailInput:s,phoneInput:l,usernameInput:u}),!t||!n||!r||!i||!a||!o||!s||!l||!u){alert(`Profile edit fields were not found. Please refresh the page and try again.`);return}let d=t.value.trim(),f=n.value.trim(),p=r.value.trim(),m=i.value,h=a.value,g=o.value.trim(),_=s.value.trim(),v=l.value.trim(),y=u.value.trim();if(console.log(`PROFILE DATA TO SAVE:`,{accountId:e,lastname:d,firstname:f,middlename:p,birthdate:m,gender:h,address:g,email:_,phoneNumber:v,username:y}),d===``||f===``||m===``||h===``||g===``||_===``||v===``||y===``){alert(`Please fill in all required fields.`);return}try{let t=await(await fetch(`http://localhost:3001/api/auth/clients/${e}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({lastname:d,firstname:f,middlename:p,birthdate:m,gender:h,address:g,email:_,phone_number:v,username:y})})).json();console.log(`UPDATE PROFILE RESPONSE:`,t),t.success?c(`Profile Updated!`,`Your profile information has been updated successfully.`):c(`Update Failed`,t.message||`Failed to update profile.`,`!`)}catch(e){console.error(`UPDATE PROFILE ERROR:`,e),alert(`Cannot connect to the server.`)}}function a(e){if(!e||e===`-`)return``;let t=String(e);return t.includes(`T`)?t.split(`T`)[0]:/^\d{4}-\d{2}-\d{2}$/.test(t)?t:``}function o(e){if(!e||e===`-`)return`-`;let t=String(e);return t.includes(`T`)?t.split(`T`)[0]:t}function s(e){return String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#039;`)}e&&t();function c(e,t,n=`✓`){let r=document.querySelector(`#message-overlay`),i=document.querySelector(`#message-title`),a=document.querySelector(`#message-text`),o=document.querySelector(`#message-icon`),s=document.querySelector(`#message-ok-btn`);r&&(i.textContent=e,a.textContent=t,o.textContent=n,r.classList.add(`show`),s.onclick=()=>{r.classList.remove(`show`)})}