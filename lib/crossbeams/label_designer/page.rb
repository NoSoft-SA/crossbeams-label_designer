module Crossbeams
  module LabelDesigner
    class Page
      def initialize(file_to_load = nil)
        @file_to_load = file_to_load || 'new'
      end

      def px_per_mm
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
        loader = Config.config.label_json ? "LabelDesigner.load(#{Config.config.label_json});" : ''

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
            });

            LabelDesigner.init(labelConfig);
            #{loader}
          </script>
        JS
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
