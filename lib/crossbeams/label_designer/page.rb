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
        @barcode_types = Config.config.barcode_types
        file = File.join(File.dirname(__FILE__), 'assets/_label_design.html')
        eval(Erubi::Engine.new(<<-EOS).src).freeze
          #{File.read(file)}
        EOS
      end

      def javascript
        @json_save_path = Config.config.label_config['save_path']
        @label_config = Config.config.label_config
        @label_sizes = Config.config.label_sizes

        file_content = ''
        file_paths = [
          'assets/javascripts/undo_engine.js',
          'assets/javascripts/undo_redo_module.js',
          'assets/javascripts/canvas.js',
          'assets/javascripts/positioner.js',
          'assets/javascripts/draw_app.js',
          'assets/javascripts/clipboard.js',
          'assets/javascripts/label_design.js'
        ].each do |filename|
          file = File.join(File.dirname(__FILE__), filename)
          file_content << File.read(file)
        end
        eval(Erubi::Engine.new(<<-EOS).src).freeze
        <script type="text/javascript">
          (function() {
            #{file_content}
          })();
        </script>
        EOS
      end

      def css
        file_content = ''
        file_paths = [
          'assets/ruler.css',
          'assets/label_design.css'
        ].each do |filename|
          file = File.join(File.dirname(__FILE__), filename)
          file_content << File.read(file)
        end
        file = File.join(File.dirname(__FILE__), 'assets/label_design.css')
        <<-EOS.freeze
        <style>
          #{file_content}
        </style>
        EOS
      end
    end
  end
end
