// =====================================
// PERSONNEL CHANGE PASSWORD
// =====================================

document.addEventListener('DOMContentLoaded', () => {

    const currentPasswordInput =
        document.getElementById('personnel-current-password');

    const newPasswordInput =
        document.getElementById('personnel-new-password');

    const confirmPasswordInput =
        document.getElementById('personnel-confirm-password');

    const changePasswordButton =
        document.getElementById('personnel-change-password-btn');


    // =====================================
    // PASSWORD SHOW / HIDE
    // =====================================

    function createPasswordToggle(input) {

        if (!input) return;

        const wrapper = document.createElement('div');

        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        input.style.paddingRight = '45px';

        const toggleButton = document.createElement('button');

        toggleButton.type = 'button';
        toggleButton.textContent = '👁️';

        toggleButton.style.position = 'absolute';
        toggleButton.style.right = '10px';
        toggleButton.style.top = '50%';
        toggleButton.style.transform = 'translateY(-50%)';
        toggleButton.style.border = 'none';
        toggleButton.style.background = 'transparent';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.fontSize = '18px';

        wrapper.appendChild(toggleButton);

        toggleButton.addEventListener('click', () => {

            if (input.type === 'password') {

                input.type = 'text';
                toggleButton.textContent = '🙈';

            } else {

                input.type = 'password';
                toggleButton.textContent = '👁️';

            }

        });

    }


    createPasswordToggle(currentPasswordInput);
    createPasswordToggle(newPasswordInput);
    createPasswordToggle(confirmPasswordInput);


    // =====================================
    // CHANGE PASSWORD
    // =====================================

    if (changePasswordButton) {

        changePasswordButton.addEventListener('click', async () => {

            const currentPassword =
                currentPasswordInput.value.trim();

            const newPassword =
                newPasswordInput.value.trim();

            const confirmPassword =
                confirmPasswordInput.value.trim();


            // =====================================
            // VALIDATION
            // =====================================

            if (!currentPassword) {

                alert('Please enter your current password.');
                currentPasswordInput.focus();
                return;

            }


            if (!newPassword) {

                alert('Please enter your new password.');
                newPasswordInput.focus();
                return;

            }


            if (!confirmPassword) {

                alert('Please confirm your new password.');
                confirmPasswordInput.focus();
                return;

            }


            if (newPassword !== confirmPassword) {

                alert('New password and confirm password do not match.');
                confirmPasswordInput.focus();
                return;

            }


            if (newPassword.length < 6) {

                alert('New password must be at least 6 characters.');
                newPasswordInput.focus();
                return;

            }


            // =====================================
            // GET LOGGED-IN PERSONNEL
            // =====================================

            const personnelData =
                localStorage.getItem('personnel');

            if (!personnelData) {

                alert('Personnel session not found. Please login again.');
                return;

            }


            let personnel;

            try {

                personnel = JSON.parse(personnelData);

            } catch (error) {

                console.error(
                    'Invalid personnel data:',
                    error
                );

                alert('Invalid personnel session.');
                return;

            }


            const accountId =
                personnel.account_id;


            if (!accountId) {

                alert('Personnel account ID not found.');
                return;

            }


            // =====================================
            // DISABLE BUTTON
            // =====================================

            changePasswordButton.disabled = true;
            changePasswordButton.textContent = 'Changing...';


            try {

                const response = await fetch(
                    `http://localhost:3001/api/personnel/change-password/${accountId}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type': 'application/json'
                        },

                        body: JSON.stringify({
                            currentPassword,
                            newPassword
                        })
                    }
                );


                const result =
                    await response.json();


                console.log(
                    'CHANGE PASSWORD RESPONSE:',
                    result
                );


                if (!response.ok || !result.success) {

                    alert(
                        result.message ||
                        'Failed to change password.'
                    );

                    return;

                }


                // =====================================
                // SUCCESS
                // =====================================

                alert(
                    'Password changed successfully!'
                );


                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';


            } catch (error) {

                console.error(
                    'CHANGE PASSWORD ERROR:',
                    error
                );

                alert(
                    'Unable to connect to the server. Please make sure the backend server is running.'
                );

            } finally {

                changePasswordButton.disabled = false;
                changePasswordButton.textContent =
                    'Change Password';

            }

        });

    } else {

        console.error(
            'Change Password button not found.'
        );

    }

});