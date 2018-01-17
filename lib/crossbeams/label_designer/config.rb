module Crossbeams
  module LabelDesigner
    class Config # rubocop:disable Metrics/ClassLength
      extend Dry::Configurable

      setting :label_sizes, [
        { 'name' => '8464', 'mm_size' => { 'width': '84', 'height': '64' } },
        { 'name' => '10070', 'mm_size' => { 'width': '100', 'height': '70' } }
      ]

      setting :printer_settings, [
        { 'printername' => 'Low Def', 'px_per_mm' => '8' },
        { 'printername' => 'High Def', 'px_per_mm' => '12' }
      ]

      setting :label_variable_types, [
        { 'varname' => 'Custom variable', 'test_value' => 'undefined' },
        { 'varname' => 'Barcode and packline', 'test_value' => 'undefined' },
        { 'varname' => 'Commodity', 'test_value' => 'undefined' },
        { 'varname' => 'Commodity Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Commodity Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Commodity Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Commodity TM Description', 'test_value' => 'undefined' },
        { 'varname' => 'Container ID', 'test_value' => 'undefined' },
        { 'varname' => 'Count text', 'test_value' => 'undefined' },
        { 'varname' => 'Country', 'test_value' => 'undefined' },
        { 'varname' => 'Date Code', 'test_value' => 'undefined' },
        { 'varname' => 'Decrypted Container ID', 'test_value' => 'undefined' },
        { 'varname' => 'Dim. Remark', 'test_value' => 'undefined' },
        { 'varname' => 'Eurep Gap', 'test_value' => 'undefined' },
        { 'varname' => 'Eurep Gap Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'GLN', 'test_value' => 'undefined' },
        { 'varname' => 'Global Gap', 'test_value' => 'undefined' },
        { 'varname' => 'Global Gap Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Grade', 'test_value' => 'undefined' },
        { 'varname' => 'Grade Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Grade Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Grade Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Grade Sign@', 'test_value' => 'undefined' },
        { 'varname' => 'Grower ID', 'test_value' => 'undefined' },
        { 'varname' => 'Gtin Batch or Variety Barcode - (01)gtin(10)batch', 'test_value' => 'undefined' },
        { 'varname' => 'Gtin or Variety Barcode', 'test_value' => 'undefined' },
        { 'varname' => 'Industry number', 'test_value' => 'undefined' },
        { 'varname' => 'Instruction', 'test_value' => 'undefined' },
        { 'varname' => 'Inventory Code', 'test_value' => 'undefined' },
        { 'varname' => 'Inventory Code Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Inventory Remark', 'test_value' => 'undefined' },
        { 'varname' => 'Mark', 'test_value' => 'undefined' },
        { 'varname' => 'Mark Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Mark Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Mark Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Natures Choice', 'test_value' => 'undefined' },
        { 'varname' => 'Natures Choice Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'OGLLotNr', 'test_value' => 'undefined' },
        { 'varname' => 'Orchard', 'test_value' => 'undefined' },
        { 'varname' => 'Order Number', 'test_value' => 'undefined' },
        { 'varname' => 'Organization', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Long Address', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Medium Address', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Short Address', 'test_value' => 'undefined' },
        { 'varname' => 'Organization Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'PHC', 'test_value' => 'undefined' },
        { 'varname' => 'PHC Description', 'test_value' => 'undefined' },
        { 'varname' => 'PHC text', 'test_value' => 'undefined' },
        { 'varname' => 'PLU', 'test_value' => 'undefined' },
        { 'varname' => 'PUC', 'test_value' => 'undefined' },
        { 'varname' => 'PUC Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'PUC Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'PUC Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'PUC text', 'test_value' => 'undefined' },
        { 'varname' => 'Pack', 'test_value' => 'undefined' },
        { 'varname' => 'Pack Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Pack Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Pack Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Packhouse ID', 'test_value' => 'undefined' },
        { 'varname' => 'Packhouse Number', 'test_value' => 'undefined' },
        { 'varname' => 'Period (.)', 'test_value' => 'undefined' },
        { 'varname' => 'Personnel Name', 'test_value' => 'undefined' },
        { 'varname' => 'Personnel Surname', 'test_value' => 'undefined' },
        { 'varname' => 'Picking Reference', 'test_value' => 'undefined' },
        { 'varname' => 'Pool', 'test_value' => 'undefined' },
        { 'varname' => 'Pool Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Pool Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Pool Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Print Count', 'test_value' => 'undefined' },
        { 'varname' => 'Producer Group Global Gap', 'test_value' => 'undefined' },
        { 'varname' => 'Remark 1', 'test_value' => 'undefined' },
        { 'varname' => 'Remark 2', 'test_value' => 'undefined' },
        { 'varname' => 'Remark 3', 'test_value' => 'undefined' },
        { 'varname' => 'Robot Name', 'test_value' => 'undefined' },
        { 'varname' => 'Run number', 'test_value' => 'undefined' },
        { 'varname' => 'Sell By Code', 'test_value' => 'undefined' },
        { 'varname' => 'Shift', 'test_value' => 'undefined' },
        { 'varname' => 'Size Count', 'test_value' => 'undefined' },
        { 'varname' => 'Size Count Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Size Count Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Size Count Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'System time', 'test_value' => 'undefined' },
        { 'varname' => 'Target Market', 'test_value' => 'undefined' },
        { 'varname' => 'Target Market Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Target Market Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Target Market Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety', 'test_value' => 'undefined' },
        { 'varname' => 'Variety Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety TM Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety barcode', 'test_value' => 'undefined' },
        { 'varname' => 'Variety barcode Long Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety barcode Medium Description', 'test_value' => 'undefined' },
        { 'varname' => 'Variety barcode Short Description', 'test_value' => 'undefined' },
        { 'varname' => 'Voice Code Large digits', 'test_value' => 'undefined' },
        { 'varname' => 'Voice Code Small digits', 'test_value' => 'undefined' }
      ]

      setting(:label_config,
              labelState: 'new', # new, edit, copy, preview
              labelName: 'xxx',
              savePath: '/xyz',
              labelDimension: '8464',
              id: 1,
              pixelPerMM: '8',
              labelJSON: {})
    end
  end
end
