module Crossbeams
  module LabelDesigner
    class Config
      extend Dry::Configurable

      setting :allow_compound_variable, default: true

      setting :label_sizes, default: [
        { 'name' => '8464', 'mm_size' => { 'width': '84', 'height': '64' } },
        { 'name' => '10070', 'mm_size' => { 'width': '100', 'height': '70' } }
      ]

      setting :printer_settings, default: [
        { 'printername' => 'Low Def', 'px_per_mm' => '8' },
        { 'printername' => 'High Def', 'px_per_mm' => '12' }
      ]

      setting :label_variable_types, default: {
              'Barcodes' => ['Barcode and packline'],
              'Commodity' => ['Commodity', 'Commodity Short Description', 'Commodity Medium Description', 'Commodity Long Description', 'Commodity TM Description'],
              'Container' => ['Container ID', 'Decrypted Container ID'],
              'Country' => ['Country'],
              'Custom' => ['Custom Variable'],
              'Date Code' => ['Date Code'],
              'Eurep Gap' => ['Eurep Gap', 'Eurep Gap Short Description'],
              'Global Gap' => ['Global Gap', 'Global Gap Short Description', 'Producer Group Global Gap'],
              'Grade Sign' => ['Grade Sign@'],
              'Grade' => ['Grade', 'Grade Short Description', 'Grade Medium Description', 'Grade Long Description'],
              'Grower ID' => ['Grower ID'],
              'Gtin' => ['Gtin Batch or Variety Barcode - (01)gtin(10)batch', 'Gtin or Variety Barcode'],
              'Industry number' => ['Industry number'],
              'Instruction' => ['Instruction'],
              'Inventory Code' => ['Inventory Code', 'Inventory Code Short Description'],
              'Mark' => ['Mark', 'Mark Short Description', 'Mark Medium Description', 'Mark Long Description'],
              'Natures Choice' => ['Natures Choice', 'Natures Choice Short Description'],
              'OGLLotNr' => ['OGLLotNr'],
              'Order Number' => ['Order Number'],
              'Organization' => ['Organization', 'GLN', 'Organization Short Description', 'Organization Medium Description', 'Organization Long Description', 'Organization Short Address', 'Organization Medium Address', 'Organization Long Address'],
              'PLU' => ['PLU'],
              'PUC' => ['PUC', 'PUC Short Description', 'PUC Medium Description', 'PUC Long Description', 'Orchard'],
              'Pack' => ['Pack', 'Pack Short Description', 'Pack Medium Description', 'Pack Long Description'],
              'Packhouse' => ['Packhouse ID', 'Packhouse Number', 'PHC', 'PHC Description'],
              'Personnel' => ['Personnel Name', 'Personnel Surname'],
              'Picking Reference' => ['Picking Reference'],
              'Pool' => ['Pool', 'Pool Short Description', 'Pool Medium Description', 'Pool Long Description'],
              'Remarks' => ['Remark 1', 'Remark 2', 'Remark 3', 'Dim. Remark', 'Inventory Remark'],
              'Robot' => ['Robot Name'],
              'Run number' => ['Run number'],
              'Sell By Code' => ['Sell By Code'],
              'Shift' => ['Shift'],
              'Size Count' => ['Size Count', 'Print Count', 'Size Count Short Description', 'Size Count Medium Description', 'Size Count Long Description'],
              'Static' => ['PHC text', 'PUC text', 'Count text', 'Period (.)'],
              'System' => ['System time'],
              'Target Market' => ['Target Market', 'Target Market Short Description', 'Target Market Medium Description', 'Target Market Long Description'],
              'Variety barcode' => ['Variety barcode', 'Variety barcode Short Description', 'Variety barcode Medium Description', 'Variety barcode Long Description'],
              'Variety' => ['Variety', 'Variety Short Description', 'Variety Medium Description', 'Variety Long Description', 'Variety TM Description'],
              'Voice Code' => ['Voice Code Large digits', 'Voice Code Small digits']
      }

      setting(:save_path, default: nil)
      setting(:label_name, default: 'test_label')
      setting(:width, default: 100)
      setting(:height, default: 100)
      setting(:label_dimension, default: '100x100')
      setting(:pixels_mm, default: 8)
      setting(:help_url, default: nil)
      setting(:label_json, default: nil)
    end
  end
end
