LabelOptions = (function() {
  'use strict'

  const optionsSaveButton = () => {
    drawEnv.orientation = optionsDialog.find('[name="orientation"]:checked').val();
    optionsDialog.dialog('close');
  }

  // JQUERY DIALOG USED HERE
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
    document.querySelector('#canvas_width').value = myLabelSize.width;
    document.querySelector('#canvas_height').value = myLabelSize.height;
    optionsDialog.dialog('open');
  }

  return {
    openDialog
  };

})();

// Ruan adept
