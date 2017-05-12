module Crossbeams
  module LabelDesigner
    class Page
      def initialize(file_to_load = nil)
        @file_to_load = file_to_load || 'new'
      end

      # Use something like these 2 methods if we need to be able to override
      # in the host app.
      # - might be required in a multitenancy app, but probably not otherwise.
      # def json_load_path=(value)
      #   @json_load_path = value
      # end
      #
      # def json_load_path
      #   @json_load_path || Config.config.json_load_path
      # end

      # This can be changed to load the html from a file
      # and then use erb to apply the config:
      #    require 'erubi'
      #    str = Erubi::Engine.new(File.load(...))
      #    eval(str.src)
      def render
        File.read(File.join(File.dirname(__FILE__), 'assets/_label_design.html'))
      end

      def javascript
        file = File.join(File.dirname(__FILE__), 'assets/label_design.js')
        @json_save_path = Config.config.json_save_path
        eval(Erubi::Engine.new(<<-EOS).src).freeze
        <script type="text/javascript">
          #{File.read(file)}
        </script>
        EOS
      end

      def css
        file = File.join(File.dirname(__FILE__), 'assets/label_design.css')
        <<-EOS.freeze
        <style>
          #{File.read(file)}
        </style>
        EOS
      end
    end
  end
end
