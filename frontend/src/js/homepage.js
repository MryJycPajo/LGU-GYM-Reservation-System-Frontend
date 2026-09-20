const trigger = document.querySelector('#register-trigger');
const modal = document.querySelector('#registration-modal');
const closeButton = document.querySelector('#registration-modal-close');
const cancelButton = document.querySelector('#registration-modal-cancel');
const firstOption = modal.querySelector('.account-option');

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  trigger.focus();
}

function openModal() {
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  closeButton.focus();
}

trigger.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);
cancelButton.addEventListener('click', closeModal);

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (!modal.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab' && event.shiftKey && document.activeElement === closeButton) {
    event.preventDefault();
    firstOption.focus();
  }
});