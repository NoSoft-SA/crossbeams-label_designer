ImageUploader = (function() {
  'use strict'

  $('#image-dialog-form').on('close.popupwindow', function() {
    document.querySelector('form.upload-image').reset();
  });

  document.querySelector("button[name='image']").addEventListener('click', () => {
    DrawApp.clearTool();
    $('#image-dialog-form').PopupWindow({title: 'Image Uploader', autoOpen: false, height: 400, width: 350, modal: true});
    $('#image-dialog-form').PopupWindow('open');
  });

  document.querySelector('#image-dialog-form button.upload').addEventListener('click', function() {
    uploadImage();
  });

  document.querySelector('#image-dialog-form input[type="file"]').addEventListener('change', function () {
    if (this.files.length > 0) {
      document.querySelector('#image-dialog-form .notice').setAttribute('style', 'display:none;');
    } else {
      document.querySelector('#image-dialog-form .notice').removeAttribute('style');
    }
  });

  class ImageKeeper extends Array {
    constructor(...items) {
      super(...items);
      this.nextImageID = 0;
    }
    add(imageObject) {
      const imageID = this.nextID();
      this.push({
        imageId: imageID,
        width: imageObject.width,
        height: imageObject.height,
        imageSource: imageObject.src,
        object: imageObject
      });
      return imageID;
    }
    load(imageObject, oldID) {
      this.push({
        imageId: oldID,
        width: imageObject.width,
        height: imageObject.height,
        imageSource: imageObject.src,
        object: imageObject
      });
    }
    loadImages(json) {
      const imageInfo = JSON.parse(json);
      const that = this;
      // while promise, show 'please wait' .then remove notice
      imageInfo.sourceIDArray.forEach( function(sourceData){
        const img = new Image();
        img.src = sourceData.imageSource;
        img.onload = function () {
          that.load(this, sourceData.imageId);
          const shape = MyLabel.findByImageID(sourceData.imageId);
          shape.addImageAfterLoad(this);
        };
      });
      this.nextImageID = imageInfo.nextImageID;
    }
    findByID(givenID) {
      return this.find(item => item.imageId === givenID);
    }
    nextID() {
      this.nextImageID += 1;
      return this.nextImageID;
    }
    exportToJSON() {
      return JSON.stringify({nextImageID: this.nextImageID, sourceIDArray: this.sourceIDArray()});
    }
    sourceIDArray() {
      return this.map(item => {
        return {imageId: item.imageId, imageSource: item.imageSource};
      });
    }
  }

  const uploadImage = () => {
    const files = document.querySelector('#image-dialog-form input[type="file"]').files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
          const img = new Image();
          img.src = event.target.result;

          img.onload = function () {
            const imageID = MyImages.add(this);

            MyLabel.newShape('Image', imageID);
            $('#image-dialog-form').PopupWindow('close');
            document.querySelector('#image-dialog-form .notice').setAttribute('style', 'display:none;');
          };
        };
      }
    } else {
      document.querySelector('#image-dialog-form .notice').removeAttribute('style');
    }
  }

  return {
    ImageKeeper
  };

})();
