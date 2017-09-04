LabelOptions = (function() {
  // JQUERY DIALOG USED HERE
  // I plan on just moving this into the canvas toolbar.
  'use strict'

  document.querySelector('.btn-options').addEventListener('click', () => {
    LabelOptions.openDialog();
  });

  const optionsSaveButton = () => {
    drawEnv.orientation = optionsDialog.find('[name="orientation"]:checked').val();
    optionsDialog.dialog('close');
  }

  const optionsDialog = $('#canvas-options-dialog-form').dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      'Save Options': optionsSaveButton,
      Cancel() {
        optionsDialog.dialog('close');
      },
    },
    close() {
      // Just close
    },
  });

  const openDialog = () => {
    document.querySelector('form.canvas-options').reset();
    document.querySelector('#canvas_width').value = MyLabelSize.width;
    document.querySelector('#canvas_height').value = MyLabelSize.height;
    optionsDialog.dialog('open');
  }

  return {
    openDialog
  };

})();
