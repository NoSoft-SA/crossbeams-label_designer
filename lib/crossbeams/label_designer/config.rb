module Crossbeams
  module LabelDesigner
    class Config
      extend Dry::Configurable

      setting :label_sizes, {
                              'name' => 'A4', 'mm_size' => {'width': '71', 'height': '54'},
                              'name' => 'A5', 'mm_size' => {'width': '35', 'height': '21'},
                              'name' => '8464', 'mm_size' => {'width': '84', 'height': '64'},
                              'name' => 'Custom', 'mm_size' => {'width': '84', 'height': '64'}
                            }

      setting :printer_settings, [
                                  { 'printername' => 'Low Def', 'px_per_mm' => '8' },
                                  { 'printername' => 'High Def', 'px_per_mm' => '12' }
                                 ]

      setting :label_variable_types, [
                                       { 'varname' => 'Class',          'test_value' => 'PLUM' },
                                       { 'varname' => 'CLS',            'test_value' => 'test value' },
                                       { 'varname' => 'Commodity',      'test_value' => 'test value' },
                                       { 'varname' => 'Count',          'test_value' => 'test value' },
                                       { 'varname' => 'Date Code',      'test_value' => 'test value' },
                                       { 'varname' => 'Farm',           'test_value' => 'test value' },
                                       { 'varname' => 'GGN',            'test_value' => 'test value' },
                                       { 'varname' => 'Grade',          'test_value' => 'test value' },
                                       { 'varname' => 'Line',           'test_value' => 'test value' },
                                       { 'varname' => 'Orchard',        'test_value' => 'test value' },
                                       { 'varname' => 'Pallet Number',  'test_value' => 'test value' },
                                       { 'varname' => 'PHC',            'test_value' => 'test value' },
                                       { 'varname' => 'PUC',            'test_value' => 'test value' },
                                       { 'varname' => 'RMT',            'test_value' => 'test value' },
                                       { 'varname' => 'Run',            'test_value' => 'test value' },
                                       { 'varname' => 'Size',           'test_value' => 'test value' },
                                       { 'varname' => 'Variety',        'test_value' => 'Golden Delicious' },
                                       { 'varname' => 'Week',           'test_value' => '52' }
                                     ]

      setting :label_config,  {
                                labelState: 'new', # new, edit, copy, preview
                                labelName: 'xxx',
                                savePath: '/xyz',
                                labelDimension: '8464',
                                id: 1,
                                pixelPerMM: '8',
                                labelJSON: {}
                              }


    end
  end
end
