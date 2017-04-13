module Crossbeams
  module LabelDesigner
    class Page
      def initialize(file_to_load=nil)
        @file_to_load = file_to_load || 'new'
      end

      # Use something like these 2 methods if we need to be able to override in the host app.
      # - might be required in a multitenancy app, but probably not otherwise.
      def json_load_path=(value)
        @json_load_path = value
      end
      def json_load_path
        @json_load_path || Config.config.json_load_path
      end

      # This can be changed to load the html from a file
      # and then use erb to apply the config:
      #    require 'erubi'
      #    str = Erubi::Engine.new(File.load(...))
      #    eval(str.src)
      def render
        <<-EOS.freeze
        <div id="label_designer">
          <h1>An embedded area</h1>
          <p>This tests the loading of a few "pages"</p>
          <p>To test, pass one of the following values for the file to load:
          <ul>
          <li>leave blank - simulates loading a new canvas</li>
          <li><em>blue</em> - simulates loading file 1</li>
          <li><em>green</em> - simulates loading file 2</li>
          </ul>
          <div id="workspace">
            <span class="#{@file_to_load}">Loaded file: <strong>#{@file_to_load}</strong></span>
            <p>This is clickable. The JSON load path is set to <em>#{json_load_path}</em></p>
          </div>
        </div>
        EOS
      end

      def javascript
        <<-EOS.freeze
        <script type="text/javascript">

          var label_variables = #{Config.config.label_variables.to_json}; // Load JSON vars
          var file_to_load = '#{@file_to_load}';

          var theBox = document.getElementById('workspace');
          theBox.addEventListener('click', function (event) {
            alert('I was clicked');
          })
        </script>
        EOS
      end

      def css
        <<-EOS.freeze
        <style>
        #label_designer {
          padding: 0 1em;
        }
        #workspace {
          padding: 2em;
          border: thin solid #999;
        }
        .new {
          color:black;
        }
        .blue {
          color: blue;
        }
        .green {
          color: green;
        }
        </style>
        EOS
      end
    end
  end
end
