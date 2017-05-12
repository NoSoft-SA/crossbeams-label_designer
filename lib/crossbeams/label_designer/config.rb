module Crossbeams
  module LabelDesigner
    class Config
      extend Dry::Configurable

      setting :json_load_path # Expect Konva JSON to load from
      setting :json_create_path # Expect name
      setting :json_save_path # return image, Konva json & xml all as JSON

      setting :label_sizes, [{ 'name' => 'a4', 'mm_size' => '71x54' },
                             { 'name' => 'a5', 'mm_size' => '35x21' }]

      setting :label_variables, [{ 'varname' => 'Commodity',
                                   'test_value' => 'PLUM' },
                                 { 'varname' => 'Variety',
                                   'test_value' => 'Golden Delicious' }]
    end
  end
end
