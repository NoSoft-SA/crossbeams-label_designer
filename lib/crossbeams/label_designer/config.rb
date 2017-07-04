module Crossbeams
  module LabelDesigner
    class Config
      extend Dry::Configurable

      setting :label_sizes, [{ 'name' => 'a4', 'mm_size' => {'width' => '71', 'height' => '54'} },
                             { 'name' => 'a5', 'mm_size' => {'width' => '35', 'height' => '21'} },
                             { 'name' => '8464', 'mm_size' => {'width' => '84', 'height' => '64'} },
                             { 'name' => 'custom', 'mm_size' => {'width' => '84', 'height' => '64'} }]

      setting :label_variables, [{ 'varname' => 'Commodity',
                                   'test_value' => 'PLUM' },
                                 { 'varname' => 'Variety',
                                   'test_value' => 'Golden Delicious' }]

      setting :label_config,  {
                                labelState: 'new', # new, edit, copy, preview
                                labelName: 'xxx',
                                labelJSON: {},
                                savePath: '/xyz'
                              }
    end
  end
end
