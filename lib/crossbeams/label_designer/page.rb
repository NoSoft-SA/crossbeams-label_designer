module Crossbeams
  module LabelDesigner
    class Page # rubocop:disable Metrics/ClassLength
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
        # ppmm = JSON.parse(Config.config.label_config)['pixelPerMM'].to_i
        # allowed_values = Config.config.printer_settings.map { |ps| ps['px_per_mm'].to_i }
        # allowed_values.include?(ppmm) ? ppmm : allowed_values[0]
        raise %(Pixels per mm value of "#{Config.config.pixels_mm}" is not allowed) unless [8, 12].include?(Config.config.pixels_mm)

        Config.config.pixels_mm
      end

      def font_sizes
        px_per_mm == 12 ? Constants::FONT_SIZES_12PXMM : Constants::FONT_SIZES_8PXMM
      end

      def render
        @barcode_types = Constants::BARCODE_TYPES
        @font_sizes = font_sizes
        @label_variable_types = Config.config.label_variable_types
        @allow_compound_variable = Config.config.allow_compound_variable
        @px_per_mm = px_per_mm

        file = File.join(File.dirname(__FILE__), 'assets/_designer.html')
        eval(Erubi::Engine.new(<<-HTML).src).encode('UTF-8').freeze
          #{File.read(file, encoding: 'UTF-8')}
        HTML
      end

      def javascript # rubocop:disable Metrics/AbcSize
        # @label_config = Config.config.label_config # include version (1 for new, else from label... --> this should just be the labelJSON
        # @label_sizes = Config.config.label_sizes
        # @font_sizes_json = font_sizes.to_json
        # @default_font_px = font_sizes.key(8)
        # @default_font_pt = 8
        # @label_variable_types_json = Config.config.label_variable_types.to_json
        # @px_per_mm = px_per_mm
        # cf = JSON.parse(@label_config)
        # ls = JSON.parse(@label_sizes)
        # @w = ls[cf['labelDimension']]['width']
        # @h = ls[cf['labelDimension']]['height']
        # p ls[cf['labelDimension']]
        # p cf
        # @w = 100
        # @h = 100
        file_content = ''
        # [
        #   'assets/javascripts/variable_settings.js',
        #   'assets/javascripts/resize.js',
        #   'assets/javascripts/text_settings.js',
        #   'assets/javascripts/image_uploader.js',
        #   'assets/javascripts/undo_engine.js',
        #   'assets/javascripts/undo_redo_module.js',
        #   'assets/javascripts/canvas.js',
        #   'assets/javascripts/positioner.js',
        #   'assets/javascripts/shortcuts.js',
        #   'assets/javascripts/label_options.js',
        #   'assets/javascripts/draw_app.js',
        #   'assets/javascripts/clipboard.js',
        #   'assets/javascripts/library.js',
        #   'assets/javascripts/label_design.js'
        # ].each do |filename|
        #   file = File.join(File.dirname(__FILE__), filename)
        #   file_content << File.read(file, encoding: 'UTF-8')
        # end
        #     const labelSizes = <%= @label_sizes %>;
        #     const fontSizes = <%= @font_sizes_json %>;
        #     // const labelVariableTypes = <%= @label_variable_types_json %>;
        #     const pxPerMm = <%= @px_per_mm %>;
        #     const fontDefaultPx = <%= @default_font_px %>;
        #     const fontDefaultPt = <%= @default_font_pt %>;
        #
        #     const sizeConfig = labelSizes[labelConfig.labelDimension];
        loader = Config.config.label_json ? "LabelDesigner.load(#{Config.config.label_json});" : ''
        # eval(Erubi::Engine.new(<<~JS).src).encode('UTF-8').freeze

        help_url = Config.config.help_url ? "'#{Config.config.help_url}'" : 'undefined'
        <<~JS.encode('UTF-8').freeze
          <script>
            const labelConfig = {
              labelName: '#{Config.config.label_name}',
              width: #{Config.config.width},
              height: #{Config.config.height},
              labelDimension: '#{Config.config.label_dimension}',
              pxPerMm: #{px_per_mm},
              helpURL: #{help_url},
              savePath: '#{Config.config.save_path}',
            };

            /*
             * CHECK IF THE USER IS LEAVING THE PAGE WITHOUT SAVING
             */
            window.addEventListener('beforeunload', (event) => {
              if (LabelDesigner.changesMade()) {
                event.returnValue = 'Unsaved changes. Are you sure you want to leave?';
              }
              // if (LabelDesigner.hasUnsetVariables()) {
              //   event.returnValue = 'Some variables have not been set. Are you sure you want to leave?';
              // }
            });

            LabelDesigner.init(labelConfig);
            #{loader}
          </script>
        JS
        # eval(Erubi::Engine.new(<<~JS).src).encode('UTF-8').freeze
        #   <script>
        #     let MyLabel;
        #     let Library;
        #     let Canvas;
        #     let Clipboard;
        #     let DrawApp;
        #     let Positioner;
        #     let UndoEngine;
        #     let UndoRedoModule;
        #     // let LabelOptions;
        #     // let Shortcuts;
        #     let ImageUploader;
        #     let MyImages;
        #     let VariableSettings;
        #     let TextSettings;
        #     // let Shape;
        #     // let Label;
        #
        #     const labelConfig = <%= @label_config %>;
        #     const labelSizes = <%= @label_sizes %>;
        #     const fontSizes = <%= @font_sizes_json %>;
        #     // const labelVariableTypes = <%= @label_variable_types_json %>;
        #     const pxPerMm = <%= @px_per_mm %>;
        #     const fontDefaultPx = <%= @default_font_px %>;
        #     const fontDefaultPt = <%= @default_font_pt %>;
        #
        #     const sizeConfig = labelSizes[labelConfig.labelDimension];
        #     let MyLabelSize = {
        #       width: ((sizeConfig.width !== undefined) ? (sizeConfig.width -1) * pxPerMm : 700),
        #       height: ((sizeConfig.height !== undefined) ? (sizeConfig.height -1) * pxPerMm : 500),
        #     };
        #
        #     const drawEnv = {
        #       shifted: false,
        #       controlled: false,
        #       changesMade: false,
        #     };
        #
        #     /*
        #      * CHECK IF THE USER IS LEAVING THE PAGE WITHOUT SAVING
        #      */
        #     window.addEventListener('beforeunload', (event) => {
        #       if (drawEnv.changesMade) {
        #         event.returnValue = 'Unsaved changes. Are you sure you want to leave?';
        #       }
        #     });
        #
        #
        #     (function () {
        #       #{file_content}
        #     }());
        #   </script>
        # JS
      end

      def css
        @pixel_per_millimeter = px_per_mm
        file_content = ''
        [
          'assets/ruler.css',
          'assets/label_design.css'
        ].each do |filename|
          file = File.join(File.dirname(__FILE__), filename)
          file_content << File.read(file, encoding: 'UTF-8')
        end
        eval(Erubi::Engine.new(<<~CSS).src).encode('UTF-8').freeze
          <style>
            #{file_content}
          </style>
        CSS
      end
    end
  end
end
