module Crossbeams
  module LabelDesigner
    class Config
      extend Dry::Configurable

      # setting :label_sizes, [{ 'name' => 'a4', 'mm_size' => {'width' => '71', 'height' => '54'} },
      #                        { 'name' => 'a5', 'mm_size' => {'width' => '35', 'height' => '21'} },
      #                        { 'name' => '8464', 'mm_size' => {'width' => '84', 'height' => '64'} },
      #                        { 'name' => 'custom', 'mm_size' => {'width' => '84', 'height' => '64'} }]
      setting :label_sizes, {
                              'A4': {'width': '71', 'height': '54'},
                              'A5': {'width': '35', 'height': '21'},
                              '8464': {'width': '84', 'height': '64'},
                              'Custom': {'width': '84', 'height': '64'}
                            }

      setting :label_variables, [{ 'varname' => 'Commodity', 'test_value' => 'PLUM' },
                                 { 'varname' => 'Variety', 'test_value' => 'Golden Delicious' }]

      setting :label_variables, [{ 'Commodity' => 'PLUM' },
                                 { 'Variety' => 'Golden Delicious' }]

      setting :label_config,  {
                                labelState: 'new', # new, edit, copy, preview
                                labelName: 'xxx',
                                labelJSON: {},
                                savePath: '/xyz',
                                labelDimension: '8464',
                                id: 1
                              }

      setting :barcode_types, {
        CODE_39: 'CODE 39',
        CODE_93: 'CODE 93',
        CODE_128: 'CODE 128',
        EAN_8: 'EAN8',
        EAN_13: 'EAN13',
        UPC_A: 'UPCa',
        UPC_E: 'UPCe',
        UPC_EAN_EXTENSION: 'UPC/EAN Extension',
        RSS_14: 'RSS 14',
        RSS_EXPANDED: 'RSS Expanded',
        QR_CODE: 'QR code',
        DATA_MATRIX: 'Data Matrix',
        PDF_417: 'PDF 417'
      }
    end
  end
end
