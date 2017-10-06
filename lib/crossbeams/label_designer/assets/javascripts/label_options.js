LabelOptions = (function() {
  'use strict'

  let optDialog;

  document.addEventListener('DOMContentLoaded', function () {
    const dialogEl = document.getElementById('canvas-options-dialog-form');
    optDialog = new window.A11yDialog(dialogEl); // Add reset to onclose event....
  });

  document.querySelector('.btn-options').addEventListener('click', () => {
    optDialog.show();
  });

  document.querySelector('#canvas-options-dialog-form button.save').addEventListener('click', function() {
    optionsSaveButton();
  });

  const optionsSaveButton = () => {
    MyLabel.orientation = document.querySelector('#canvas-options-dialog-form [name="orientation"]:checked').value;
    optDialog.hide();
  }

  const openOptionsPopup = () => {
    document.querySelector(`input[name='orientation'][value='${MyLabel.orientation || "portrait"}']`).checked = true
    document.querySelector('#canvas_width').value = sizeConfig.width;
    document.querySelector('#canvas_height').value = sizeConfig.height;
    $('#canvas-options-dialog-form').PopupWindow({title: 'Label Options', autoOpen: false, height: 400, width: 350, modal: true });
    $('#canvas-options-dialog-form').PopupWindow('open');
  }

})();
