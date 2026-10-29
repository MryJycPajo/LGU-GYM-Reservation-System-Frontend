const form = document.querySelector('#client-change-password-form') ||
    document.querySelector('#change-password-form');

if (form) {
    const currentPasswordInput = document.querySelector('#current-password');
    const newPasswordInput = document.querySelector('#new-password');
    const confirmPasswordInput = document.querySelector('#confirm-new-password');
    const changePasswordButton = document.querySelector('#change-password-btn');
    const inlineMessage = document.querySelector('#change-password-message');
    const successModal = document.querySelector('#success-modal');
    const successMessage = document.querySelector('#success-message');
    const successOkButton = document.querySelector('#success-ok-btn');

    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const input = document.getElementById(button.dataset.target);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.textContent = isPassword ? '🙈' : '👁';
            button.setAttribute(
                'aria-label',
                isPassword
                    ? `Hide ${input.id.replaceAll('-', ' ')}`
                    : `Show ${input.id.replaceAll('-', ' ')}`
            );
            button.setAttribute('aria-pressed', String(isPassword));
        });
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const currentPassword = currentPasswordInput?.value.trim() || '';
        const newPassword = newPasswordInput?.value.trim() || '';
        const confirmPassword = confirmPasswordInput?.value.trim() || '';
        const authenticatedChange = Boolean(currentPasswordInput);

        if (authenticatedChange && !currentPassword) {
            showMessage('Please enter your current password.');
            currentPasswordInput.focus();
            return;
        }

        if (!newPassword) {
            showMessage('Please enter your new password.');
            newPasswordInput.focus();
            return;
        }

        if (!confirmPassword) {
            showMessage('Please confirm your new password.');
            confirmPasswordInput.focus();
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New password and confirm password do not match.');
            confirmPasswordInput.focus();
            return;
        }

        if (newPassword.length < 6) {
            showMessage('Password must be at least 6 characters.');
            newPasswordInput.focus();
            return;
        }

        const accountId = authenticatedChange
            ? localStorage.getItem('account_id')
            : new URLSearchParams(window.location.search).get('account_id');
        const token = localStorage.getItem('auth_token');

        if (!accountId) {
            showMessage('Your account session was not found. Please log in again.');
            return;
        }

        if (authenticatedChange && !token) {
            showMessage('Your login session is missing or expired. Please log in again.');
            return;
        }

        changePasswordButton.disabled = true;
        changePasswordButton.textContent = 'Changing...';

        try {
            const headers = { 'Content-Type': 'application/json' };

            if (authenticatedChange) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(
                authenticatedChange
                    ? 'http://localhost:3001/api/auth/change-password'
                    : 'http://localhost:3001/api/auth/set-password',
                {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(authenticatedChange
                        ? {
                            account_id: accountId,
                            current_password: currentPassword,
                            new_password: newPassword
                        }
                        : {
                            account_id: accountId,
                            new_password: newPassword
                        })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                showMessage(result.message || 'Failed to change password.');
                return;
            }

            form.reset();

            if (authenticatedChange) {
                showMessage(result.message || 'Password changed successfully.', true);
            } else {
                showStandaloneSuccess(result.message || 'Your password has been successfully changed.');
            }
        } catch (error) {
            console.error('CHANGE PASSWORD ERROR:', error);
            showMessage('Unable to connect to the server. Please try again.');
        } finally {
            changePasswordButton.disabled = false;
            changePasswordButton.textContent = 'Change Password';
        }
    });

    function showMessage(message, success = false) {
        if (inlineMessage) {
            inlineMessage.textContent = message;
            inlineMessage.className = `change-password-message ${success ? 'success' : 'error'}`;
            return;
        }

        if (successMessage && successModal) {
            successMessage.textContent = message;
            successModal.classList.add('show');
        }
    }

    function showStandaloneSuccess(message) {
        if (!successMessage || !successModal) return;

        successMessage.textContent = message;
        successModal.classList.add('show');

        if (successOkButton) {
            successOkButton.onclick = () => {
                window.location.href = '../login.html';
            };
        }
    }
}
