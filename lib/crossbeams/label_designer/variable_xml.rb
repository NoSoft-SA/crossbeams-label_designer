module Crossbeams
  module LabelDesigner
    # Parse the JSON from a label design and generate XML that describes the variables.
    class VariableXML
      attr_reader :formatted_name, :label_def, :var_cnt, :font_sizes, :px_per_mm

      def initialize(formatted_name, px_per_mm, label_def)
        @formatted_name = formatted_name
        @label_def = label_def
        @var_cnt = label_def[:nodes].select { |node| node[:name] == 'variableBox' && node[:varAttrs][:staticValue].nil? }.length
        @px_per_mm = px_per_mm.to_i
        @font_sizes = @px_per_mm == 12 ? Constants::FONT_SIZES_12PXMM : Constants::FONT_SIZES_8PXMM
      end

      def to_xml(pretty: false) # rubocop:disable Metrics/AbcSize
        builder = Nokogiri::XML::Builder.new do |xml| # rubocop:disable Metrics/BlockLength
          xml.nsld_schema do # rubocop:disable Metrics/BlockLength
            xml.labels do # rubocop:disable Metrics/BlockLength
              xml.label do # rubocop:disable Metrics/BlockLength
                xml.image_description do
                  xml.image_filename "#{formatted_name}.png"
                  xml.image_width label_def[:width] + px_per_mm
                  xml.image_height label_def[:height] + px_per_mm
                  xml.variable_count var_cnt
                  xml.orientation 'landscape'
                  xml.label_version 2
                end
                var_id = 0
                xml.variables do
                  label_def[:nodes].select { |n| n[:name] == 'variableBox' }.each do |node|
                    # Convert decimal dimensions to ints
                    node[:x] = node[:x].round
                    node[:y] = node[:y].round
                    node[:width] = node[:width].round
                    node[:height] = node[:height].round

                    var_id += 1
                    if node[:varAttrs][:staticValue].nil?
                      xml.variable do
                        xml.id var_id
                        xml.variable_field_count node[:variableNumber]
                        variable_xml(xml, node)
                      end
                    else
                      xml.static_barcode do
                        xml.id var_id
                        xml.static_value node[:varAttrs][:staticValue]
                        variable_xml(xml, node)
                      end
                    end
                  end
                end
              end
            end
          end
        end
        if pretty
          builder.to_xml(save_with: Nokogiri::XML::Node::SaveOptions::NO_EMPTY_TAGS | Nokogiri::XML::Node::SaveOptions::FORMAT)
        else
          builder.to_xml(save_with: Nokogiri::XML::Node::SaveOptions::NO_EMPTY_TAGS | Nokogiri::XML::Node::SaveOptions::AS_XML)
        end
      end

      private

      def variable_xml(xml, node) # rubocop:disable Metrics/AbcSize
        xml.variable_type node[:varType]
        xml.rotation_angle node[:rotation]
        xml.startx node[:x]
        xml.starty node[:y]

        # Baseline is calculated as dropping the line from Y by the cap height (distance from font's top to baseline).
        # Here we calculate cap height using the cap-height-ratio for each font:
        # Arial: 0.72
        # Courier: 0.635
        # Times: 0.66
        cap_height = case node[:fontFamily]
                     when 'Arial'
                       (node[:fontSize] * 0.72).round
                     when 'Times New Roman'
                       (node[:fontSize] * 0.63).round
                     when 'Courier New'
                       (node[:fontSize] * 0.66).round
                     else
                       node[:fontSize]
                     end
        case node[:rotation]
        when 90
          xml.baseline_x node[:x] - cap_height
          xml.baseline_y node[:y]
        when 180
          xml.baseline_x node[:x]
          xml.baseline_y node[:y] - cap_height
        when 270
          xml.baseline_x node[:x] + cap_height
          xml.baseline_y node[:y]
        else
          xml.baseline_x node[:x]
          xml.baseline_y node[:y] + cap_height
        end
        xml.width node[:width]
        xml.height node[:height]
        xml.white_on_black node[:varAttrs][:whiteOnBlack]
        xml.fontsize_px node[:fontSize]
        xml.fontsize_pt font_sizes[node[:fontSize]]
        xml.align node[:align]
        xml.fontfamily node[:fontFamily]
        xml.bold node[:fontStyle].include?('bold')
        xml.italic node[:fontStyle].include?('italic')
        xml.underline node[:textDecoration] == 'underline'
        xml.barcode node[:varAttrs][:barcode]
        xml.barcodetext node[:varAttrs][:barcodeText]
        xml.barcodetop node[:varAttrs][:barcodeTop]
        xml.barcodewidthfactor node[:varAttrs][:barcodeWidthFactor].to_f
        xml.barcode_symbology node[:varAttrs][:barcodeSymbology]
        xml.error_level node[:varAttrs][:barcodeErrorLevel]
      end
    end
  end
end
