document.addEventListener('DOMContentLoaded', function () {
  const confirmButton = document.getElementById('confirm-delete-button');
  const deleteForm = document.getElementById('delete-account-form');

  if (confirmButton && deleteForm) {
    confirmButton.addEventListener('click', function () {
      deleteForm.submit();
    });
  }
});
