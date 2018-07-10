LabelOptions = (function () {
  let optDialog;

  document.addEventListener('DOMContentLoaded', () => {
    const dialogEl = document.getElementById('canvas-options-dialog-form');
    optDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
  });

  const optionsSaveButton = () => {
    MyLabel.orientation = document.querySelector('#canvas-options-dialog-form [name="orientation"]:checked').value;
    optDialog.hide();
  };
  document.querySelector('#canvas-options-dialog-form button.save').addEventListener('click', () => {
    optionsSaveButton();
  });

  const openOptionsPopup = () => {
    document.querySelector(`input[name='orientation'][value='${MyLabel.orientation || 'portrait'}']`).checked = true;
    document.querySelector('#canvas_width').value = sizeConfig.width;
    document.querySelector('#canvas_height').value = sizeConfig.height;
    optDialog.show();
  };
  document.querySelector('.btn-options').addEventListener('click', () => {
    openOptionsPopup();
  });
}());
