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
      def px_per_mm
        ppmm = JSON.parse(Config.config.label_config)['pixelPerMM'].to_i
        allowed_values = Config.config.printer_settings.map{|ps| ps['px_per_mm'].to_i}
        allowed_values.include?(ppmm) ? ppmm : allowed_values[0]
      end

      def render
        @barcode_types = Constants::BARCODE_TYPES
        @font_sizes = Constants::FONT_SIZES
        @label_variable_types = Config.config.label_variable_types
        file = File.join(File.dirname(__FILE__), 'assets/_label_design.html')
        eval(Erubi::Engine.new(<<-EOS).src).freeze
          #{File.read(file)}
        EOS
      end

      def javascript
        @label_config = Config.config.label_config
        @label_sizes = Config.config.label_sizes
        @font_sizes_json = Constants::FONT_SIZES.to_json
        @label_variable_types_json = Config.config.label_variable_types.to_json
        @px_per_mm = self.px_per_mm
        file_content = ''
        file_paths = [
          'assets/javascripts/variable_settings.js',
          'assets/javascripts/resize.js',
          'assets/javascripts/text_settings.js',
          'assets/javascripts/image_uploader.js',
          'assets/javascripts/undo_engine.js',
          'assets/javascripts/undo_redo_module.js',
          'assets/javascripts/canvas.js',
          'assets/javascripts/positioner.js',
          'assets/javascripts/shortcuts.js',
          'assets/javascripts/label_options.js',
          'assets/javascripts/draw_app.js',
          'assets/javascripts/clipboard.js',
          'assets/javascripts/library.js',
          'assets/javascripts/label_design.js'
        ].each do |filename|
          file = File.join(File.dirname(__FILE__), filename)
          file_content << File.read(file)
        end
        eval(Erubi::Engine.new(<<-EOS).src).freeze
        <script type="text/javascript">
          let MyLabel,
              Library,
              Canvas,
              Clipboard,
              DrawApp,
              Positioner,
              UndoEngine,
              UndoRedoModule,
              LabelOptions,
              Shortcuts,
              ImageUploader,
              MyImages,
              VariableSettings,
              TextSettings,
              Shape,
              Label;

          const labelConfig = <%= @label_config %>;
          const labelSizes = <%= @label_sizes %>;
          const fontSizes = <%= @font_sizes_json %>;
          const labelVariableTypes = <%= @label_variable_types_json %>;
          const pxPerMm = <%= @px_per_mm %>;

          const sizeConfig = labelSizes[labelConfig.labelDimension];
          let MyLabelSize = {
            width: ((sizeConfig.width !== undefined) ? sizeConfig.width*pxPerMm : 700),
            height: ((sizeConfig.height !== undefined) ? sizeConfig.height*pxPerMm : 500)
          };

          const drawEnv = {
            shifted: false,
            controlled: false,
          };

          (function() {
            #{file_content}
          })();
        </script>
        EOS
      end

      def css
        @pixel_per_millimeter = self.px_per_mm
        file_content = ''
        file_paths = [
          'assets/ruler.css',
          'assets/icons_sprite.css',
          'assets/label_design.css'
        ].each do |filename|
          file = File.join(File.dirname(__FILE__), filename)
          file_content << File.read(file)
        end
        eval(Erubi::Engine.new(<<-EOS).src).freeze
        <style>
          #{file_content}
        </style>
        EOS
      end
    end
  end
end
